import os
from typing import List
from ..schemas import AiInsight

class CerebrasClient:
	def __init__(self):
		self.base_url = os.getenv('CEREBRAS_API_URL', 'https://mock-cerebras.local')
		self.api_key = os.getenv('CEREBRAS_API_KEY', 'demo')

	async def analyze_portfolio(self, portfolio) -> List[AiInsight]:
		return [
			AiInsight(title="Cerebras Optimization", detail="Shift 5% from cash to equity index."),
		]
