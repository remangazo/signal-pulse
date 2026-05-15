"""
Cartographer Agent — deep multi-step SaaS analysis:
1. Firecrawl deep crawl of the website
2. Multi-perspective LLM analysis
3. Return structured competitive intelligence
"""
from app.core.llm import call_llm_json
from app.core.firecrawl import scrape, crawl


SYSTEM_PROMPT_DEEP = """You are a Senior Product & Market Analyst AI. Analyze this SaaS product in depth.

Return JSON with ALL these fields:
- name: exact product name
- tagline: one-sentence tagline
- description: 2-3 sentence description of what it does
- pain_points: list of 5-8 specific painful problems it solves (be very specific)
- search_triggers: list of 10-15 keywords/phrases people use when they need this
- competitors: list of 3-5 competitor names
- tone: brand tone (casual, professional, technical, playful, urgent, authoritative)
- icp_description: who is the ideal customer (1-2 sentences)
- industries: list of 2-4 industries this serves
- pricing_model: freemium, subscription, usage-based, or unknown
- key_features: list of 5-8 main features
- target_geo: geographic target (global, US-only, EU, etc.)
- business_model: B2B, B2C, or both
- avg_contract_value_estimate: estimated price range
- decision_makers: who makes the buying decision
- objection_handlers: list of 3-5 common objections and how to address them
- differentiation: 2-3 sentences on what makes them unique
- content_themes: list of 5-8 content/topic themes their audience engages with"""


async def quick_scan_saas(url: str, name_hint: str | None = None) -> dict:
    page_text = await _deep_crawl(url)
    truncated = page_text[:3000] if page_text else ""
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


async def analyze_saas(url: str, existing_description: str | None = None) -> dict:
    page_text = await _deep_crawl(url)
    truncated = page_text[:8000] if page_text else ""

    step1 = await _step_initial_scan(url, truncated, existing_description)
    step2 = await _step_deep_analysis(url, truncated, step1)

    return step2


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
