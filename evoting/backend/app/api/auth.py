from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request, Response, status
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db import models
from app.db.session import get_db
from app.schemas import auth as schemas
from app.utils import emailer, audit
from app.security import hash as hash_utils, otp as otp_utils, jwt as jwt_utils
from app.core.config import settings
from app.utils.notify import notify_user_login


logger = logging.getLogger(__name__)
router = APIRouter(tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: schemas.Register, request: Request, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    logger.debug(f"Received payload: {body.dict()}")
    try:
        # Check for existing user
        existing = await db.execute(select(models.User).where(models.User.email == body.email))
        if existing.scalar():
            raise HTTPException(status_code=400, detail="Email already in use")
        
        # Generate OTP secret and create user
        secret = otp_utils.generate_secret()
        user = models.User(
            email=body.email,
            hashed_password=hash_utils.hash_pw(body.password),
            otp_secret=secret,
            is_active=False
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # Generate OTP URI
        otp_uri = otp_utils.build_provisioning_uri(body.email, secret)

        # Send email (background task)
        try:
            background_tasks.add_task(
                emailer.send_mail,
                to=body.email,
                subject="Your Evote OTP setup",
                html=f"<p>Scan this QR in your Authenticator app:</p><img src='https://api.qrserver.com/v1/create-qr-code/?data={otp_uri}'/>"
            )
        except Exception as e:
            logger.error(f"Failed to queue email task: {str(e)}")

        # Audit log
        try:
            await audit.log(request, db, "register-init", user.id)
        except Exception as e:
            logger.error(f"Failed to log audit: {str(e)}")

        return {"otp_uri": otp_uri}

    except HTTPException as e:
        raise e  # re-raise known error so it shows correct status and message
    except Exception as e:
        logger.exception(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/register/verify", status_code=status.HTTP_200_OK)
async def register_verify(body: schemas.OTPVerify, request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).where(models.User.email == body.email))
    user = result.scalar()
    if not user or not otp_utils.verify(body.otp, user.otp_secret):
        raise HTTPException(status_code=400, detail="Bad OTP")
    user.is_active = True
    await db.commit()
    token = jwt_utils.create_token(sub=str(user.id), is_admin=user.is_admin)
    response.set_cookie(
        "access_token", token, httponly=True, secure=True, samesite="strict", max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    await audit.log(request, db, "register-verify", user.id)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login", status_code=status.HTTP_200_OK)
async def login(body: schemas.Login, request: Request, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(models.User).where(models.User.email == body.email))
    user = r.scalar()
    if not user or not hash_utils.verify_pw(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Please finish registration first")
    code = otp_utils.generate_otp(user.otp_secret)
    background_tasks.add_task(
        emailer.send_mail,
        to=body.email,
        subject="Evote Login OTP",
        html=f"<p>Your OTP code is <b>{code}</b> (30 s)</p>"
    )
    await audit.log(request, db, "login-pw-ok", user.id)
    await notify_user_login(user.email)

    return {"msg": "OTP sent"}

@router.post("/otp", status_code=status.HTTP_200_OK)
async def otp_login(
    body: schemas.OTPVerify,
    request: Request,
    response: Response,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    r = await db.execute(select(models.User).where(models.User.email == body.email))
    user = r.scalar()
    if not user or not otp_utils.verify(body.otp, user.otp_secret):
        raise HTTPException(status_code=400, detail="Bad OTP")

    token = jwt_utils.create_token(sub=str(user.id), is_admin=user.is_admin)
    response.set_cookie(
        "access_token", token, httponly=True, secure=True, samesite="strict", max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    await audit.log(request, db, "login-2fa-success", user.id)

    # ✅ Notify via email when used for voting or login
    if "vote" in request.headers.get("x-context", "").lower():
        background_tasks.add_task(
            emailer.send_mail,
            to=user.email,
            subject="Evote Vote Confirmed",
            html=f"<p>You just voted. Receipt and results are now available in the system.</p>"
        )
    else:
        background_tasks.add_task(
            emailer.send_mail,
            to=user.email,
            subject="Evote Login Successful",
            html=f"<p>You just logged in successfully.</p>"
        )

    return {"access_token": token, "token_type": "bearer"}
