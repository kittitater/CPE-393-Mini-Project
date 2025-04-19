# Secure Evoting – Full Finish

This repo contains:

* **backend/** FastAPI, JWT, OTP, PostgreSQL (async)
* **frontend/** Next.js 14 + Tailwind (ready for Vercel, no Docker)
* **docker-compose.yml** postgres + backend (frontend self‑host only for dev)

## Dev quickstart
```bash
# backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# frontend
cd ../frontend
npm i
npm run dev
```

## Vercel deploy (frontend)
1. Push `frontend/` to GitHub.
2. Import in Vercel, set `NEXT_PUBLIC_API_URL=https://api.example.com`.
3. Build & deploy.

## Security
See OSI‑layer table in docs/SECURITY.md for complete hardening checklist.
