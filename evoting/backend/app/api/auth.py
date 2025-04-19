from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.db import models
from app.schemas import auth as schemas
from app.security import hash as hash_utils, jwt as jwt_utils, otp as otp_utils

router = APIRouter()

@router.post("/register")
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(models.User).where(models.User.email == user.email))
    if res.scalar():
        raise HTTPException(status_code=400, detail="Email exists")
    new = models.User(email=user.email, hashed_password=hash_utils.hash_password(user.password))
    db.add(new)
    await db.commit()
    otp_utils.gen_otp(user.email)
    return {"msg": "Registered. Check OTP."}

@router.post("/otp")
async def verify_otp(req: schemas.OTPRequest, db: AsyncSession = Depends(get_db)):
    if not otp_utils.verify_otp(req.email, req.otp):
        raise HTTPException(status_code=400, detail="Invalid OTP")
    res = await db.execute(select(models.User).where(models.User.email == req.email))
    user = res.scalar()
    token = jwt_utils.create_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login", response_model=schemas.Token)
async def login(user: schemas.UserLogin, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(models.User).where(models.User.email == user.email))
    u = res.scalar()
    if not u or not hash_utils.verify_password(user.password, u.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong cred")
    otp_utils.gen_otp(user.email)
    return {"msg": "OTP sent"}
