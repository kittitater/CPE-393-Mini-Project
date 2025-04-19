import uuid

from fastapi import APIRouter, Depends, Header, HTTPException
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import BackgroundTasks, Request

from app.utils import emailer, audit
from app.core.config import settings
from app.db import models
from app.db.session import get_db

router = APIRouter()


async def current_user_id(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Bad auth scheme")

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        return int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.get("/candidates")
async def list_candidates(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(models.Candidate))
    return res.scalars().all()


@router.post("/cast")
async def cast_vote(
    candidate_id: int,
    user_id: int = Depends(current_user_id),
    db: AsyncSession = Depends(get_db),
):
    # Check candidate & election
    res = await db.execute(
        select(models.Candidate).where(models.Candidate.id == candidate_id)
    )
    cand = res.scalar()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if not cand.election.is_open:
        raise HTTPException(status_code=400, detail="Election closed")

    # Prevent duplicate vote in same election
    dup = await db.execute(
        select(models.Vote)
        .join(models.Candidate)
        .where(
            models.Vote.user_id == user_id,
            models.Candidate.election_id == cand.election_id,
        )
    )
    if dup.scalar():
        raise HTTPException(status_code=400, detail="Already voted in this election")

    receipt = uuid.uuid4().hex[:12].upper()
    vote = models.Vote(user_id=user_id, candidate_id=candidate_id, receipt=receipt)
    db.add(vote)
    await db.commit()
    return {"receipt": receipt}



@router.get("/verify")
async def verify(receipt: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(models.Vote).where(models.Vote.receipt == receipt))
    return {"valid": bool(res.scalar())}
