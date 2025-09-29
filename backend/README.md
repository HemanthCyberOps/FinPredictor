# FinPredictor Backend (FastAPI)

Setup
1. Python 3.11+
2. pip install -r backend/requirements.txt
3. uvicorn backend.uvicorn_app:app --reload

Endpoints
- GET / -> health
- /api/users -> signup, login, get user
- /api/portfolio -> get/add/delete assets
- /api/goals -> list/create/delete goals
- /api/ai/predict -> demo AI insights

Notes
- In-memory storage for MVP; replace with Firebase/Firestore for persistence.
