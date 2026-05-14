"""
Sentinel Agent — monitors social platforms for potential leads.
Uses Apify actors for Reddit/X scraping, with keyword/trigger matching.
"""
from typing import Optional
from apify_client import ApifyClient
from app.config import get_settings

settings = get_settings()
client = ApifyClient(settings.apify_api_key) if settings.apify_api_key else None

SEARCH_SOURCES = [
    {"name": "reddit", "apify_actor": "tr/nwaskito~reddit-search-scraper"},
    {"name": "reddit_comments", "apify_actor": "tr/nwaskito~reddit-comments-scraper"},
    {"name": "x_twitter", "apify_actor": "quacker/twitter-scraper"},
]


async def search_reddit(search_terms: list[str], subreddits: list[str] | None = None) -> list[dict]:
    if not client:
        return _mock_reddit_results(search_terms)

    results = []
    for term in search_terms:
        run_input = {
            "searchTerms": [term],
            "maxPosts": 20,
            "includeComments": True,
        }
        if subreddits:
            run_input["subreddits"] = subreddits

        try:
            run = client.actor("tr/nwaskito~reddit-search-scraper").call(run_input=run_input)
            items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
            results.extend(items)
        except Exception:
            continue
    return results


async def search_x_twitter(search_terms: list[str]) -> list[dict]:
    if not client:
        return _mock_x_results(search_terms)

    results = []
    for term in search_terms:
        run_input = {
            "searchTerms": [term],
            "tweetsDesired": 20,
            "includeReplies": True,
        }
        try:
            run = client.actor("quacker/twitter-scraper").call(run_input=run_input)
            items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
            results.extend(items)
        except Exception:
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
                "content": r.get("text", r.get("title", "")),
                "author": r.get("author", ""),
                "url": r.get("url", ""),
                "title": r.get("title", ""),
                "score": r.get("score", 0),
                "num_comments": r.get("numComments", 0),
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


def _mock_reddit_results(search_terms: list[str]) -> list[dict]:
    return [
        {
            "source": "reddit",
            "content": f"I'm really frustrated with how slow our current analytics tool is. Looking for something faster that doesn't cost a fortune. Anyone tried alternatives to {search_terms[0] if search_terms else 'the usual tools'}?",
            "author": "frustrated_founder",
            "url": "https://reddit.com/r/SaaS/comments/mock1",
            "title": "Tired of slow analytics",
            "score": 15,
            "num_comments": 8,
        },
        {
            "source": "reddit",
            "content": "We've been using ToolX for 2 years and the pricing just doubled. Need a replacement ASAP. What are people using for {search_terms[1] if len(search_terms) > 1 else 'this'}?",
            "author": "cost_cutter",
            "url": "https://reddit.com/r/Entrepreneur/comments/mock2",
            "title": "ToolX doubled pricing, need alternatives",
            "score": 42,
            "num_comments": 23,
        },
    ]


def _mock_x_results(search_terms: list[str]) -> list[dict]:
    return [
        {
            "source": "x",
            "content": f"honestly so tired of manual {search_terms[0] if search_terms else 'reporting'}, there has to be a better way to automate this",
            "author": "tech_founder",
            "url": "https://x.com/tech_founder/status/mock1",
            "retweet_count": 5,
            "like_count": 12,
        },
    ]
