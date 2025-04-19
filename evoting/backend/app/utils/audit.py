# backend/app/utils/audit.py
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import models

async def log(request: Request, db: AsyncSession, event: str, user_id: int | None):
    ip = request.client.host if request.client else None
    db.add(models.AuditLog(user_id=user_id, event=event, ip=ip))
    await db.commit()