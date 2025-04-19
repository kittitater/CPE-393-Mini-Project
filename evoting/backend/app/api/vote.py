import uuid
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import jwt, JWTError
from app.db.session import get_db
from app.db import models
from app.schemas import vote as schemas
from app.core.config import settings

router = APIRouter()

def get_user(token: str = Header(..., alias="Authorization")):
    try:
        scheme, _, param = token.partition(" ")
        payload = jwt.decode(param, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        return int(payload["sub"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid JWT")

@router.post("/cast")
async def cast(body: schemas.VoteIn, user_id: int = Depends(get_user), db: AsyncSession = Depends(get_db)):
    # Check duplicate vote
    res = await db.execute(select(models.Vote).where(models.Vote.user_id == user_id))
    if res.scalar():
        raise HTTPException(status_code=400, detail="Already voted")
    receipt = str(uuid.uuid4())
    vote = models.Vote(user_id=user_id, candidate_id=body.candidate_id, receipt=receipt)
    db.add(vote)
    await db.commit()
    return {"receipt": receipt}

@router.get("/verify/{receipt}")
async def verify(receipt: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(models.Vote).where(models.Vote.receipt == receipt))
    v = res.scalar()
    return {"valid": bool(v)}
