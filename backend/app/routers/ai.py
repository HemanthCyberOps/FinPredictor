from fastapi import APIRouter
from typing import List

from ..schemas import PredictionRequest, AiResponse, AiInsight

router = APIRouter()


def _mock_llama_insights() -> List[AiInsight]:
	return [
		AiInsight(title="Market Outlook", detail="Volatility expected near-term; maintain diversified SIPs."),
		AiInsight(title="SIP Adjustment", detail="Increase equity SIP by 10% to target goals sooner."),
	]


def _mock_cerebras_analytics() -> List[AiInsight]:
	return [
		AiInsight(title="Risk Alignment", detail="Current allocation is moderate; consider 60/30/10 equity/debt/cash."),
		AiInsight(title="Optimization", detail="Rebalance from underperforming small-cap to large-cap index."),
	]


@router.post("/predict", response_model=AiResponse)
async def predict(payload: PredictionRequest):
	insights = _mock_llama_insights() + _mock_cerebras_analytics()
	return AiResponse(recommendations=insights, note="Demo insights; plug real APIs later.")
