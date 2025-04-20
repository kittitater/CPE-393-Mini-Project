# backend/app/api/vote.py

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.config import settings
from app.db import models
from app.db.session import get_db
from app.security import jwt as jwt_utils
from phe import paillier
import uuid
from app.utils.notify import notify_user_vote


router = APIRouter(tags=["vote"])


class VoteRequest(BaseModel):
    candidate_id: int


@router.get("/elections")
async def list_open_elections(db: AsyncSession = Depends(get_db)):
    try:
        res = await db.execute(select(models.Election).where(models.Election.is_open == True))
        elections = res.scalars().all()
        return [
            {
                "id": e.id,
                "name": e.name,
                "public_vote_time": e.public_vote_time.isoformat() if e.public_vote_time else None
            }
            for e in elections
        ]
    except Exception as e:
        import traceback
        print("❌ Error in /elections route:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to load elections")


@router.get("/candidates")
async def list_candidates(election_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(models.Candidate).where(models.Candidate.election_id == election_id))
    return [{"id": c.id, "name": c.name} for c in res.scalars().all()]


@router.get("/verify")
async def verify(
    election_id: int,
    user_id: int = Depends(jwt_utils.current_user_id),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(models.Vote).where(models.Vote.election_id == election_id, models.Vote.user_id == user_id)
    )
    vote = res.scalar()
    if not vote:
        return {"valid": False}
    return {"valid": True, "receipt": vote.receipt}


@router.post("/cast")
async def cast_vote(
    payload: VoteRequest,
    user_id: int = Depends(jwt_utils.current_user_id),
    db: AsyncSession = Depends(get_db)
):
    try:
        res = await db.execute(select(models.Candidate).where(models.Candidate.id == payload.candidate_id))
        cand = res.scalar()
        if not cand:
            raise HTTPException(status_code=404, detail="Candidate not found")
        election = (await db.execute(select(models.Election).where(models.Election.id == cand.election_id))).scalar()
        if not election or not election.is_open:
            raise HTTPException(status_code=400, detail="Election closed")

        election_id = cand.election_id
        dup = await db.execute(
            select(models.Vote).where(models.Vote.user_id == user_id, models.Vote.election_id == election_id)
        )
        if dup.scalar():
            raise HTTPException(status_code=400, detail="Already voted in this election")

        candidates = (await db.execute(select(models.Candidate).where(models.Candidate.election_id == election_id))).scalars().all()
        receipt = uuid.uuid4().hex[:12].upper()
        vote = models.Vote(user_id=user_id, election_id=election_id, receipt=receipt)
        db.add(vote)
        await db.commit()
        await db.refresh(vote)

        # ✅ Load user for email
        res_user = await db.execute(select(models.User).where(models.User.id == user_id))
        user = res_user.scalar()
        if user:
            await notify_user_vote(user.email, receipt)

        public_key = settings.PAILLIER_PUBLIC_KEY
        for cand in candidates:
            enc = public_key.encrypt(1 if cand.id == payload.candidate_id else 0)
            evv = models.EncryptedVoteValue(
                vote_id=vote.id,
                candidate_id=cand.id,
                encrypted_value=f"{enc.ciphertext()},{enc.exponent}"
            )
            db.add(evv)
        await db.commit()
        return {"receipt": receipt}
    except HTTPException as he:
        raise he  # ✅ preserve proper HTTP status like 400
    except Exception as e:
        import traceback
        print("❌ Vote error:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Unexpected server error")




@router.get("/results")
async def get_results(election_id: int, db: AsyncSession = Depends(get_db)):
    candidates = (await db.execute(select(models.Candidate).where(models.Candidate.election_id == election_id))).scalars().all()
    encrypted_sums = {c.id: None for c in candidates}
    for c in candidates:
        res = await db.execute(
            select(models.EncryptedVoteValue.encrypted_value)
            .join(models.Vote, models.EncryptedVoteValue.vote_id == models.Vote.id)
            .where(
                models.EncryptedVoteValue.candidate_id == c.id,
                models.Vote.election_id == election_id
            )
        )
        total = None
        for val in res.scalars().all():
            ct, exp = map(int, val.split(","))
            enc = paillier.EncryptedNumber(settings.PAILLIER_PUBLIC_KEY, ct, exp)
            total = enc if total is None else total + enc
        encrypted_sums[c.id] = total

    return [
        {
            "candidate_id": cid,
            "count": settings.PAILLIER_PRIVATE_KEY.decrypt(enc) if enc else 0
        }
        for cid, enc in encrypted_sums.items()
    ]
