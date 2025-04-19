from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import BackgroundTasks, Request

from app.utils import emailer, audit
from app.db import models
from app.db.session import get_db
from app.schemas import auth as schemas
from app.security import hash as hash_utils, jwt as jwt_utils, otp as otp_utils

router = APIRouter()


@router.post("/register")
async def register(body: schemas.Register, db: AsyncSession = Depends(get_db)):
    if (
        await db.execute(select(models.User).where(models.User.email == body.email))
    ).scalar():
        raise HTTPException(status_code=400, detail="Email already in use")

    secret = otp_utils.generate_secret()
    user = models.User(
        email=body.email,
        hashed_password=hash_utils.hash_pw(body.password),
        otp_secret=secret,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    otp_uri = f"otpauth://totp/Evote:{body.email}?secret={secret}&issuer=Evote"
    # Front‑end shows this URI as a QR code
    bg.add_task(
        emailer.send_mail,
        to=body.email,
        subject="Your Evote OTP setup",
        html=f"<h3>Scan this QR in Google Authenticator</h3><img src='https://api.qrserver.com/v1/create-qr-code/?data={otp_uri}'>",
    )
    await audit.log(request, db, "register", user.id)
    return {"otp_uri": otp_uri}

@router.post("/login")
async def login(body: schemas.Login, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).where(models.User.email == body.email))
    user = result.scalar()
    if not user or not hash_utils.verify_pw(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid")

    # Password correct → request OTP
    bg.add_task(
    emailer.send_mail,
    to=body.email,
    subject="Evote login OTP",
    html=f"<p>Your OTP code is valid for 30 s.</p>",
)
    await audit.log(request, db, "login‑pw‑ok", user.id)
    
    return {"msg": "OTP required"}


@router.post("/otp")
async def otp_verify(
    body: schemas.OTPVerify, resp: Response, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.User).where(models.User.email == body.email))
    user = result.scalar()

    if not user or not otp_utils.verify(body.otp, user.otp_secret):
        raise HTTPException(status_code=400, detail="Bad OTP")

    token = jwt_utils.create_token(str(user.id), is_admin=user.is_admin)

    # Send as both JSON and secure HttpOnly cookie (defense‑in‑depth)
    resp.set_cookie(
        "access_token",
        token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=1800,
    )
    await audit.log(request, db, "login‑2fa‑success", user.id)

    return {"access_token": token, "token_type": "bearer"}
