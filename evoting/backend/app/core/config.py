import os
from typing import List, ClassVar
from pydantic_settings import BaseSettings
from app.core.crypto import crypto_settings  # Import your crypto keys from here

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

    # ✅ FIXED: Annotate as ClassVar so pydantic doesn't try to treat it as a field
    PAILLIER_PUBLIC_KEY: ClassVar = crypto_settings.PAILLIER_PUBLIC_KEY
    PAILLIER_PRIVATE_KEY: ClassVar = crypto_settings.PAILLIER_PRIVATE_KEY

    class Config:
        env_file = "dot.env.local"
        case_sensitive = True

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
