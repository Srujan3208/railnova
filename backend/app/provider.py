"""Server-side adapter for an authorised railway provider, with optional Redis caching."""
from typing import Any
from urllib.parse import urljoin
import hashlib
import json
import httpx
from redis.asyncio import Redis
from .config import get_settings

class ProviderNotConfigured(RuntimeError):
    pass

class ProviderError(RuntimeError):
    pass

class RailwayProvider:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._redis: Redis | None = None
        if self.settings.redis_url:
            self._redis = Redis.from_url(self.settings.redis_url, decode_responses=True, socket_connect_timeout=1, socket_timeout=1)

    def _url(self, path: str) -> str:
        if not self.settings.railway_provider_base_url or not self.settings.railway_provider_api_key or not path:
            raise ProviderNotConfigured("Authorised railway provider credentials and endpoint mapping are not configured.")
        return urljoin(self.settings.railway_provider_base_url.rstrip("/") + "/", path.lstrip("/"))

    async def request(self, path: str, params: dict[str, Any], cache_ttl: int = 0) -> Any:
        url = self._url(path)
        cache_key = None
        if self._redis and cache_ttl > 0:
            digest = hashlib.sha256(json.dumps([path, params], sort_keys=True).encode()).hexdigest()
            cache_key = f"railnova:provider:{digest}"
            try:
                cached = await self._redis.get(cache_key)
                if cached:
                    return json.loads(cached)
            except Exception:
                # Cache outages must not take down railway lookups.
                pass
        scheme = self.settings.railway_provider_auth_scheme.strip()
        token = self.settings.railway_provider_api_key
        auth_value = f"{scheme} {token}".strip() if scheme else token
        headers = {self.settings.railway_provider_auth_header: auth_value, "Accept": "application/json"}
        timeout = httpx.Timeout(self.settings.request_timeout_seconds, connect=3.0)
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(url, params=params, headers=headers)
                response.raise_for_status()
                payload = response.json()
                if cache_key:
                    try:
                        await self._redis.set(cache_key, json.dumps(payload, separators=(",", ":")), ex=cache_ttl)
                    except Exception:
                        pass
                return payload
        except httpx.TimeoutException as exc:
            raise ProviderError("Railway provider timed out.") from exc
        except httpx.HTTPStatusError as exc:
            raise ProviderError(f"Railway provider returned HTTP {exc.response.status_code}.") from exc
        except (httpx.HTTPError, ValueError) as exc:
            raise ProviderError("Railway provider request failed or returned invalid JSON.") from exc

    async def close(self) -> None:
        if self._redis:
            await self._redis.aclose()
