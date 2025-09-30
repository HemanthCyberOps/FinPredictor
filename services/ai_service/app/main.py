from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import httpx

app = FastAPI(title="FinPredictor AI Service", version="0.1.0")


class AiInsight(BaseModel):
	title: str
	detail: str

class AiResponse(BaseModel):
	recommendations: List[AiInsight]
	note: str | None = None

class PredictionRequest(BaseModel):
	user_id: str
	message: Optional[str] = None
	portfolio: Optional[Dict[str, Any]] = None
	goals: Optional[List[Dict[str, Any]]] = None
	# Optional provider override ("llama" | "cerebras")
	provider: Optional[str] = None

@app.get("/")
async def health():
	return {"service": "ai", "status": "ok"}

def _build_prompt(payload: PredictionRequest) -> str:
	message = (payload.message or "Provide actionable insights for the user's portfolio and goals.").strip()
	portfolio = payload.portfolio or {"assets": []}
	goals = payload.goals or []
	parts = [
		"You are a financial planning assistant for the Indian market.",
		"Consider risk-aware, diversified, long-term investing and SIPs.",
		"Given the user's portfolio and goals, reply with 3-5 concise recommendations.",
		"Keep numeric suggestions practical (e.g., SIP changes, allocation tilts).",
		"User question:",
		message,
		"\nPortfolio (JSON):",
		str(portfolio),
		"\nGoals (JSON):",
		str(goals),
		"\nRespond as bullet points prefixed with '-' and include a short title in bold like '**Title**: detail'.",
	]
	return "\n".join(parts)

async def _call_llm(prompt: str, provider_hint: Optional[str] = None) -> Optional[str]:
	# Environment-configured providers
	llama_url = os.getenv("LLAMA_API_URL")
	llama_model = os.getenv("LLAMA_MODEL", "meta-llama/Meta-Llama-3.1-8B-Instruct")
	llama_key = os.getenv("LLAMA_API_KEY")
	cer_url = os.getenv("CEREBRAS_API_URL")
	cer_key = os.getenv("CEREBRAS_API_KEY")
	cer_model = os.getenv("CEREBRAS_MODEL", "llama-4-scout")

	# Provider preference
	providers = []
	if provider_hint == "llama" and llama_url and llama_key:
		providers = [("llama", llama_url, llama_key)]
	elif provider_hint == "cerebras" and cer_url and cer_key:
		providers = [("cerebras", cer_url, cer_key)]
	else:
		if llama_url and llama_key:
			providers.append(("llama", llama_url, llama_key))
		if cer_url and cer_key:
			providers.append(("cerebras", cer_url, cer_key))

	if not providers:
		return None

	# Try providers in order until one succeeds
	for name, base_url, api_key in providers:
		try:
			# Assume OpenAI-compatible /v1/chat/completions
			endpoint = base_url.rstrip("/") + "/v1/chat/completions"
			headers = {
				"Authorization": f"Bearer {api_key}",
				"Content-Type": "application/json",
			}
			body = {
				"model": llama_model if name == "llama" else cer_model,
				"messages": [
					{"role": "system", "content": "You are a helpful financial planning assistant."},
					{"role": "user", "content": prompt},
				],
				"temperature": 0.3,
				"max_tokens": 400,
			}
			async with httpx.AsyncClient(timeout=30) as client:
				resp = await client.post(endpoint, headers=headers, json=body)
				resp.raise_for_status()
				data = resp.json()
				content = (
					data.get("choices", [{}])[0]
					.get("message", {})
					.get("content")
				)
				if content:
					return content
		except Exception:
			# Try next provider
			continue
	return None

def _parse_recommendations(text: str) -> List[AiInsight]:
	lines = [l.strip() for l in (text or "").splitlines() if l.strip()]
	recs: List[AiInsight] = []
	for line in lines:
		if line.startswith("-"):
			clean = line[1:].strip()
		else:
			clean = line
		title = "Recommendation"
		detail = clean
		# Try to extract **Title**: detail
		if "**" in clean and ":" in clean:
			try:
				before, after = clean.split(":", 1)
				title = before.replace("**", "").strip() or title
				detail = after.strip() or detail
			except Exception:
				pass
		recs.append(AiInsight(title=title, detail=detail))
	# Fallback if nothing parsed
	if not recs:
		recs = [
			AiInsight(title="SIP Discipline", detail="Continue regular SIPs; avoid timing the market."),
			AiInsight(title="Rebalance", detail="Rebalance annually to maintain risk-aligned allocation."),
		]
	return recs[:5]

@app.post("/predict", response_model=AiResponse)
async def predict(payload: PredictionRequest):
	prompt = _build_prompt(payload)
	content = await _call_llm(prompt, provider_hint=payload.provider)
	if content:
		recs = _parse_recommendations(content)
		return AiResponse(recommendations=recs, note="Generated via LLM")
	# Demo fallback
	insights = [
		AiInsight(title="Market Outlook", detail="Volatility expected; keep diversified SIPs."),
		AiInsight(title="SIP Adjustment", detail="Increase equity SIP by 10% for goals."),
	]
	return AiResponse(recommendations=insights, note="Demo insights (LLM not configured)")
