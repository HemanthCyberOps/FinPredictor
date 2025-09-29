from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List
from datetime import date
import uuid

app = FastAPI(title="FinPredictor Goals Service", version="0.1.0")

class GoalCreate(BaseModel):
	title: str
	target_amount: float
	target_date: date
	starting_amount: float = 0
	current_sip: float = 0
	expected_return_rate: float = 0.12
	inflation_rate: float = 0.05
	salary_growth_rate: float = 0.05

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

_GOALS_BY_USER: Dict[str, Dict[str, Dict]] = {}

@app.get("/")
async def health():
	return {"service": "goals", "status": "ok"}

@app.get("/{user_id}", response_model=List[Goal])
async def list_goals(user_id: str):
	user_goals = _GOALS_BY_USER.get(user_id, {})
	return [Goal(**g) for g in user_goals.values()]

@app.post("/{user_id}", response_model=Goal)
async def create_goal(user_id: str, payload: GoalCreate):
	goal_id = str(uuid.uuid4())
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
