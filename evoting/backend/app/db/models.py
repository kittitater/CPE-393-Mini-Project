from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    DateTime,
    func,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Election(Base):
    __tablename__ = "elections"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    is_open = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    otp_secret = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    election_id = Column(Integer, ForeignKey("elections.id"))
    election = relationship("Election", backref="candidates")


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    receipt = Column(String, unique=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    candidate = relationship("Candidate")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    event = Column(String, nullable=False)
    ip = Column(String, nullable=True)
    ts = Column(DateTime(timezone=True), server_default=func.now())

