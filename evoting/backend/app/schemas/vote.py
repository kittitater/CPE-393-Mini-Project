from pydantic import BaseModel, conint


class VoteCast(BaseModel):
    # If you prefer JSON body instead of query param:
    candidate_id: conint(gt=0)
