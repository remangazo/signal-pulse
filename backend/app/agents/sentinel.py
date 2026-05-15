"""
Sentinel Agent — monitors social platforms for potential leads.
Uses Reddit API directly + Apify for X/Twitter scraping.
"""
import httpx
from typing import Optional
from app.config import get_settings

settings = get_settings()


async def search_reddit(search_terms: list[str], subreddits: list[str] | None = None) -> list[dict]:
    results = []
    seen = set()
    for term in search_terms[:5]:
        if len(results) >= 40:
            break
        try:
            url = "https://www.reddit.com/search.json"
            params = {
                "q": term,
                "sort": "relevance",
                "t": "week",
                "limit": 10,
                "type": "link",
            }
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(url, params=params, headers={"User-Agent": "SignalPulse/1.0"})
                if resp.status_code == 200:
                    data = resp.json()
                    for post in data.get("data", {}).get("children", []):
                        d = post.get("data", {})
                        post_id = d.get("id", "")
                        if post_id in seen:
                            continue
                        seen.add(post_id)
                        results.append({
                            "source": "reddit",
                            "content": f"{d.get('title', '')}\n{d.get('selftext', '')}",
                            "author": d.get("author", ""),
                            "url": f"https://reddit.com{d.get('permalink', '')}",
                            "title": d.get("title", ""),
                            "score": d.get("score", 0),
                            "num_comments": d.get("num_comments", 0),
                            "subreddit": d.get("subreddit", ""),
                            "created_utc": d.get("created_utc", 0),
                        })
        except Exception as e:
            print(f"Reddit search error for '{term}': {e}")
            continue
    return results


async def search_x_twitter(search_terms: list[str]) -> list[dict]:
    from apify_client import ApifyClient
    if not settings.apify_api_key:
        return _mock_x_results(search_terms)

    client = ApifyClient(settings.apify_api_key)
    results = []
    for term in search_terms:
        try:
            run = client.actor("apify~twitter-tweets-scraper").call(
                run_input={"searchTerms": [term], "maxTweets": 20, "includeReplies": True}
            )
            items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
            results.extend(items)
        except Exception as e:
            print(f"X/Twitter search error for '{term}': {e}")
            continue
    return results


async def gather_raw_leads(
    search_terms: list[str],
    subreddits: list[str] | None = None,
    sources: list[str] | None = None,
) -> list[dict]:
    all_leads = []

    if not sources or "reddit" in sources:
        reddit_results = await search_reddit(search_terms, subreddits)
        for r in reddit_results:
            all_leads.append({
                "source": "reddit",
                "content": r.get("content", ""),
                "author": r.get("author", ""),
                "url": r.get("url", ""),
                "title": r.get("title", ""),
                "score": r.get("score", 0),
                "num_comments": r.get("num_comments", 0),
            })

    if not sources or "x" in sources:
        x_results = await search_x_twitter(search_terms)
        for r in x_results:
            all_leads.append({
                "source": "x",
                "content": r.get("text", ""),
                "author": r.get("user", {}).get("username", ""),
                "url": r.get("url", ""),
                "retweet_count": r.get("retweetCount", 0),
                "like_count": r.get("likeCount", 0),
            })

    return all_leads


def _mock_x_results(search_terms: list[str]) -> list[dict]:
    return []
