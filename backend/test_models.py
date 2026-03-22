import os
import httpx
import asyncio
import time
from dotenv import load_dotenv

load_dotenv()

# Configuration
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
API_BASE = "https://models.inference.ai.azure.com"
CATALOG_URL = "https://models.github.ai/catalog/models"
TEST_PROMPT = "Explain the Fibonacci sequence in one short paragraph."

async def get_available_models(client: httpx.AsyncClient, token: str):
    print("Fetching available models from GitHub Models catalog...")
    try:
        resp = await client.get(
            CATALOG_URL,
            headers={
                "Accept": "application/vnd.github+json",
                "Authorization": f"Bearer {token}",
                "X-GitHub-Api-Version": "2026-03-10" # As seen in previous API calls
            },
            timeout=10.0
        )
        if resp.status_code != 200:
            # Try earlier API version fallback
            resp = await client.get(
                CATALOG_URL,
                headers={
                    "Accept": "application/vnd.github+json",
                    "Authorization": f"Bearer {token}",
                    "X-GitHub-Api-Version": "2022-11-28"
                },
                timeout=10.0
            )

        if resp.status_code == 200:
            catalog = resp.json()
            return [model['id'] for model in catalog]
        else:
            print(f"Failed to fetch catalog: {resp.status_code}")
            return []
    except Exception as e:
        print(f"Error fetching catalog: {e}")
        return []

async def test_model(client: httpx.AsyncClient, model_id: str, token: str):
    print(f"Testing {model_id:35} ... ", end="", flush=True)
    start = time.perf_counter()
    try:
        # The Azure Inference API accepts either the full id or the short name in many cases.
        # But for GitHub Models via Inference API, the Azure format usually accepts the raw catalog ID 
        # (e.g., 'openai/gpt-4o' or just 'gpt-4o'). We will use the direct ID.
        # However, many docs say 'gpt-4o' is used. Let's try sending the exact ID from catalog first.
        # If it fails, we fall back to short name.
        
        # We use httpx directly to Azure inference API to test raw connectivity and model support.
        resp = await client.post(
            f"{API_BASE}/chat/completions",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json={
                "model": model_id,
                "messages": [{"role": "user", "content": TEST_PROMPT}],
                "max_tokens": 100
            },
            timeout=30.0
        )
        latency = (time.perf_counter() - start) * 1000
        
        if resp.status_code == 200:
            print(f"[OK] ({latency:.0f}ms)")
            return True, model_id, latency, ""
        elif "Unknown model" in resp.text or resp.status_code == 404:
            # Try fallback: split prefix (e.g. openai/gpt-4o -> gpt-4o)
            short_id = model_id.split("/")[-1] if "/" in model_id else model_id
            
            resp2 = await client.post(
                f"{API_BASE}/chat/completions",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json={"model": short_id, "messages": [{"role": "user", "content": TEST_PROMPT}], "max_tokens": 100},
                timeout=30.0
            )
            latency = (time.perf_counter() - start) * 1000
            if resp2.status_code == 200:
                print(f"[OK] ({latency:.0f}ms) (used short ID: {short_id})")
                return True, model_id, latency, ""
            else:
                err_msg = resp2.text[:100]
                print(f"[FAIL] (Status {resp2.status_code}: {err_msg})")
                return False, model_id, latency, f"Status {resp2.status_code}: {err_msg}"
        else:
            err_msg = resp.text[:100]
            print(f"[FAIL] (Status {resp.status_code}: {err_msg})")
            return False, model_id, latency, f"Status {resp.status_code}: {err_msg}"
            
    except Exception as e:
        latency = (time.perf_counter() - start) * 1000
        print(f"[ERROR] ({str(e)})")
        return False, model_id, latency, str(e)

async def main():
    token = GITHUB_TOKEN
    if not token:
        print("="*60)
        print("ERROR: GITHUB_TOKEN not found in environment or .env file.")
        print("="*60)
        print("To test models, you need a GitHub Personal Access Token (PAT).")
        print("1. Go to https://github.com/settings/tokens")
        print("2. Generate a token with 'models:read' scope.")
        print("3. Set it in your environment: set GITHUB_TOKEN=your_token")
        print("4. Or add it to backend/.env: GITHUB_TOKEN=your_token")
        print("="*60)
        return

    print("="*60)
    print(f"GITHUB MODELS ARENA - DYNAMIC BULK TEST ENGINE")
    print(f"Token: {token[:4]}...{token[-4:]}")
    print("="*60)

    async with httpx.AsyncClient() as client:
        models = await get_available_models(client, token)
        if not models:
            print("No models found or failed to fetch catalog. Using fallback models...")
            models = ["gpt-4o", "claude-3.5-sonnet", "phi-4"]

        print(f"Found {len(models)} models. Beginning validation...")
        print("-" * 60)

        results = []
        for model in models:
            res = await test_model(client, model, token)
            results.append(res)
            await asyncio.sleep(1.0) # Respect rate limits during test
            
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = [r for r in results if r[0]]
    failed = [r for r in results if not r[0]]
    
    for ok, name, lat, err in results:
        status = "[OK]" if ok else "[FAIL]"
        print(f"{status} {name:35} | {lat:6.0f}ms | {err}")
        
    print("-" * 60)
    print(f"TOTAL: {len(results)} | PASSED: {len(passed)} | FAILED: {len(failed)}")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(main())
