# backend/app/db/models.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func
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
    is_active = Column(Boolean, default=False, nullable=False)

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
    election_id = Column(Integer, ForeignKey("elections.id"))
    receipt = Column(String, unique=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User")
    election = relationship("Election")

class EncryptedVoteValue(Base):
    __tablename__ = "encrypted_vote_values"
    id = Column(Integer, primary_key=True)
    vote_id = Column(Integer, ForeignKey("votes.id"))
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    encrypted_value = Column(String)  # Stores ciphertext as "ciphertext,exponent"
    vote = relationship("Vote")
    candidate = relationship("Candidate")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    event = Column(String, nullable=False)
    ip = Column(String, nullable=True)
    ts = Column(DateTime(timezone=True), server_default=func.now())