"""
Cartographer Agent — deep multi-step SaaS analysis:
1. Firecrawl deep crawl of the website
2. Multi-perspective LLM analysis
3. Return structured competitive intelligence
"""
import logging
from app.core.llm import call_llm_json
from app.core.firecrawl import scrape, crawl

logger = logging.getLogger(__name__)


async def quick_scan_saas(url: str, name_hint: str | None = None) -> dict:
    page_text = await _deep_crawl(url)
    truncated = page_text[:3000] if page_text else ""
    try:
        prompt = f"""Scan this SaaS URL and extract:
URL: {url}
Page content:
{truncated if truncated else "No content available."}

Return JSON with:
- name: the product name
- description: what it does in 1 sentence
- problem: what problem it solves in 1 sentence
- audience: who it's for"""
        return await call_llm_json(prompt, temperature=0.2)
    except Exception as e:
        logger.warning(f"Quick scan LLM failed: {e}")
        return {
            "name": name_hint or url.split("//")[-1].split("/")[0].split(".")[-2].capitalize(),
            "description": f"SaaS product at {url}",
            "problem": "Analyzing their value proposition...",
            "audience": "Users of this platform",
        }


async def analyze_saas(url: str, existing_description: str | None = None) -> dict:
    page_text = await _deep_crawl(url)
    truncated = page_text[:8000] if page_text else ""

    try:
        step1 = await _step_initial_scan(url, truncated, existing_description)
        step2 = await _step_deep_analysis(url, truncated, step1)
        return step2
    except Exception as e:
        logger.warning(f"Deep analysis LLM failed: {e}")
        return {
            "name": name_hint or url.split("//")[-1].split("/")[0].split(".")[-2].capitalize(),
            "tagline": "",
            "description": existing_description or f"SaaS product at {url}",
            "pain_points": [],
            "search_triggers": [url],
            "competitors": [],
            "tone": "professional",
            "icp_description": "",
            "industries": [],
            "pricing_model": "unknown",
            "key_features": [],
            "target_geo": "global",
            "business_model": "B2B",
            "avg_contract_value_estimate": "",
            "decision_makers": [],
            "objection_handlers": [],
            "differentiation": "",
            "content_themes": [],
        }


async def _deep_crawl(url: str) -> str | None:
    result = await scrape(url, formats=["markdown"])
    if result:
        return result.get("markdown", "")[:8000]

    pages = await crawl(url, max_pages=5)
    if pages:
        combined = "\n\n".join(p.get("markdown", "") for p in pages if p.get("markdown"))
        return combined[:8000]

    return None


async def _step_initial_scan(url: str, page_text: str, existing: str | None) -> dict:
    prompt = f"""Perform an initial scan of this SaaS product:

URL: {url}

Page content:
{page_text[:4000] if page_text else "Page could not be crawled — analyze based on URL alone."}

{f'Additional context: {existing}' if existing else ''}

Extract: name, one-sentence description, target audience, initial competitor guesses."""

    return await call_llm_json(prompt,
        system_instruction="You are a fast product scanner. Return JSON with: name, initial_description, target_audience, guessed_competitors (list), initial_tone.",
        temperature=0.2)


async def _step_deep_analysis(url: str, page_text: str, initial: dict) -> dict:
    prompt = f"""Perform a DEEP competitive intelligence analysis on this SaaS product.

URL: {url}

Page content:
{page_text[:6000] if page_text else "No page content available."}

Initial scan results:
{initial}

Conduct a thorough analysis. Think like a top-tier product analyst. Return ALL fields from the system prompt."""

    return await call_llm_json(prompt, system_instruction=SYSTEM_PROMPT_DEEP, temperature=0.2)
