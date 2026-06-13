from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Assured Pay API"
    app_version: str = "0.1.0"
    environment: str = "development"
    api_prefix: str = "/api"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    host: str = "0.0.0.0"
    port: int = 8000
    buffer_amount_inr: int = 7
    small_excess_ceiling_inr: int = 10
    suspicious_threshold_inr: int = 25
    settlement_policy_version: str = "0.1.0"
    grace_period_days: int = 7
    max_unpaid_before_hard_block: int = 2
    dispute_window_hours: int = 24

    # Grok / xAI (P14 — copy assist only; never used for settlement)
    grok_api_key: str = ""
    grok_copy_enabled: bool = False
    grok_api_base_url: str = "https://api.x.ai/v1"
    grok_model: str = "grok-3-mini"

    @property
    def grok_configured(self) -> bool:
        return self.grok_copy_enabled and bool(self.grok_api_key.strip())

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
