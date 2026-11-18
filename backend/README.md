# RAILNOVA FastAPI backend

This is an isolated backend service. It does not modify or replace the Next.js frontend.

## Run locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

- Health: `GET /health`
- Readiness: `GET /ready`
- OpenAPI docs: `/docs`

## Deploy as a Railway service

Create a new Railway service from the GitHub repository and set its root directory to `backend`. Select Dockerfile deployment. Add the variables below in Railway's Variables panel. Railway supplies the listening port; the container listens on 8000 (configure the service's exposed port as 8000 if required by the project settings).

## Required provider configuration

Only connect a railway data/ticket provider for which RAILNOVA has documented, authorised API access. Do not scrape or reverse engineer restricted endpoints.

| Variable | Purpose |
|---|---|
| `RAILWAY_PROVIDER_BASE_URL` | Provider's documented API base URL |
| `RAILWAY_PROVIDER_API_KEY` | Secret API credential; server-side only |
| `RAILWAY_PROVIDER_AUTH_HEADER` | Auth header name (default Authorization) |
| `RAILWAY_PROVIDER_AUTH_SCHEME` | Auth scheme (default Bearer; use empty if provider requires raw key) |
| `RAILWAY_STATION_SEARCH_PATH` | Documented station-search route |
| `RAILWAY_SEARCH_PATH` | Documented train/journey-search route |
| `RAILWAY_PNR_PATH` | Documented PNR enquiry route |
| `RAILWAY_LIVE_STATUS_PATH` | Documented train-running-status route |
| `RAILWAY_AVAILABILITY_PATH` | Documented seat-availability route |
| `REDIS_URL` | Optional Redis connection URL for short-lived read caching |
| `CORS_ORIGINS` | Comma-separated exact frontend origins |

The API paths and query parameter mapping are provider-specific. The current adapter uses common parameter names as a starting contract; it must be mapped to the provider's official documentation before production use. It deliberately returns 503 when a route or credential is not configured, rather than fabricating railway data.

## Performance design

- Async FastAPI + HTTPX for concurrent upstream I/O.
- Explicit connect/request timeouts.
- Optional Redis cache: station lookups 60s, journey search 15s, live status and availability 5s. PNR responses are not cached.
- Per-process request throttling is included as a fallback. Put a Redis-backed limiter or API gateway in front for multi-replica deployments.
- Cache failure does not break railway lookups.

## Current scope / not yet production-ready

This first backend foundation exposes read-only railway gateway routes. It does **not** yet implement user JWT verification, database persistence, booking/seat holds, payment creation/webhooks, cancellation/refunds, notifications or ticket issuance. Those require the Supabase schema/RLS migration, provider documentation and payment merchant sandbox credentials. Do not expose booking/payment actions until those controls and integration tests are complete.

The existing `engine/` C++17 code is a concurrency prototype, not a persistent inventory authority. Keep PostgreSQL transactions as the source of truth; only deploy a separate C++ service if profiling shows a measured need.

## PNR account requirement

`GET /v1/pnr/{pnr}` requires a valid Supabase Auth access token in the
`Authorization: Bearer <access_token>` header. The API validates the token
against the Supabase Auth `/auth/v1/user` endpoint before contacting the
railway provider. Missing or expired sessions receive HTTP 401; if Supabase
Auth cannot be reached or its verification configuration is missing, the API
fails closed with HTTP 503. The Next.js API proxy forwards an incoming
Authorization header to the backend. The browser caller must attach the
current signed-in user's access token; never accept a user ID or email supplied
in the request as proof of login.

Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the backend host's secret
variables. Use the public/publishable (anon) key, not a service-role key.
