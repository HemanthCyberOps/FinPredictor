from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime


class UserCreate(BaseModel):
    name: str
    age: int
    dob: date
    email: EmailStr
    password: str
    profile_photo_url: Optional[str] = None
    risk_profile: Optional[str] = Field(default="moderate", description="low|moderate|high")
    monthly_income: Optional[float] = None


class User(BaseModel):
    id: str
    name: str
    age: int
    dob: date
    email: EmailStr
    profile_photo_url: Optional[str] = None
    risk_profile: Optional[str] = None
    monthly_income: Optional[float] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Asset(BaseModel):
    id: str
    type: str  # stock|mutual_fund|crypto|bond|cash|other
    symbol: str
    name: str
    units: float
    buy_price: float
    current_price: float
    last_updated: datetime


class AssetCreate(BaseModel):
    type: str
    symbol: str
    name: str
    units: float
    buy_price: float


class Portfolio(BaseModel):
    user_id: str
    assets: List[Asset]


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


class PredictionRequest(BaseModel):
    user_id: str
    portfolio: Optional[Portfolio] = None
    goals: Optional[List[Goal]] = None


class AiInsight(BaseModel):
    title: str
    detail: str


class AiResponse(BaseModel):
    recommendations: List[AiInsight]
    note: Optional[str] = None
