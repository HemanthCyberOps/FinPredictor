from fastapi import APIRouter, HTTPException
from typing import Dict
import uuid

from ..schemas import UserCreate, User, LoginRequest

router = APIRouter()

_USERS: Dict[str, Dict] = {}
_EMAIL_TO_ID: Dict[str, str] = {}


@router.post("/signup", response_model=User)
async def signup(payload: UserCreate):
	if payload.email in _EMAIL_TO_ID:
		raise HTTPException(status_code=400, detail="Email already registered")
	user_id = str(uuid.uuid4())
	user = {
		"id": user_id,
		"name": payload.name,
		"age": payload.age,
		"dob": payload.dob,
		"email": payload.email,
		"password": payload.password,
		"profile_photo_url": payload.profile_photo_url,
		"risk_profile": payload.risk_profile,
		"monthly_income": payload.monthly_income,
	}
	_USERS[user_id] = user
	_EMAIL_TO_ID[payload.email] = user_id
	return User(**{k: v for k, v in user.items() if k != "password"})


@router.post("/login", response_model=User)
async def login(payload: LoginRequest):
	user_id = _EMAIL_TO_ID.get(payload.email)
	if not user_id:
		raise HTTPException(status_code=401, detail="Invalid credentials")
	user = _USERS[user_id]
	if user.get("password") != payload.password:
		raise HTTPException(status_code=401, detail="Invalid credentials")
	return User(**{k: v for k, v in user.items() if k != "password"})


@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str):
	user = _USERS.get(user_id)
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	return User(**{k: v for k, v in user.items() if k != "password"})
