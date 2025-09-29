from fastapi import FastAPI, Request
import httpx
import os

app = FastAPI(title="FinPredictor API Gateway", version="0.1.0")

USERS_URL = os.getenv('USERS_URL', 'http://users_service:8001')
PORTFOLIO_URL = os.getenv('PORTFOLIO_URL', 'http://portfolio_service:8002')
GOALS_URL = os.getenv('GOALS_URL', 'http://goals_service:8003')
AI_URL = os.getenv('AI_URL', 'http://ai_service:8004')

@app.get("/")
async def health():
	return {"gateway": "ok"}

async def _proxy(method: str, url: str, request: Request):
	async with httpx.AsyncClient() as client:
		data = await request.body()
		headers = dict(request.headers)
		resp = await client.request(method, url, content=data, headers=headers, params=dict(request.query_params))
		return app.response_class(resp.content, status_code=resp.status_code, media_type=resp.headers.get('content-type'))

# Users
@app.api_route("/api/users/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_users(path: str, request: Request):
	return await _proxy(request.method, f"{USERS_URL}/{path}", request)

# Portfolio
@app.api_route("/api/portfolio/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_portfolio(path: str, request: Request):
	return await _proxy(request.method, f"{PORTFOLIO_URL}/{path}", request)

# Goals
@app.api_route("/api/goals/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_goals(path: str, request: Request):
	return await _proxy(request.method, f"{GOALS_URL}/{path}", request)

# AI
@app.api_route("/api/ai/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_ai(path: str, request: Request):
	return await _proxy(request.method, f"{AI_URL}/{path}", request)
