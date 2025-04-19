
# Privacy‑Preserving E‑Voting System (CPE393)

This starter kit demonstrates Paillier homomorphic encryption, MFA voter authentication, voter‑verifiable receipts, and a web UI.

## Quick Start

```bash
# 1. Generate Paillier keys
cd server
npm install
npm run generate-keys

# 2. Configure
cp .env.example .env   # edit Mongo URI & JWT secret

# 3. Run server
npm run dev            # port 3002

# 4. Run client
cd ../client
npm install
npm run dev            # Next.js on 3000
```

## Features

* **Registration + OTP email** (simulated via console)
* **JWT login** (15 min)
* **Paillier encryption** of each vote
* **Homomorphic tally** without decrypting individual ballots
* **Receipt** (SHA‑256 of ciphertext) for voter verification
* **Admin tally** endpoint
* Basic React/Next.js UI pages (Register, Verify, Login, Vote, VerifyVote, Admin)

Extend with:

* Real email service (SendGrid/SES)
* Role‑based access for admin
* Multiple elections / candidates (store encrypted vectors)
* Fancy UI (Tailwind, shadcn/ui)
* Cypress + jest tests (skeleton not included yet)
