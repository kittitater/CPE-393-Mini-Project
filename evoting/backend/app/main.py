from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.db import models
from app.db.session import get_db
from app.schemas import admin as schemas

from app.api import admin


app.include_router(admin.router, prefix="/api/admin", tags=["admin"]) 

router = APIRouter()

def require_admin(authorization: str = Depends(lambda: None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing bearer token")
    scheme, _, token = authorization.partition(" ")
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        if not payload.get("adm"):
            raise HTTPException(status_code=403, detail="Admin only")
        return int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Bad token")


# ── ELECTIONS ────────────────────────────────────────────────────────────────
@router.post("/elections", status_code=201)
async def create_election(
    body: schemas.ElectionCreate,
    _: int = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    election = models.Election(name=body.name)
    db.add(election)
    await db.commit()
    await db.refresh(election)
    return election


@router.patch("/elections/{election_id}")
async def set_election_state(
    election_id: int,
    body: schemas.ElectionStateUpdate,
    _: int = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(models.Election).where(models.Election.id == election_id))
    election = res.scalar()
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    election.is_open = body.is_open
    await db.commit()
    return election


@router.get("/elections")
async def list_elections(
    _: int = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(models.Election))
    return res.scalars().all()


# ── CANDIDATES ───────────────────────────────────────────────────────────────
@router.post("/candidates", status_code=201)
async def add_candidate(
    body: schemas.CandidateCreate,
    _: int = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    # Ensure election exists
    if not (
        await db.execute(select(models.Election).where(models.Election.id == body.election_id))
    ).scalar():
        raise HTTPException(status_code=404, detail="Election not found")
    cand = models.Candidate(name=body.name, election_id=body.election_id)
    db.add(cand)
    await db.commit()
    await db.refresh(cand)
    return cand


@router.delete("/candidates/{candidate_id}", status_code=204)
async def delete_candidate(
    candidate_id: int,
    _: int = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(models.Candidate).where(models.Candidate.id == candidate_id))
    cand = res.scalar()
    if not cand:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(cand)
    await db.commit()


@router.get("/candidates")
async def list_candidates_admin(
    election_id: int,
    _: int = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(models.Candidate).where(models.Candidate.election_id == election_id)
    )
    return res.scalars().all()


# ── RESULTS ─────────────────────────────────────────────────────────────────
@router.get("/results")
async def election_results(
    election_id: int,
    _: int = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    # Aggregate votes per candidate for the requested election
    from sqlalchemy import func

    res = await db.execute(
        select(
            models.Candidate.name,
            func.count(models.Vote.id).label("votes"),
        )
        .join(models.Vote, models.Vote.candidate_id == models.Candidate.id, isouter=True)
        .where(models.Candidate.election_id == election_id)
        .group_by(models.Candidate.id)
    )
    return [{"candidate": row[0], "votes": row[1]} for row in res.all()]
