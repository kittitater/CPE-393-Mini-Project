from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings

def create_token(sub: str, minutes: int = settings.ACCESS_TOKEN_EXPIRE_MINUTES):
    expire = datetime.utcnow() + timedelta(minutes=minutes)
    return jwt.encode({"sub": sub, "exp": expire}, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
