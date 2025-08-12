# SpeakConnect MERN Backend

This folder contains the Node.js + Express + MongoDB backend for your Duolingo‑style project.

## Features
- Auth (JWT): register, login, me
- Lessons API (filter by type/level)
- Progress tracking (XP + naive streak update)
- Leaderboard (by XP)
- Socket.io matchmaking + WebRTC signaling relay

## Quick Start
1. Install deps
```
cd server
npm i
cp .env.example .env
```
2. Edit `.env` (Mongo URL, JWT secret, client origin)
3. Run
```
npm run dev
```
Server runs on http://localhost:4000. Health check: `/api/health`.

## API Overview
- POST /api/auth/register { email, password, username, level }
- POST /api/auth/login { email, password }
- GET /api/auth/me (Bearer token)
- GET /api/lessons?type=&level=
- GET /api/lessons/:id
- POST /api/progress { lessonId, xpEarned, mistakes, stats } (Bearer)
- GET /api/progress/summary (Bearer)
- GET /api/leaderboard

## Socket.io Events
- Client -> server: `join_queue` { userId, level }
- Server -> client: `match_found` { roomId, peerId }
- Signaling relays: `webrtc_offer`, `webrtc_answer`, `webrtc_ice`

Use a TURN server in production for reliable WebRTC (e.g., Coturn).

## Folder Structure
- index.js (app + socket)
- src/db.js (Mongo connection)
- src/models/* (User, Lesson, Progress, Call)
- src/middleware/auth.js
- src/routes/* (auth, lessons, progress, leaderboard)
- src/socket/matchmaking.js

## Notes
- This is an MVP backend; add validation, RLS‑like checks, rate limiting, and analytics for production.
- Keep your JWT secret safe.
