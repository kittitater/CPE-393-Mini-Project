# backend/app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, vote, admin

app = FastAPI(
    title="Secure E-Voting API",
    description="FastAPI backend with OTP, JWT, Homomorphic Encryption, Election & Candidate CRUD, Results & Audit"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; object-src 'none';"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response

# Include API routers
app.include_router(auth.router, prefix="/api/auth")
app.include_router(vote.router, prefix="/api/vote")
app.include_router(admin.router, prefix="/api/admin")

@app.get("/")
async def root():
    return {"message": "Welcome to Secure E-Voting System"}