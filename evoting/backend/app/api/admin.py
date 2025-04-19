# backend/app/api/admin.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.config import settings
from app.db import models
from app.db.session import get_db
from app.schemas import admin as schemas
from app.security import jwt as jwt_utils
from phe import paillier

router = APIRouter(tags=["admin"])

@router.post("/elections", status_code=201)
async def create_election(body: schemas.ElectionCreate, _: int = Depends(jwt_utils.require_admin), db: AsyncSession = Depends(get_db)):
    election = models.Election(name=body.name)
    db.add(election)
    await db.commit()
    await db.refresh(election)
    return {"id": election.id, "name": election.name, "is_open": election.is_open}

@router.get("/elections")
async def list_elections(_: int = Depends(jwt_utils.require_admin), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(models.Election))
    return [{"id": e.id, "name": e.name, "is_open": e.is_open} for e in res.scalars().all()]

@router.patch("/elections/{election_id}")
async def set_election_state(
    election_id: int,
    body: schemas.ElectionStateUpdate,
    _: int = Depends(jwt_utils.require_admin),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(models.Election).where(models.Election.id == election_id))
    election = res.scalar()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    election.is_open = body.is_open
    await db.commit()
    return {"id": election.id, "name": election.name, "is_open": election.is_open}

@router.post("/candidates", status_code=201)
async def add_candidate(body: schemas.CandidateCreate, _: int = Depends(jwt_utils.require_admin), db: AsyncSession = Depends(get_db)):
    exists = await db.execute(select(models.Election).where(models.Election.id == body.election_id))
    if not exists.scalar():
        raise HTTPException(status_code=404, detail="Election not found")
    cand = models.Candidate(name=body.name, election_id=body.election_id)
    db.add(cand)
    await db.commit()
    await db.refresh(cand)
    return {"id": cand.id, "name": cand.name, "election_id": cand.election_id}

@router.delete("/candidates/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_candidate(candidate_id: int, _: int = Depends(jwt_utils.require_admin), db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(models.Candidate).where(models.Candidate.id == candidate_id))
    cand = res.scalar()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    await db.delete(cand)
    await db.commit()

@router.get("/results")
async def election_results(election_id: int, _: int = Depends(jwt_utils.require_admin), db: AsyncSession = Depends(get_db)):
    candidates_res = await db.execute(select(models.Candidate).where(models.Candidate.election_id == election_id))
    candidates = candidates_res.scalars().all()
    results = []
    private_key = settings.PAILLIER_PRIVATE_KEY
    public_key = settings.PAILLIER_PUBLIC_KEY
    for cand in candidates:
        evvs_res = await db.execute(
            select(models.EncryptedVoteValue).where(models.EncryptedVoteValue.candidate_id == cand.id)
        )
        evvs = evvs_res.scalars().all()
        if not evvs:
            results.append({"candidate": cand.name, "votes": 0})
            continue
        encrypted_sums = None
        for evv in evvs:
            ciphertext, exponent = map(int, evv.encrypted_value.split(","))
            encrypted_num = paillier.EncryptedNumber(public_key, ciphertext, exponent)
            if encrypted_sums is None:
                encrypted_sums = encrypted_num
            else:
                encrypted_sums += encrypted_num
        total_votes = private_key.decrypt(encrypted_sums)
        results.append({"candidate": cand.name, "votes": total_votes})
    return results