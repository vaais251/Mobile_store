"""
PhoneMarket — Application Configuration.

All settings are loaded from environment variables via pydantic-settings.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration loaded from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ─── Application ──────────────────────────
    APP_NAME: str = "PhoneMarket"
    DEBUG: bool = False
    SECRET_KEY: str = "CHANGE-ME"
    API_V1_PREFIX: str = "/api/v1"

    # ─── JWT / Auth ───────────────────────────
    JWT_SECRET_KEY: str = "CHANGE-ME-JWT-SECRET"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # ─── Database ─────────────────────────────
    DATABASE_URL: str = (
        "postgresql+asyncpg://phonemarket_user:phonemarket_dev_pass_2026"
        "@db:5432/phonemarket_db"
    )

    # ─── CORS ─────────────────────────────────
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
    ]


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (singleton)."""
    return Settings()
