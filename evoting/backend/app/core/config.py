# backend/app/core/config.py
import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import PostgresDsn, AnyHttpUrl
from phe import paillier

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CORS_ORIGINS: str
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASS: str
    EMAIL_FROM: str
    AUDIT_EXPORT_SECRET: str

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()

# Generate Paillier key pair at startup (in a real system, manage keys securely)
settings.PAILLIER_PUBLIC_KEY, settings.PAILLIER_PRIVATE_KEY = paillier.generate_paillier_keypair()