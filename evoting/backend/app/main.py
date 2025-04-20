import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.crypto import crypto_settings
from app.api import auth, vote, admin

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    handlers=[
        logging.FileHandler("debug.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Secure E-Voting API",
    description="FastAPI backend with OTP, JWT, Homomorphic Encryption, Election & Candidate CRUD, Results & Audit"
)

# Log all incoming requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.debug(f"Incoming request: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        logger.debug(f"Response status: {response.status_code} for {request.method} {request.url.path}")
        return response
    except Exception as e:
        logger.exception(f"Error processing request: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})

# Log registered routes on startup
@app.on_event("startup")
async def startup_event():
    logger.info("Application starting up...")
    logger.info("Registered routes:")
    for route in app.routes:
        methods = getattr(route, "methods", set())
        path = getattr(route, "path", "Unknown")
        logger.info(f"Route: {methods} {path}")

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

@app.get("/test-encryption")
def test_encryption():
    encrypted = crypto_settings.PAILLIER_PUBLIC_KEY.encrypt(42)
    decrypted = crypto_settings.PAILLIER_PRIVATE_KEY.decrypt(encrypted)
    return {"original": 42, "decrypted": decrypted}