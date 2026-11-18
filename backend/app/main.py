from contextlib import asynccontextmanager
from typing import Any
import time
import httpx
from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .config import get_settings
from .provider import RailwayProvider, ProviderNotConfigured, ProviderError

settings = get_settings()
provider = RailwayProvider()
_windows: dict[str, list[float]] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await provider.close()
    _windows.clear()

app = FastAPI(
    title="RAILNOVA API",
    version="1.0.0",
    description="Server-side railway provider gateway. Live railway data is returned only from an authorised configured provider.",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Idempotency-Key"],
)

@app.middleware("http")
async def basic_rate_limit(request: Request, call_next):
    # Per-process fallback limiter. Use Redis-backed gateway limits in multi-instance production.
    ip = request.client.host if request.client else "unknown"
    now = time.monotonic()
    bucket = [t for t in _windows.get(ip, []) if now - t < 60]
    if len(bucket) >= settings.rate_limit_per_minute:
        return JSONResponse(status_code=429, content={"error": {"code": "RATE_LIMITED", "message": "Too many requests. Please retry shortly."}})
    bucket.append(now)
    _windows[ip] = bucket
    return await call_next(request)

async def require_authenticated_user(request: Request) -> dict[str, Any]:
    """Validate the caller's Supabase access token with Supabase Auth."""
    authorization = request.headers.get("authorization", "")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise HTTPException(
            status_code=401,
            detail={"code": "AUTH_REQUIRED", "message": "Sign in to a RAILNOVA account before checking PNR status."},
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(
            status_code=503,
            detail={"code": "AUTH_NOT_CONFIGURED", "message": "PNR account verification is temporarily unavailable."},
        )
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(5.0, connect=2.0)) as client:
            response = await client.get(
                settings.supabase_url.rstrip("/") + "/auth/v1/user",
                headers={
                    "apikey": settings.supabase_anon_key,
                    "Authorization": f"Bearer {token.strip()}",
                    "Accept": "application/json",
                },
            )
        if response.status_code == 401 or response.status_code == 403:
            raise HTTPException(
                status_code=401,
                detail={"code": "INVALID_SESSION", "message": "Your session is invalid or expired. Sign in again to check PNR status."},
                headers={"WWW-Authenticate": "Bearer"},
            )
        response.raise_for_status()
        user = response.json()
        if not isinstance(user, dict) or not user.get("id"):
            raise HTTPException(status_code=401, detail={"code": "INVALID_SESSION", "message": "A valid signed-in account is required."})
        return {"id": user["id"]}
    except HTTPException:
        raise
    except (httpx.HTTPError, ValueError):
        raise HTTPException(
            status_code=503,
            detail={"code": "AUTH_VERIFICATION_UNAVAILABLE", "message": "Could not verify your RAILNOVA session. Please retry shortly."},
        )

@app.exception_handler(ProviderNotConfigured)
async def provider_not_configured(_: Request, exc: ProviderNotConfigured):
    return JSONResponse(status_code=503, content={"error": {"code": "PROVIDER_NOT_CONFIGURED", "message": str(exc)}})

@app.exception_handler(ProviderError)
async def provider_error(_: Request, exc: ProviderError):
    return JSONResponse(status_code=502, content={"error": {"code": "RAILWAY_PROVIDER_ERROR", "message": str(exc)}})

@app.get("/health")
async def health():
    return {"status": "ok", "service": "railnova-api", "version": "1.0.0"}

@app.get("/ready")
async def ready():
    configured = bool(settings.railway_provider_base_url and settings.railway_provider_api_key)
    auth_configured = bool(settings.supabase_url and settings.supabase_anon_key)
    return {"status": "ready" if configured and auth_configured else "degraded", "railway_provider_configured": configured, "account_auth_configured": auth_configured}

@app.get("/v1/stations")
async def station_search(q: str = Query(min_length=2, max_length=80)):
    if not settings.railway_station_search_path:
        raise ProviderNotConfigured("Station-search endpoint mapping is not configured by the railway provider.")
    return await provider.request(settings.railway_station_search_path, {"q": q}, cache_ttl=60)

@app.get("/v1/journeys/search")
async def journey_search(
    origin: str = Query(min_length=2, max_length=12),
    destination: str = Query(min_length=2, max_length=12),
    journey_date: str = Query(pattern=r"^\\d{4}-\\d{2}-\\d{2}$"),
    travel_class: str | None = Query(default=None, max_length=8),
):
    if not settings.railway_search_path:
        raise ProviderNotConfigured("Journey-search endpoint mapping is not configured by the railway provider.")
    params: dict[str, Any] = {"from": origin, "to": destination, "date": journey_date}
    if travel_class:
        params["class"] = travel_class
    return await provider.request(settings.railway_search_path, params, cache_ttl=15)

@app.get("/v1/pnr/{pnr}")
async def pnr_status(pnr: str, user: dict[str, Any] = Depends(require_authenticated_user)):
    # The dependency validates the Supabase session before any provider enquiry is made.
    if not pnr.isdigit() or len(pnr) != 10:
        raise HTTPException(status_code=422, detail="PNR must contain exactly 10 digits.")
    if not settings.railway_pnr_path:
        raise ProviderNotConfigured("PNR endpoint mapping is not configured by the railway provider.")
    return await provider.request(settings.railway_pnr_path, {"pnr": pnr})

@app.get("/v1/trains/{train_number}/status")
async def live_train_status(train_number: str, journey_date: str | None = None):
    if not train_number.isdigit() or not 4 <= len(train_number) <= 6:
        raise HTTPException(status_code=422, detail="Invalid train number.")
    if not settings.railway_live_status_path:
        raise ProviderNotConfigured("Live-status endpoint mapping is not configured by the railway provider.")
    params = {"train_number": train_number}
    if journey_date:
        params["date"] = journey_date
    return await provider.request(settings.railway_live_status_path, params, cache_ttl=5)

@app.get("/v1/availability")
async def availability(
    train_number: str = Query(min_length=4, max_length=6),
    journey_date: str = Query(pattern=r"^\\d{4}-\\d{2}-\\d{2}$"),
    travel_class: str = Query(min_length=2, max_length=8),
    quota: str = Query(default="GN", max_length=8),
):
    if not settings.railway_availability_path:
        raise ProviderNotConfigured("Availability endpoint mapping is not configured by the railway provider.")
    return await provider.request(settings.railway_availability_path, {
        "train_number": train_number, "date": journey_date, "class": travel_class, "quota": quota
    }, cache_ttl=5)

@app.get("/")
async def root():
    return {"service": "RAILNOVA API", "docs": "/docs", "health": "/health"}
