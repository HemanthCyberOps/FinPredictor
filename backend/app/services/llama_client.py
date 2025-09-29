import os
from typing import List
from ..schemas import AiInsight

class LlamaClient:
	def __init__(self):
		self.base_url = os.getenv('LLAMA_API_URL', 'https://mock-llama.local')
		self.model = os.getenv('LLAMA_MODEL', 'meta-llama-4')
		self.api_key = os.getenv('LLAMA_API_KEY', 'demo')

	async def get_insights(self, prompt: str) -> List[AiInsight]:
		# Placeholder: integrate real API calls here
		return [
			AiInsight(title="Llama Forecast", detail="Based on trends, maintain steady SIP growth."),
		]
