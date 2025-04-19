# backend/app/schemas/auth.py
from pydantic import BaseModel, EmailStr

class Register(BaseModel):
    email: EmailStr
    password: str

class Login(BaseModel):
    email: EmailStr
    password: str

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str