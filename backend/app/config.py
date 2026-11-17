from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    railway_provider_base_url: str = ""
    railway_provider_api_key: str = ""
    railway_provider_auth_header: str = "Authorization"
    railway_provider_auth_scheme: str = "Bearer"
    railway_search_path: str = ""
    railway_train_details_path: str = ""
    railway_station_search_path: str = ""
    railway_pnr_path: str = ""
    railway_live_status_path: str = ""
    railway_availability_path: str = ""
    redis_url: str = ""
    cors_origins: str = "https://railnova-phi.vercel.app"
    request_timeout_seconds: float = 12.0
    rate_limit_per_minute: int = 90

    @property
    def allowed_origins(self) -> list[str]:
        return [v.strip() for v in self.cors_origins.split(",") if v.strip()]

@lru_cache
def get_settings() -> Settings:
    return Settings()
