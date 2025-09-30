from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

app = FastAPI(title="FinPredictor API Gateway", version="0.1.0")

# CORS for local dev
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Default to loopback for local dev; override via env in Docker
USERS_URL = os.getenv('USERS_URL', 'http://127.0.0.1:8001')
PORTFOLIO_URL = os.getenv('PORTFOLIO_URL', 'http://127.0.0.1:8002')
GOALS_URL = os.getenv('GOALS_URL', 'http://127.0.0.1:8003')
AI_URL = os.getenv('AI_URL', 'http://127.0.0.1:8004')

@app.get("/")
async def health():
	return {"gateway": "ok"}

async def _proxy(method: str, url: str, request: Request):
	async with httpx.AsyncClient() as client:
		try:
			if method.upper() == 'OPTIONS':
				return JSONResponse(status_code=200, content={"ok": True})
			data = await request.body()
			incoming = request.headers
			forward_headers = {}
			if 'content-type' in incoming:
				forward_headers['content-type'] = incoming['content-type']
			if 'accept' in incoming:
				forward_headers['accept'] = incoming['accept']
			if 'authorization' in incoming:
				forward_headers['authorization'] = incoming['authorization']
			resp = await client.request(method, url, content=data, headers=forward_headers, params=dict(request.query_params))
			return Response(content=resp.content, status_code=resp.status_code, media_type=resp.headers.get('content-type'))
		except httpx.HTTPStatusError as he:
			return JSONResponse(status_code=he.response.status_code, content={"error": "upstream_status_error", "detail": he.response.text})
		except httpx.RequestError as re:
			return JSONResponse(status_code=502, content={"error": "upstream_connect_error", "detail": str(re)})
		except Exception as e:
			return JSONResponse(status_code=500, content={"error": "gateway_exception", "detail": str(e)})

# Users
@app.api_route("/api/users/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"])
async def proxy_users(path: str, request: Request):
	return await _proxy(request.method, f"{USERS_URL}/{path}", request)

# Portfolio
@app.api_route("/api/portfolio/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"])
async def proxy_portfolio(path: str, request: Request):
	return await _proxy(request.method, f"{PORTFOLIO_URL}/{path}", request)

# Goals
@app.api_route("/api/goals/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"])
async def proxy_goals(path: str, request: Request):
	return await _proxy(request.method, f"{GOALS_URL}/{path}", request)

# AI
@app.api_route("/api/ai/{path:path}", methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"])
async def proxy_ai(path: str, request: Request):
	return await _proxy(request.method, f"{AI_URL}/{path}", request)
