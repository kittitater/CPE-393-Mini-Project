# backend/app/schemas/admin.py
from pydantic import BaseModel

class ElectionCreate(BaseModel):
    name: str

class ElectionStateUpdate(BaseModel):
    is_open: bool

class CandidateCreate(BaseModel):
    name: str
    election_id: int