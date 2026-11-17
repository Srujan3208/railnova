"""Server-side adapter for an authorised railway provider, with optional Redis caching."""
from typing import Any
from urllib.parse import quote, urljoin, urlsplit
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
            self._redis = Redis.from_url(
                self.settings.redis_url,
                decode_responses=True,
                socket_connect_timeout=1,
                socket_timeout=1,
            )

    def _url(self, path: str) -> str:
        if not self.settings.railway_provider_base_url or not self.settings.railway_provider_api_key or not path:
            raise ProviderNotConfigured(
                "Authorised railway provider credentials and endpoint mapping are not configured."
            )
        return urljoin(
            self.settings.railway_provider_base_url.rstrip("/") + "/",
            path.lstrip("/"),
        )

    def _build_target(self, path: str, params: dict[str, Any]) -> tuple[str, dict[str, Any], bool]:
        """Expand documented path placeholders, including providers that put API keys in paths."""
        original_path = path
        path_values = {**params, "api_key": self.settings.railway_provider_api_key}
        consumed: set[str] = set()

        for name, value in path_values.items():
            placeholder = "{" + name + "}"
            if placeholder in path:
                path = path.replace(placeholder, quote(str(value), safe=""))
                consumed.add(name)

        if "{api_key}" in path or any("{" + name + "}" in path for name in params):
            raise ProviderNotConfigured("A configured provider path contains an unresolved path parameter.")

        key_in_path = "{api_key}" in original_path
        query_params = {key: value for key, value in params.items() if key not in consumed}
        return self._url(path), query_params, key_in_path

    async def request(
        self,
        path: str,
        params: dict[str, Any],
        cache_ttl: int = 0,
        method: str = "GET",
    ) -> Any:
        """Call a configured provider endpoint using GET query params or POST JSON."""
        method = method.upper()
        if method not in {"GET", "POST"}:
            raise ProviderNotConfigured("Unsupported provider HTTP method.")
        url, query_params, key_in_path = self._build_target(path, params)
        cache_key = None
        if self._redis and cache_ttl > 0:
            digest = hashlib.sha256(
                json.dumps([method, path, query_params], sort_keys=True).encode()
            ).hexdigest()
            cache_key = f"railnova:provider:{digest}"
            try:
                cached = await self._redis.get(cache_key)
                if cached:
                    return json.loads(cached)
            except Exception:
                pass

        headers = {"Accept": "application/json"}
        if not key_in_path:
            scheme = self.settings.railway_provider_auth_scheme.strip()
            token = self.settings.railway_provider_api_key
            auth_value = f"{scheme} {token}".strip() if scheme else token
            headers[self.settings.railway_provider_auth_header] = auth_value

        timeout = httpx.Timeout(self.settings.request_timeout_seconds, connect=3.0)
        try:
            async with httpx.AsyncClient(timeout=timeout, follow_redirects=False) as client:
                current_url = url
                current_params: dict[str, Any] | None = query_params
                response = None
                for redirect_count in range(4):
                    if method == "POST":
                        response = await client.post(
                            current_url,
                            json=query_params,
                            headers={**headers, "Content-Type": "application/json"},
                        )
                    else:
                        response = await client.get(current_url, params=current_params, headers=headers)
                    current_params = None
                    if response.status_code not in (301, 302, 303, 307, 308):
                        break
                    location = response.headers.get("location")
                    if not location:
                        raise ProviderError("Railway provider returned a redirect without a Location header.")
                    next_url = urljoin(str(response.url), location)
                    # The API key may be embedded in the path. Never forward it to another host.
                    if urlsplit(next_url).hostname != urlsplit(url).hostname:
                        # Report only the destination hostname; never expose a path that may contain the API key.
                        destination_host = urlsplit(next_url).hostname or "unknown"
                        raise ProviderError(
                            f"Railway provider redirected to host '{destination_host}'. "
                            "Set RAILWAY_PROVIDER_BASE_URL to the provider's canonical API host."
                        )
                    if redirect_count == 3:
                        raise ProviderError("Railway provider exceeded the redirect limit.")
                    current_url = next_url

                assert response is not None
                response.raise_for_status()
                try:
                    payload = response.json()
                except ValueError as exc:
                    content_type = response.headers.get("content-type", "unknown").split(";")[0]
                    response_host = urlsplit(str(response.url)).hostname or "unknown"
                    raise ProviderError(
                        "Railway provider returned a non-JSON response "
                        f"(HTTP {response.status_code}, content-type '{content_type}', host '{response_host}'). "
                        "Verify the Qrail endpoint path, API-key validity, and subscription access."
                    ) from exc
                if cache_key:
                    try:
                        await self._redis.set(
                            cache_key,
                            json.dumps(payload, separators=(",", ":")),
                            ex=cache_ttl,
                        )
                    except Exception:
                        pass
                return payload
        except httpx.TimeoutException as exc:
            raise ProviderError("Railway provider timed out.") from exc
        except httpx.HTTPStatusError as exc:
            allowed_methods = exc.response.headers.get("allow")
            provider_host = exc.request.url.host or "unknown"
            detail = (
                f"Railway provider returned HTTP {exc.response.status_code} "
                f"to {exc.request.method} on host '{provider_host}'."
            )
            if allowed_methods:
                detail += f" Allowed methods: {allowed_methods}."
            raise ProviderError(detail) from exc
        except (httpx.HTTPError, ValueError) as exc:
            raise ProviderError(
                "Railway provider request failed or returned invalid JSON."
            ) from exc

    async def close(self) -> None:
        if self._redis:
            await self._redis.aclose()
