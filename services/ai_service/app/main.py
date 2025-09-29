from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import os
import httpx

app = FastAPI(title="FinPredictor AI Service", version="0.2.0")

class AiInsight(BaseModel):
	title: str
	detail: str

class AiResponse(BaseModel):
	recommendations: List[AiInsight]
	note: str | None = None

class PredictionRequest(BaseModel):
	user_id: str
	portfolio: dict | None = None
	goals: list[dict] | None = None

LLAMA_API_URL = os.getenv('LLAMA_API_URL', '')
LLAMA_MODEL = os.getenv('LLAMA_MODEL', 'meta-llama-4')
LLAMA_API_KEY = os.getenv('LLAMA_API_KEY', '')
CEREBRAS_API_URL = os.getenv('CEREBRAS_API_URL', '')
CEREBRAS_API_KEY = os.getenv('CEREBRAS_API_KEY', '')

@app.get("/")
async def health():
	return {"service": "ai", "status": "ok"}

async def call_llama(prompt: str) -> List[AiInsight]:
	if not (LLAMA_API_URL and LLAMA_API_KEY):
		return [AiInsight(title="Llama (demo)", detail="Env not set; returning placeholder insight.")]
	headers = {"Authorization": f"Bearer {LLAMA_API_KEY}", "Content-Type": "application/json"}
	payload = {"model": LLAMA_MODEL, "input": prompt}
	try:
		async with httpx.AsyncClient(timeout=20) as client:
			resp = await client.post(LLAMA_API_URL, json=payload, headers=headers)
			resp.raise_for_status()
			data = resp.json()
			text = data.get("output") or data.get("choices", [{}])[0].get("text", "")
			return [AiInsight(title="Llama Insight", detail=text[:500] or "No content")] 
	except Exception as e:
		return [AiInsight(title="Llama Error", detail=str(e))]

async def call_cerebras(portfolio: dict | None, goals: list[dict] | None) -> List[AiInsight]:
	if not (CEREBRAS_API_URL and CEREBRAS_API_KEY):
		return [AiInsight(title="Cerebras (demo)", detail="Env not set; returning placeholder optimization.")]
	headers = {"Authorization": f"Bearer {CEREBRAS_API_KEY}", "Content-Type": "application/json"}
	payload = {"portfolio": portfolio or {}, "goals": goals or []}
	try:
		async with httpx.AsyncClient(timeout=20) as client:
			resp = await client.post(CEREBRAS_API_URL, json=payload, headers=headers)
			resp.raise_for_status()
			data = resp.json()
			suggestions = data.get("suggestions") or data.get("recommendations") or []
			if isinstance(suggestions, list) and suggestions:
				return [AiInsight(title="Cerebras Suggestion", detail=str(s)[:500]) for s in suggestions]
			return [AiInsight(title="Cerebras", detail=str(data)[:500])]
	except Exception as e:
		return [AiInsight(title="Cerebras Error", detail=str(e))]

@app.post("/predict", response_model=AiResponse)
async def predict(payload: PredictionRequest):
	prompt = "Provide SIP adjustments and risk analysis given a portfolio and goals."
	llama_insights = await call_llama(prompt)
	cerebras_insights = await call_cerebras(payload.portfolio, payload.goals)
	insights = llama_insights + cerebras_insights
	return AiResponse(recommendations=insights, note="Uses Llama 4 and Cerebras when env is configured.")
