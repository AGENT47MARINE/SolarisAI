"""
Centralised settings via pydantic BaseSettings.
Reads from .env file and environment variables.
"""

from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    app_name: str = "SolarisAI Backend"
    debug: bool = True

    # Database
    database_url: str = "sqlite+aiosqlite:///./solaris.db"

    # Redis (optional — in-memory fallback if unavailable)
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    jwt_secret: str = "dev-secret-change-in-prod-immediately"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    # Anthropic (Claude) for LLM intent parsing
    anthropic_api_key: str = ""

    # STT provider: "whisper_local" | "browser" (use browser Web Speech API)
    stt_provider: str = "browser"

    # Feature flags
    voice_enabled: bool = True
    nav_suggestions_enabled: bool = True

    # MLflow
    mlflow_tracking_uri: str = "http://localhost:5000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
