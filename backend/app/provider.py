"""Server-side adapter for an authorised railway inventory/data provider.

Endpoint paths and auth format are deliberately configuration-driven. Do not
guess undocumented provider routes or scrape restricted railway endpoints.
"""
from typing import Any
from urllib.parse import urljoin
import httpx
from .config import get_settings

class ProviderNotConfigured(RuntimeError):
    pass

class ProviderError(RuntimeError):
    pass

class RailwayProvider:
    def __init__(self) -> None:
        self.settings = get_settings()

    def _url(self, path: str) -> str:
        if not self.settings.railway_provider_base_url or not self.settings.railway_provider_api_key or not path:
            raise ProviderNotConfigured("Authorised railway provider credentials and endpoint mapping are not configured.")
        return urljoin(self.settings.railway_provider_base_url.rstrip("/") + "/", path.lstrip("/"))

    async def request(self, path: str, params: dict[str, Any]) -> Any:
        url = self._url(path)
        scheme = self.settings.railway_provider_auth_scheme.strip()
        token = self.settings.railway_provider_api_key
        auth_value = f"{scheme} {token}".strip() if scheme else token
        headers = {self.settings.railway_provider_auth_header: auth_value, "Accept": "application/json"}
        timeout = httpx.Timeout(self.settings.request_timeout_seconds, connect=3.0)
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(url, params=params, headers=headers)
                response.raise_for_status()
                return response.json()
        except httpx.TimeoutException as exc:
            raise ProviderError("Railway provider timed out.") from exc
        except httpx.HTTPStatusError as exc:
            # Never return upstream response bodies; they may contain sensitive data.
            raise ProviderError(f"Railway provider returned HTTP {exc.response.status_code}.") from exc
        except (httpx.HTTPError, ValueError) as exc:
            raise ProviderError("Railway provider request failed or returned invalid JSON.") from exc
