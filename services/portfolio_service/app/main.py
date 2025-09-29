from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List
from datetime import datetime
import uuid

app = FastAPI(title="FinPredictor Portfolio Service", version="0.1.0")

class Asset(BaseModel):
	id: str
	type: str
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

_ASSETS_BY_USER: Dict[str, Dict[str, Dict]] = {}

@app.get("/")
async def health():
	return {"service": "portfolio", "status": "ok"}

@app.get("/{user_id}", response_model=Portfolio)
async def get_portfolio(user_id: str):
	user_assets = _ASSETS_BY_USER.get(user_id, {})
	assets: List[Asset] = [
		Asset(
			id=a_id,
			type=a["type"],
			symbol=a["symbol"],
			name=a["name"],
			units=a["units"],
			buy_price=a["buy_price"],
			current_price=a.get("current_price", a["buy_price"]),
			last_updated=a.get("last_updated", datetime.utcnow()),
		)
		for a_id, a in user_assets.items()
	]
	return Portfolio(user_id=user_id, assets=assets)

@app.post("/{user_id}/assets", response_model=Asset)
async def add_asset(user_id: str, payload: AssetCreate):
	asset_id = str(uuid.uuid4())
	user_assets = _ASSETS_BY_USER.setdefault(user_id, {})
	record = {
		"id": asset_id,
		"type": payload.type,
		"symbol": payload.symbol,
		"name": payload.name,
		"units": payload.units,
		"buy_price": payload.buy_price,
		"current_price": payload.buy_price,
		"last_updated": datetime.utcnow(),
	}
	user_assets[asset_id] = record
	return Asset(**record)

@app.delete("/{user_id}/assets/{asset_id}")
async def delete_asset(user_id: str, asset_id: str):
	user_assets = _ASSETS_BY_USER.get(user_id)
	if not user_assets or asset_id not in user_assets:
		raise HTTPException(status_code=404, detail="Asset not found")
	del user_assets[asset_id]
	return {"ok": True}
