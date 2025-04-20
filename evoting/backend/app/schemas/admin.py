# backend/app/schemas/admin.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ElectionCreate(BaseModel):
    name: str
    public_vote_time: Optional[datetime] = None

class ElectionStateUpdate(BaseModel):
    is_open: bool
    public_vote_time: Optional[datetime] = None

class CandidateCreate(BaseModel):
    name: str
    election_id: int

class CandidateUpdate(BaseModel):
    name: str
