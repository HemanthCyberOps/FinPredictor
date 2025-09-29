from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime, date
import uuid

app = FastAPI(title="FinPredictor Portfolio Service", version="0.4.0")

class Asset(BaseModel):
	id: str
	type: str
	symbol: str
	name: str
	units: float
	buy_price: float
	current_price: float
	last_updated: datetime
	goal_id: Optional[str] = None
	start_date: Optional[date] = None
	# Mutual fund
	sip_amount: Optional[float] = None
	expected_return: Optional[float] = None
	expense_ratio: Optional[float] = None
	exit_load: Optional[str] = None
	lock_in_period: Optional[int] = None
	cagr_years: Optional[int] = None
	# Bonds
	bond_type: Optional[str] = None
	face_value: Optional[float] = None
	coupon_rate: Optional[float] = None
	maturity_date: Optional[date] = None
	credit_rating: Optional[str] = None
	issue_date: Optional[date] = None
	interest_frequency: Optional[str] = None
	ytm: Optional[float] = None
	duration_bucket: Optional[str] = None
	inflation_protected: Optional[bool] = None
	# Crypto
	exchange_wallet: Optional[str] = None
	blockchain: Optional[str] = None
	token_type: Optional[str] = None
	transaction_hash: Optional[str] = None
	market_cap: Optional[float] = None
	volatility_24h: Optional[float] = None
	volatility_7d: Optional[float] = None
	circulating_supply: Optional[float] = None
	staking_yield: Optional[float] = None
	regulatory_status: Optional[str] = None
	# Cash / Deposits
	account_type: Optional[str] = None
	currency: Optional[str] = None
	interest_rate: Optional[float] = None
	deposit_start_date: Optional[date] = None
	deposit_maturity_date: Optional[date] = None
	liquidity: Optional[str] = None

class AssetCreate(BaseModel):
	type: str
	symbol: str
	name: str
	units: float
	buy_price: float
	current_price: Optional[float] = None
	goal_id: Optional[str] = None
	start_date: Optional[date] = None
	# Mutual fund
	sip_amount: Optional[float] = None
	expected_return: Optional[float] = None
	expense_ratio: Optional[float] = None
	exit_load: Optional[str] = None
	lock_in_period: Optional[int] = None
	cagr_years: Optional[int] = None
	# Bonds
	bond_type: Optional[str] = None
	face_value: Optional[float] = None
	coupon_rate: Optional[float] = None
	maturity_date: Optional[date] = None
	credit_rating: Optional[str] = None
	issue_date: Optional[date] = None
	interest_frequency: Optional[str] = None
	ytm: Optional[float] = None
	duration_bucket: Optional[str] = None
	inflation_protected: Optional[bool] = None
	# Crypto
	exchange_wallet: Optional[str] = None
	blockchain: Optional[str] = None
	token_type: Optional[str] = None
	transaction_hash: Optional[str] = None
	market_cap: Optional[float] = None
	volatility_24h: Optional[float] = None
	volatility_7d: Optional[float] = None
	circulating_supply: Optional[float] = None
	staking_yield: Optional[float] = None
	regulatory_status: Optional[str] = None
	# Cash / Deposits
	account_type: Optional[str] = None
	currency: Optional[str] = None
	interest_rate: Optional[float] = None
	deposit_start_date: Optional[date] = None
	deposit_maturity_date: Optional[date] = None
	liquidity: Optional[str] = None

class Portfolio(BaseModel):
	user_id: str
	assets: List[Asset]

_ASSETS_BY_USER: Dict[str, Dict[str, Dict]] = {}

@app.get("/")
async def health():
	return {"service": "portfolio", "status": "ok"}

@app.get("/{user_id}", response_model=Portfolio)
async def get_portfolio(user_id: str):
	user_assets = _ASSETS_BY_USER.get(user_id, {})
	assets: List[Asset] = [Asset(**{**a, "id": a_id, "current_price": a.get("current_price", a.get("buy_price", 0)), "last_updated": a.get("last_updated", datetime.utcnow())}) for a_id, a in user_assets.items()]
	return Portfolio(user_id=user_id, assets=assets)

@app.post("/{user_id}/assets", response_model=Asset)
async def add_asset(user_id: str, payload: AssetCreate):
	asset_id = str(uuid.uuid4())
	user_assets = _ASSETS_BY_USER.setdefault(user_id, {})
	record = payload.model_dump()
	record.update({
		"id": asset_id,
		"current_price": payload.current_price if payload.current_price is not None else payload.buy_price,
		"last_updated": datetime.utcnow(),
	})
	user_assets[asset_id] = record
	return Asset(**record)

@app.delete("/{user_id}/assets/{asset_id}")
async def delete_asset(user_id: str, asset_id: str):
	user_assets = _ASSETS_BY_USER.get(user_id)
	if not user_assets or asset_id not in user_assets:
		raise HTTPException(status_code=404, detail="Asset not found")
	del user_assets[asset_id]
	return {"ok": True}
