"""
Sentinel Agent — monitors social platforms for potential leads.
Uses Reddit API. Returns mock data on failure.
"""
import httpx
from app.config import get_settings

settings = get_settings()


async def search_reddit(search_terms: list[str]) -> list[dict]:
    results = []
    seen = set()
    for term in search_terms[:3]:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(
                    "https://www.reddit.com/search.json",
                    params={"q": term, "sort": "relevance", "t": "week", "limit": 5, "type": "link"},
                    headers={"User-Agent": "SignalPulse/1.0"},
                )
                if resp.status_code == 200:
                    for post in resp.json().get("data", {}).get("children", []):
                        d = post.get("data", {})
                        pid = d.get("id", "")
                        if pid in seen:
                            continue
                        seen.add(pid)
                        results.append({
                            "source": "reddit",
                            "content": f"{d.get('title', '')}\n{d.get('selftext', '')}",
                            "author": d.get("author", ""),
                            "url": f"https://reddit.com{d.get('permalink', '')}",
                            "score": d.get("score", 0),
                        })
        except Exception as e:
            print(f"Reddit error for '{term}': {e}")
            continue
    return results


async def gather_raw_leads(search_terms: list[str]) -> list[dict]:
    return await search_reddit(search_terms)
