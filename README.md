# 🗳️ Secure E-Voting System

A secure, web-based e-voting platform built with **FastAPI**, **PostgreSQL**, and **Next.js**, featuring two-factor authentication, JWT sessions, and homomorphic encryption for tamper-proof online elections.

Developed for **CPE393: Fundamentals of Cybersecurity (Mini Project A1)**.

Developed By **Roverant Development Group**.

---

## 🔐 Features

- ✅ **Two-Factor Authentication (2FA)** via TOTP (OTP)
- 🔑 **JWT-based Authentication** for secure, stateless sessions
- 🧠 **Paillier Homomorphic Encryption** for client-side vote confidentiality
- 🛂 **OTP Verification Before Voting** to ensure voter identity at each step
- s🧾 **Vote Receipt Generation** for verifiable proof of vote
- 📊 **Real-Time Encrypted Results** display
- 👤 **Admin Dashboard** to manage elections, candidates, and time windows

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js, TailwindCSS, React |
| Backend | FastAPI, Pydantic, SQLAlchemy (Async), PyOTP |
| Database | PostgreSQL + asyncpg |
| Encryption | python-phe (Paillier cryptosystem) |
| Auth | JSON Web Tokens (JWT), TOTP (PyOTP) |
| Deployment | Vercel (frontend), Raspberry Pi 5 + Uvicorn |

---

## 📂 Project Structure

```
CPE-393-Mini-Project/
├── backend/
│   ├── app/
│   │   ├── core/          # Configuration & security settings
│   │   ├── db/            # Models & database session
│   │   ├── routers/       # API route handlers
│   │   └── main.py        # FastAPI entrypoint
│   └── requirements.txt
├── frontend/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Next.js page routes
│   ├── public/            # Static assets
│   └── tailwind.config.js
├── docker-compose.yml     # Optional multi-container setup
└── README.md              # ← You are here
```

---

## 🚀 Getting Started

### 1. Backend Setup

1. **Clone & enter backend directory**

   ```bash
   git clone https://github.com/kittitater/CPE-393-Mini-Project.git
   cd CPE-393-Mini-Project/backend
   ```

2. **Create** `.env` with:

   ```
   DATABASE_URL=postgresql+asyncpg://your_username:your_password@localhost:5432/evotingdb
   JWT_SECRET=your-super-secret-key
   CORS_ORIGINS=http://localhost:3000
   ```

3. **Install Python dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Run the API server**

   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

### 2. Frontend Setup

1. **Enter frontend directory & install**

   ```bash
   cd ../frontend
   npm install
   ```

2. **Create** `.env.local`

   ```
   NEXT_PUBLIC_BACKEND_URL=http://<backend-ip>:8000
   ```

3. **Start Next.js dev server**

   ```bash
   npm run dev
   ```

---

## 🛡️ Security Mechanisms

- **TOTP 2FA**: Ensures each user registers and verifies via time-based OTP.
- **JWT**: Protects all sensitive endpoints with signed, stateless tokens.
- **Paillier Encryption**: Keeps ballots confidential until tallying.
- **OTP Before Vote**: Forces fresh verification before casting.
- **Encrypted Receipts**: Provide cryptographic proof of vote without revealing choice.

---

## 👨‍💼 Admin Dashboard

- Create, edit, and delete elections
- Add or remove candidates per election
- Configure voting open/close timestamps
- View and export encrypted tallies in real time

---

## 📷 Screenshots (Add your own)

- 👤 Login & OTP verification
- 🗳️ Voting page & selection
- 🧾 Receipt confirmation
- 📊 Admin election manager
- 📈 Live results dashboard

---

## 🌐 Deployment Notes

- **Frontend**: Deployed on Vercel.
- **Backend**: Hosted on a Raspberry Pi 5, served by Uvicorn, reverse-proxied with Nginx + Certbot for HTTPS.
- For production, consider containerization with Docker Compose and secure key management.

---

## 📚 References

- FastAPI Official Docs
- Next.js Documentation
- PyOTP on GitHub
- Paillier Cryptosystem
- Helios Voting System

---

## 👥 Authors

- Mr. Kittithat Songsakseree (ID: 64070503404)
- Mr. Woradon Samphanphaisarn (ID: 64070503447)
- Mr. Phithatsanan Lertthanasiriwat (ID: 64070503478)

**Course**: CPE393 – Fundamentals of Cybersecurity (Mini Project A1)

---

## ⚖️ License

Academic project — not for real-world election use without comprehensive security audit.
