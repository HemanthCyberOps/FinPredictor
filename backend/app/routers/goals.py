from fastapi import APIRouter, HTTPException
from typing import Dict, List
from datetime import date
import uuid
import math

from ..schemas import GoalCreate, Goal

router = APIRouter()

_GOALS_BY_USER: Dict[str, Dict[str, Dict]] = {}


def _monthly_sip_required(target_amount: float, years: float, expected_return_rate: float, starting_amount: float = 0.0, inflation_rate: float = 0.0):
	# Adjust target for inflation
	inflation_adjusted_target = target_amount * ((1 + inflation_rate) ** years)
	monthly_rate = expected_return_rate / 12.0
	n_months = int(years * 12)
	fv_of_lumpsum = starting_amount * ((1 + monthly_rate) ** n_months)
	required_fv_from_sip = max(inflation_adjusted_target - fv_of_lumpsum, 0)
	if monthly_rate == 0:
		return required_fv_from_sip / max(n_months, 1)
	factor = (((1 + monthly_rate) ** n_months) - 1) / monthly_rate
	return required_fv_from_sip / max(factor, 1e-9)


@router.get("/{user_id}", response_model=List[Goal])
async def list_goals(user_id: str):
	user_goals = _GOALS_BY_USER.get(user_id, {})
	return [Goal(**g) for g in user_goals.values()]


@router.post("/{user_id}", response_model=Goal)
async def create_goal(user_id: str, payload: GoalCreate):
	goal_id = str(uuid.uuid4())
	years = max((payload.target_date.year - date.today().year) + (payload.target_date.timetuple().tm_yday - date.today().timetuple().tm_yday) / 365.0, 0)
	recommended_sip = _monthly_sip_required(
		target_amount=payload.target_amount,
		years=years,
		expected_return_rate=payload.expected_return_rate,
		starting_amount=payload.starting_amount,
		inflation_rate=payload.inflation_rate,
	)
	record = {
		"id": goal_id,
		"user_id": user_id,
		"title": payload.title,
		"target_amount": payload.target_amount,
		"target_date": payload.target_date,
		"starting_amount": payload.starting_amount,
		"current_sip": max(payload.current_sip, recommended_sip),
		"expected_return_rate": payload.expected_return_rate,
		"inflation_rate": payload.inflation_rate,
		"salary_growth_rate": payload.salary_growth_rate,
	}
	_GOALS_BY_USER.setdefault(user_id, {})[goal_id] = record
	return Goal(**record)


@router.delete("/{user_id}/{goal_id}")
async def delete_goal(user_id: str, goal_id: str):
	user_goals = _GOALS_BY_USER.get(user_id)
	if not user_goals or goal_id not in user_goals:
		raise HTTPException(status_code=404, detail="Goal not found")
	del user_goals[goal_id]
	return {"ok": True}
