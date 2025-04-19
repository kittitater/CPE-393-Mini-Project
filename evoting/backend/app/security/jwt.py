from datetime import datetime, timedelta
from jose import jwt

from app.core.config import settings


def create_token(sub: str, is_admin: bool = False) -> str:
    exp = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": sub, "adm": is_admin, "exp": exp}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
