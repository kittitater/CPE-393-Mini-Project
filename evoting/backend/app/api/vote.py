# backend/app/api/vote.py
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.config import settings
from app.db import models
from app.db.session import get_db
from app.utils import audit
from app.security import jwt as jwt_utils
from phe import paillier
import uuid

router = APIRouter(tags=["vote"])

@router.get("/elections")
async def list_open_elections(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(models.Election).where(models.Election.is_open == True))
    return [{"id": e.id, "name": e.name} for e in res.scalars().all()]

@router.get("/candidates")
async def list_candidates(election_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(models.Candidate).where(models.Candidate.election_id == election_id))
    return [{"id": c.id, "name": c.name} for c in res.scalars().all()]

@router.post("/cast")
async def cast_vote(
    candidate_id: int,
    user_id: int = Depends(jwt_utils.current_user_id),
    db: AsyncSession = Depends(get_db)
):
    # Verify candidate and election
    res = await db.execute(select(models.Candidate).where(models.Candidate.id == candidate_id))
    cand = res.scalar()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    if not cand.election.is_open:
        raise HTTPException(status_code=400, detail="Election closed")
    election_id = cand.election_id

    # Check for duplicate votes
    dup = await db.execute(
        select(models.Vote).where(models.Vote.user_id == user_id, models.Vote.election_id == election_id)
    )
    if dup.scalar():
        raise HTTPException(status_code=400, detail="Already voted in this election")

    # Get all candidates for the election
    candidates_res = await db.execute(
        select(models.Candidate).where(models.Candidate.election_id == election_id)
    )
    candidates = candidates_res.scalars().all()

    # Create vote record with receipt
    receipt = uuid.uuid4().hex[:12].upper()
    vote = models.Vote(user_id=user_id, election_id=election_id, receipt=receipt)
    db.add(vote)
    await db.commit()
    await db.refresh(vote)

    # Encrypt votes using Paillier
    public_key = settings.PAILLIER_PUBLIC_KEY
    for cand in candidates:
        encrypted_value = public_key.encrypt(1 if cand.id == candidate_id else 0)
        encrypted_str = f"{encrypted_value.ciphertext()},{encrypted_value.exponent}"
        evv = models.EncryptedVoteValue(vote_id=vote.id, candidate_id=cand.id, encrypted_value=encrypted_str)
        db.add(evv)
    await db.commit()
    return {"receipt": receipt}

@router.get("/verify")
async def verify(receipt: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(models.Vote).where(models.Vote.receipt == receipt))
    return {"valid": bool(res.scalar())}