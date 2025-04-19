import os
from pydantic import BaseSettings, PostgresDsn

class Settings(BaseSettings):
    DATABASE_URL: PostgresDsn = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/evoting")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecret")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    OTP_TTL_SEC: int = 300
    class Config:
        case_sensitive = True

settings = Settings()
