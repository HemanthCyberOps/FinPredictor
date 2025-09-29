from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import date, datetime
import uuid
import math
import os
import httpx

app = FastAPI(title="FinPredictor Goals Service", version="0.3.0")

PORTFOLIO_BASE = os.getenv("PORTFOLIO_BASE", "http://localhost:8002")

class GoalCreate(BaseModel):
	# required
	title: str
	target_amount: float
	target_date: date
	# risk/strategy
	risk_profile: str = "moderate"  # conservative|moderate|aggressive
	# optional advanced
	goal_category: Optional[str] = None
	linked_assets: Optional[List[str]] = None
	priority_level: Optional[str] = None  # high|medium|low
	expected_inflation_rate: Optional[float] = 0.05
	# legacy optional (kept)
	starting_amount: float = 0
	current_sip: float = 0
	expected_return_rate: float = 0.12
	inflation_rate: float = 0.05
	salary_growth_rate: float = 0.05

class StrategyProjection(BaseModel):
	name: str
	expected_return_rate: float
	recommended_sip: float

class Goal(BaseModel):
	id: str
	user_id: str
	title: str
	target_amount: float
	target_date: date
	starting_amount: float
	current_sip: float
	expected_return_rate: float
	inflation_rate: float
	salary_growth_rate: float
	risk_profile: str
	goal_category: Optional[str] = None
	linked_assets: List[str] = []
	priority_level: Optional[str] = None
	expected_inflation_rate: Optional[float] = None
	recommended_sip: float
	projections: List[StrategyProjection]
	current_progress: float
	created_at: datetime

_GOALS_BY_USER: Dict[str, Dict[str, Dict]] = {}

@app.get("/")
async def health():
	return {"service": "goals", "status": "ok"}

def monthly_sip_required(target_amount: float, years: float, expected_return_rate: float, starting_amount: float = 0.0, inflation_rate: float = 0.0) -> float:
	inflation_adjusted_target = target_amount * ((1 + inflation_rate) ** max(years, 0))
	monthly_rate = expected_return_rate / 12.0
	n_months = max(int(round(max(years, 0) * 12)), 1)
	fv_of_lumpsum = starting_amount * ((1 + monthly_rate) ** n_months)
	required_fv_from_sip = max(inflation_adjusted_target - fv_of_lumpsum, 0)
	if monthly_rate <= 0:
		return required_fv_from_sip / n_months
	annuity_factor = (((1 + monthly_rate) ** n_months) - 1) / monthly_rate
	return required_fv_from_sip / max(annuity_factor, 1e-9)

async def get_linked_assets_value(user_id: str, linked_assets: Optional[List[str]]) -> float:
	if not linked_assets:
		return 0.0
	try:
		async with httpx.AsyncClient(timeout=10) as client:
			resp = await client.get(f"{PORTFOLIO_BASE}/{user_id}")
			resp.raise_for_status()
			data = resp.json()
			assets = data.get("assets", [])
			asset_by_id = {a.get("id"): a for a in assets}
			return float(sum((asset_by_id.get(aid, {}).get("current_price") or 0) for aid in linked_assets))
	except Exception:
		return 0.0

@app.get("/{user_id}", response_model=List[Goal])
async def list_goals(user_id: str):
	user_goals = _GOALS_BY_USER.get(user_id, {})
	return [Goal(**g) for g in user_goals.values()]

@app.post("/{user_id}", response_model=Goal)
async def create_goal(user_id: str, payload: GoalCreate):
	goal_id = str(uuid.uuid4())
	days = (payload.target_date - date.today()).days
	years = max(days / 365.0, 0.0)
	infl = payload.expected_inflation_rate if payload.expected_inflation_rate is not None else payload.inflation_rate
	# Strategy projections
	strategies = [
		("conservative", 0.08),
		("moderate", 0.12),
		("aggressive", 0.15),
	]
	projections: List[StrategyProjection] = []
	for name, rate in strategies:
		sip = monthly_sip_required(
			target_amount=payload.target_amount,
			years=years,
			expected_return_rate=rate,
			starting_amount=payload.starting_amount,
			inflation_rate=infl,
		)
		projections.append(StrategyProjection(name=name, expected_return_rate=rate, recommended_sip=round(sip, 2)))
	# Default recommended (based on provided expected_return_rate)
	recommended = monthly_sip_required(
		target_amount=payload.target_amount,
		years=years,
		expected_return_rate=payload.expected_return_rate,
		starting_amount=payload.starting_amount,
		inflation_rate=infl,
	)
	current_progress = await get_linked_assets_value(user_id, payload.linked_assets or [])
	record = {
		"id": goal_id,
		"user_id": user_id,
		"title": payload.title,
		"target_amount": payload.target_amount,
		"target_date": payload.target_date,
		"starting_amount": payload.starting_amount,
		"current_sip": payload.current_sip,
		"expected_return_rate": payload.expected_return_rate,
		"inflation_rate": payload.inflation_rate,
		"salary_growth_rate": payload.salary_growth_rate,
		"risk_profile": payload.risk_profile,
		"goal_category": payload.goal_category,
		"linked_assets": payload.linked_assets or [],
		"priority_level": payload.priority_level,
		"expected_inflation_rate": infl,
		"recommended_sip": round(recommended, 2),
		"projections": [p.model_dump() for p in projections],
		"current_progress": round(current_progress, 2),
		"created_at": datetime.utcnow(),
	}
	_GOALS_BY_USER.setdefault(user_id, {})[goal_id] = record
	return Goal(**record)

@app.delete("/{user_id}/{goal_id}")
async def delete_goal(user_id: str, goal_id: str):
	user_goals = _GOALS_BY_USER.get(user_id)
	if not user_goals or goal_id not in user_goals:
		raise HTTPException(status_code=404, detail="Goal not found")
	del user_goals[goal_id]
	return {"ok": True}
