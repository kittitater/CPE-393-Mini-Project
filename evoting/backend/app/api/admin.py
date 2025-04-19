from fastapi import APIRouter
router = APIRouter()

# Placeholder admin routes
@router.get("/ping")
def ping():
    return {"msg": "admin ok"}
