from passlib.context import CryptContext

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_pw(password: str) -> str:
    return _pwd.hash(password)


def verify_pw(password: str, hashed: str) -> bool:
    return _pwd.verify(password, hashed)
