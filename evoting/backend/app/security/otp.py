# backend/app/security/otp.py
import pyotp

def generate_secret() -> str:
    return pyotp.random_base32()

def build_provisioning_uri(email: str, secret: str) -> str:
    return pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name="Evote")

def generate_otp(secret: str) -> str:
    return pyotp.TOTP(secret).now()

def verify(code: str, secret: str) -> bool:
    return pyotp.TOTP(secret).verify(code)