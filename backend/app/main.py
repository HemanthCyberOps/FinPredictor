from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers.users import router as users_router
from .routers.portfolio import router as portfolio_router
from .routers.goals import router as goals_router
from .routers.ai import router as ai_router

app = FastAPI(title="FinPredictor API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"name": "FinPredictor API", "status": "ok"}

app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(portfolio_router, prefix="/api/portfolio", tags=["portfolio"])
app.include_router(goals_router, prefix="/api/goals", tags=["goals"])
app.include_router(ai_router, prefix="/api/ai", tags=["ai"])
