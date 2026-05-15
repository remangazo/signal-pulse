"""
Firecrawl integration — scrape, crawl, and search the web.
"""
import httpx
from app.config import get_settings

settings = get_settings()
API_KEY = settings.firecrawl_api_key
BASE = "https://api.firecrawl.dev/v1"


async def scrape(url: str, formats: list[str] | None = None) -> dict | None:
    if not API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            resp = await c.post(
                f"{BASE}/scrape",
                json={"url": url, "formats": formats or ["markdown"]},
                headers={"Authorization": f"Bearer {API_KEY}"},
            )
            data = resp.json()
            return data.get("data") if data.get("success") else None
    except Exception:
        return None


async def crawl(url: str, max_pages: int = 10) -> list[dict]:
    if not API_KEY:
        return []
    try:
        async with httpx.AsyncClient(timeout=60) as c:
            resp = await c.post(
                f"{BASE}/crawl",
                json={"url": url, "maxPages": max_pages, "formats": ["markdown"]},
                headers={"Authorization": f"Bearer {API_KEY}"},
            )
            data = resp.json()
            if not data.get("success"):
                return []
            job_id = data.get("id")
            if not job_id:
                return []

            import asyncio
            for _ in range(20):
                await asyncio.sleep(3)
                status = await c.get(f"{BASE}/crawl/{job_id}", headers={"Authorization": f"Bearer {API_KEY}"})
                s = status.json()
                if s.get("status") == "completed":
                    return s.get("data", [])
                if s.get("status") in ("failed", "cancelled"):
                    return []
            return []
    except Exception:
        return []


async def search(query: str, max_results: int = 5) -> list[dict]:
    if not API_KEY:
        return []
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            resp = await c.post(
                f"{BASE}/search",
                json={"query": query, "maxResults": max_results, "formats": ["markdown"]},
                headers={"Authorization": f"Bearer {API_KEY}"},
            )
            data = resp.json()
            if not data.get("success"):
                return []
            return data.get("data", [])
    except Exception:
        return []
