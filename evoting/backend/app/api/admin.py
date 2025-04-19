"""
Admin‑only API router for Secure E‑Voting
----------------------------------------

Endpoints
    POST   /api/admin/elections         → create new election
    GET    /api/admin/elections         → list elections
    PATCH  /api/admin/elections/{id}    → open / close election

    POST   /api/admin/candidates        → add candidate to election
    DELETE /api/admin/candidates/{id}   → delete candidate
    GET    /api/admin/candidates        → list candidates in election (param election_id)

    GET    /api/admin/results           → aggregate votes per candidate (param election_id)
    GET    /api/admin/audit/export      → CSV download of audit logs (param secret)
"""

from fastapi import APIRouter, Depends, HTTPException, Header, status
from fastapi.responses import StreamingResponse
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
import pandas as pd

from app.core.config import settings
from app.db import models
from app.db.session import get_db
from app.schemas import admin as schemas

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Helper – require admin token
# ─────────────────────────────────────────────────────────────────────────────
async def require_admin(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Bad auth scheme")

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if not payload.get("adm"):
        raise HTTPException(status_code=403, detail="Admin only")
    return int(payload["sub"])  # return user_id (unused but available)


# ─────────────────────────────────────────────────────────────────────────────
# Elections
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/elections", response_model=dict, status_code=201)
async def create_election(
    body: schemas.ElectionCreate,
    _: int = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    election = models.Election(name=body.name)
    db.add(election)
    await db.commit()
    await db.refresh(election)
    return {"id": election.id, "name": election.name, "is_open": election.is_open}


@router.get("/elections", response_model=list[dict])
async def list_elections(
    _: int = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(models.Election))
    return [
        {"id": e.id, "name": e.name, "is_open": e.is_open} for e in res.scalars().all()
    ]


@router.patch("/elections/{election_id}", response_model=dict)
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
    return {"id": election.id, "name": election.name, "is_open": election.is_open}


# ─────────────────────────────────────────────────────────────────────────────
# Candidates
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/candidates", response_model=dict, status_code=201)
async def add_candidate(
    body: schemas.CandidateCreate,
    _: int = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if not (
        await db.execute(select(models.Election).where(models.Election.id == body.election_id))
    ).scalar():
        raise HTTPException(status_code=404, detail="Election not found")
    cand = models.Candidate(name=body.name, election_id=body.election_id)
    db.add(cand)
    await db.commit()
    await db.refresh(cand)
    return {"id": cand.id, "name": cand.name, "election_id": cand.election_id}


@router.delete("/candidates/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_candidate(
    candidate_id: int,
    _: int = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(models.Candidate).where(models.Candidate.id == candidate_id))
    cand = res.scalar()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    await db.delete(cand)
    await db.commit()
    return None


@router.get("/candidates", response_model=list[dict])
async def list_candidates_admin(
    election_id: int,
    _: int = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(models.Candidate).where(models.Candidate.election_id == election_id)
    )
    return [{"id": c.id, "name": c.name} for c in res.scalars().all()]


# ─────────────────────────────────────────────────────────────────────────────
# Results (aggregate votes)
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/results", response_model=list[dict])
async def election_results(
    election_id: int,
    _: int = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(
            models.Candidate.name.label("candidate"),
            func.count(models.Vote.id).label("votes"),
        )
        .join(models.Vote, models.Vote.candidate_id == models.Candidate.id, isouter=True)
        .where(models.Candidate.election_id == election_id)
        .group_by(models.Candidate.id)
    )
    return [{"candidate": row.candidate, "votes": row.votes} for row in res]


# ─────────────────────────────────────────────────────────────────────────────
# Audit‑log CSV export
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/audit/export")
async def export_csv(
    secret: str,
    _: int = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if secret != settings.AUDIT_EXPORT_SECRET:
        raise HTTPException(status_code=403, detail="bad secret")

    res = await db.execute(select(models.AuditLog))
    logs = res.scalars().all()
    if not logs:
        raise HTTPException(status_code=404, detail="No logs")

    df = pd.DataFrame(
        [
            {
                "id": log.id,
                "user_id": log.user_id,
                "event": log.event,
                "ip": log.ip,
                "timestamp": log.ts.isoformat(),
            }
            for log in logs
        ]
    )
    csv_bytes = df.to_csv(index=False).encode()

    return StreamingResponse(
        iter([csv_bytes]),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="audit.csv"'},
    )
