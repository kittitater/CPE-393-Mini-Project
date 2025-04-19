import pyotp


def generate_secret() -> str:
    """Generate base32 secret for TOTP."""
    return pyotp.random_base32()


def verify(code: str, secret: str) -> bool:
    """Return True if the provided code is valid for the secret."""
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)  # ±30 s tolerance
