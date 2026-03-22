import asyncio
import time
import os
import httpx
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import litellm
from litellm import acompletion
from dotenv import load_dotenv

load_dotenv()

# Enable LiteLLM debugging
litellm.set_verbose = True

app = FastAPI(title="Anti-Gravity Model Comparison API")


GITHUB_CLIENT_ID = os.getenv("GITHUB_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Enable CORS for Next.js and Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CompareRequest(BaseModel):
    user_prompt: str
    github_token: Optional[str] = None
    models: list[str] = ["gpt-4o", "claude-3-5-sonnet", "phi-4"]

class ModelResponse(BaseModel):
    model_name: str
    content: str
    latency: float
    tokens: int
    error: Optional[str] = None

@app.get("/login/github")
async def login_github():
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GITHUB_ID not configured")
    return RedirectResponse(
        f"https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}&scope=user"
    )

@app.get("/auth/callback")
async def auth_callback(code: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
            },
        )
        data = response.json()
        if "access_token" not in data:
            return RedirectResponse(f"{FRONTEND_URL}?error=auth_failed")
        
        token = data["access_token"]
        return RedirectResponse(f"{FRONTEND_URL}?token={token}")

@app.get("/models")
async def get_github_models(authorization: Optional[str] = Header(None)):
    token = ""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Token required")

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                "https://models.github.ai/catalog/models",
                headers={
                    "Accept": "application/vnd.github+json",
                    "Authorization": f"Bearer {token}",
                    "X-GitHub-Api-Version": "2026-03-10"
                }
            )
            return resp.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

async def call_model(model_name: str, prompt: str, token: str) -> ModelResponse:
    start_time = time.perf_counter()
    try:
        if model_name.startswith("mock/"):
            await asyncio.sleep(1.2)
            content = f"Mock response from {model_name}. No token needed! \n\nPrompt: {prompt}"
            tokens = 42
        else:
            # GitHub Models Inference API requires OpenAI-style Authorization Headers 
            # (Bearer token) for all models, including Claude and Gemini.
            # Using the 'custom_openai/' prefix tells LiteLLM to use the OpenAI 
            # provider logic (sending standard headers) but avoids local model-name validation.
            response = await acompletion(
                model=f"custom_openai/{model_name}",
                messages=[{"role": "user", "content": prompt}],
                api_key=token,
                api_base="https://models.inference.ai.azure.com",
                timeout=45
            )
            content = response.choices[0].message.content
            tokens = response.usage.total_tokens

        latency = (time.perf_counter() - start_time) * 1000
        return ModelResponse(
            model_name=model_name,
            content=content,
            latency=round(latency, 2),
            tokens=tokens
        )
    except Exception as e:
        print(f"Error calling {model_name}: {e}")
        latency = (time.perf_counter() - start_time) * 1000
        return ModelResponse(
            model_name=model_name,
            content="",
            latency=round(latency, 2),
            tokens=0,
            error=str(e)
        )


@app.post("/compare", response_model=List[ModelResponse])
async def compare_models(request: CompareRequest, authorization: Optional[str] = Header(None)):
    token = request.github_token
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            
    if not token:
        raise HTTPException(
            status_code=401, 
            detail="GitHub Token/Session is required. Please login with GitHub."
        )

    tasks = [
        asyncio.create_task(call_model(model, request.user_prompt, token))
        for model in request.models
    ]
    results = await asyncio.gather(*tasks)
    return results

@app.post("/test-models", response_model=List[ModelResponse])
async def test_all_models(request: CompareRequest, authorization: Optional[str] = Header(None)):
    """Sequential test to avoid hitting rate limits too fast during a bulk test"""
    token = request.github_token
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            
    if not token:
        raise HTTPException(status_code=401, detail="Token required")

    results = []
    for model in request.models:
        res = await call_model(model, request.user_prompt, token)
        results.append(res)
        await asyncio.sleep(0.5) # small cooling period
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

