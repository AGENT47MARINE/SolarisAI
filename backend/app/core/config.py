from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    app_name: str = "SolarisAI Backend"
    debug: bool = True
    database_url: str = "sqlite+aiosqlite:///./solaris.db"
    # For PostgreSQL: "postgresql+asyncpg://user:password@localhost/solaris"

    class Config:
        env_file = ".env"


settings = Settings()
