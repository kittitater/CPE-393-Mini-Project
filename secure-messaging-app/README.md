
# Secure Messaging App (CPE393 Mini‑Project)

## Quick Start

```bash
# Server
cd server
cp .env.example .env
npm install
npm run dev   # runs on :3001

# Client
cd ../client
npm install
npm run dev   # Next.js on :3000
```

Open http://localhost:3000 in two browser windows, sign up (POST /api/auth/signup), then login and chat.

## Security Highlights

* **AES‑256‑GCM** end‑to‑end encryption (client‑side `crypto.ts`)
* **Argon2id** password hashing, **JWT** 5‑min access tokens
* **TLS 1.3** (production) + `helmet`, rate‑limit, sanitizers
* WebSocket auth middleware verifies JWT every connection
* OSI coverage table in `docs/osi_defences.md`

## Project Structure

```
secure_messaging_app/
├─ server/  – Express relay + Socket.IO, MongoDB
└─ client/  – Next.js 14 front‑end
```

Use this skeleton, extend features, and add tests per the course rubric.
