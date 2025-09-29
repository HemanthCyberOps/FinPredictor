# Environment Variables

Frontend
- VITE_API_BASE: Gateway base URL (default http://localhost:8080)

Llama 4
- LLAMA_API_URL: Inference endpoint URL
- LLAMA_MODEL: Model name (e.g., meta-llama-4)
- LLAMA_API_KEY: API key/token

Cerebras
- CEREBRAS_API_URL: Analytics/optimization endpoint URL
- CEREBRAS_API_KEY: API key/token

Docker Compose
- docker-compose.micro.yml passes these to `ai_service`.
