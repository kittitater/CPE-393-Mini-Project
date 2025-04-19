import random, string, time
from app.core.config import settings

_OTPS = {}  # email -> (otp, expiry)

def gen_otp(email: str):
    otp = ''.join(random.choices(string.digits, k=6))
    _OTPS[email] = (otp, time.time() + settings.OTP_TTL_SEC)
    print(f"[DEBUG] OTP for {email}: {otp}")  # TODO: send via email/SMS
    return otp

def verify_otp(email: str, code: str):
    record = _OTPS.get(email)
    if not record: return False
    otp, exp = record
    if time.time() > exp: return False
    return otp == code
