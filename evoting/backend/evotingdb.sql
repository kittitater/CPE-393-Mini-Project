-- Step 1: Create the database
CREATE DATABASE evoting;

-- Step 2: Connect to the database
connect evoting;

-- Step 3: Enable uuid-ossp extension (optional but useful)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 4: Create tables

CREATE TABLE elections (
  id         SERIAL PRIMARY KEY,
  name       TEXT    NOT NULL,
  is_open    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  email           TEXT    NOT NULL UNIQUE,
  hashed_password TEXT    NOT NULL,
  otp_secret      TEXT    NOT NULL,
  is_admin        BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE candidates (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  election_id  INT  NOT NULL REFERENCES elections(id) ON DELETE CASCADE
);

CREATE TABLE votes (
  id           SERIAL PRIMARY KEY,
  user_id      INT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  election_id  INT    NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  receipt      VARCHAR(32) NOT NULL UNIQUE,
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE encrypted_vote_values (
  id              SERIAL PRIMARY KEY,
  vote_id         INT    NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  candidate_id    INT    NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  encrypted_value TEXT NOT NULL
);

CREATE TABLE audit_logs (
  id        SERIAL PRIMARY KEY,
  user_id   INT     NULL REFERENCES users(id) ON DELETE SET NULL,
  event     TEXT    NOT NULL,
  ip        TEXT    NULL,
  ts        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
