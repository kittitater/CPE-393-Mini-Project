import os
from pydantic import BaseSettings, PostgresDsn


class Settings(BaseSettings):
    # ── runtime environment ────────────────────────────────────────────────────
    DATABASE_URL: PostgresDsn = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@db:5432/evoting",
    )
    JWT_SECRET: str = os.getenv("JWT_SECRET", "PLEASE_CHANGE_ME")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS", "http://localhost:3000,https://your-vercel-domain"
    )

    class Config:
        case_sensitive = True


    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER: str = os.getenv("SMTP_USER", "example@gmail.com")
    SMTP_PASS: str = os.getenv("SMTP_PASS", "password")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@evote.local")
    AUDIT_EXPORT_SECRET: str = os.getenv("AUDIT_EXPORT_SECRET", "exporttoken")
settings = Settings()
