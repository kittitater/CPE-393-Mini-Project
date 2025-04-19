from pydantic import BaseModel

class VoteIn(BaseModel):
    candidate_id: int
