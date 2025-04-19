from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, vote, admin

app = FastAPI(title="E‑Voting API")
origins = ["*"]  # set prod domains
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"], allow_credentials=True)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(vote.router, prefix="/api/vote", tags=["vote"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
