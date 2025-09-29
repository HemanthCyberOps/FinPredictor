from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="FinPredictor AI Service", version="0.1.0")

class AiInsight(BaseModel):
	title: str
	detail: str

class AiResponse(BaseModel):
	recommendations: List[AiInsight]
	note: str | None = None

class PredictionRequest(BaseModel):
	user_id: str

@app.get("/")
async def health():
	return {"service": "ai", "status": "ok"}

@app.post("/predict", response_model=AiResponse)
async def predict(_: PredictionRequest):
	insights = [
		AiInsight(title="Market Outlook", detail="Volatility expected; keep diversified SIPs."),
		AiInsight(title="SIP Adjustment", detail="Increase equity SIP by 10% for goals."),
	]
	return AiResponse(recommendations=insights, note="Demo insights; connect Llama/Cerebras later.")
