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

Create a Railway service from the GitHub repository and set its root directory to `backend`. Select Dockerfile deployment. Add the variables below in Railway's Variables panel. Railway supplies the listening port; the container listens on 8000 (configure the service's exposed port as 8000 if required by the project settings).

## Qrail provider configuration

The published Qrail developer page documents the base URL `https://qrail.in/api`, API versions `/v3` and `/v4`, and this running-status example:

```text
GET /v3/trains/running/12393/today/YOUR_API_KEY
```

The adapter supports documented path placeholders such as `{train_number}` and `{api_key}`. When `{api_key}` is present in a path template, the key is inserted as a URL path segment and is not also sent in an Authorization header. Example configuration for the published running-status route:

```env
RAILWAY_PROVIDER_BASE_URL=https://qrail.in/api
RAILWAY_LIVE_STATUS_PATH=v3/trains/running/{train_number}/today/{api_key}
```

Qrail lists PNR status, train-between-stations and train schedule in its Free plan; running status and live station are listed under Pro; fare and availability are listed under Business. Verify the active plan and account-specific API docs before enabling each feature.

Only configure the remaining paths after confirming their exact route and parameter names in Qrail's API documentation. Do not guess endpoint paths or scrape the website.

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

The API paths and query parameter mapping are provider-specific. The adapter returns 503 when a route or credential is not configured, rather than fabricating railway data.

## Performance design

- Async FastAPI + HTTPX for concurrent upstream I/O.
- Explicit connect/request timeouts.
- Optional Redis cache: station lookups 60s, journey search 15s, live status and availability 5s. PNR responses are not cached.
- Per-process request throttling is included as a fallback. Put a Redis-backed limiter or API gateway in front for multi-replica deployments.
- Cache failure does not break railway lookups.

## Current scope / not yet production-ready

This backend currently provides read-only railway gateway routes. It does **not** implement user JWT verification, database persistence, booking/seat holds, payment creation/webhooks, cancellation/refunds, notifications or ticket issuance. Those require the Supabase schema/RLS migration, provider documentation and payment merchant sandbox credentials. Do not expose booking/payment actions until those controls and integration tests are complete.

The existing `engine/` C++17 code is a concurrency prototype, not a persistent inventory authority. Keep PostgreSQL transactions as the source of truth; only deploy a separate C++ service if profiling shows a measured need.
