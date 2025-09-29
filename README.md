# FinPredictor
AI-powered personal finance & goal-based portfolio planner. Optimize SIPs, predict future returns, and plan your financial goals with AI insights.

## Tech Stack
- Frontend: React + Vite + Tailwind + React Router + Recharts
- Backend: FastAPI (Python) with REST endpoints
- DB: In-memory (MVP); replace with Firebase/Firestore
- AI: Placeholder Meta Llama 4 + Cerebras clients (env-configured)
- Docker: Backend + Frontend + docker-compose. Compatible with Docker MCP Gateway.

## Quick Start (Local)
1. Backend
   - Python 3.11+
   - `pip install -r backend/requirements.txt`
   - `python backend/uvicorn_app.py`
   - API at `http://localhost:8000`
2. Frontend
   - Node 20.19+ recommended
   - `cd frontend && npm install`
   - `npm run dev`
   - App at `http://localhost:5173`

Optional: set `VITE_API_BASE` in frontend to point to backend.

## Using Docker
- Build and run both services:
```
docker compose up --build
```
- Frontend at `http://localhost:5173`, Backend at `http://localhost:8000`

## API Overview
- `GET /` health
- `POST /api/users/signup`, `POST /api/users/login`, `GET /api/users/{id}`
- `GET /api/portfolio/{userId}`, `POST /api/portfolio/{userId}/assets`, `DELETE /api/portfolio/{userId}/assets/{assetId}`
- `GET /api/goals/{userId}`, `POST /api/goals/{userId}`, `DELETE /api/goals/{userId}/{goalId}`
- `POST /api/ai/predict` (demo insights)

## AI Integration (Placeholders)
- Meta Llama: `backend/app/services/llama_client.py`
- Cerebras: `backend/app/services/cerebras_client.py`
Configure via envs: `LLAMA_API_URL`, `LLAMA_MODEL`, `LLAMA_API_KEY`, `CEREBRAS_API_URL`, `CEREBRAS_API_KEY`.

## Hackathon Notes
- Sponsor tech: Meta Llama (insights), Cerebras (analytics), Docker MCP Gateway via containerization.
- Charts: Portfolio growth, goal progress, allocation pie in `frontend/src/components/Charts.jsx`.
- Pages: `Home`, `Portfolio`, `Goals`, `AI Insights` in `frontend/src/pages`.

## Next Steps
- Swap in Firebase Auth + Firestore stores
- Replace AI placeholders with real API calls
- Add auth UI and protected routes
- Enhance charts with real time-series
