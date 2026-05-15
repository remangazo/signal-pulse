"""
Cartographer Agent — deep multi-step SaaS analysis:
1. Crawl the landing page
2. Extract raw text content
3. Multi-perspective LLM analysis
4. Return structured competitive intelligence
"""
import httpx
from app.core.llm import call_llm, call_llm_json


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


async def analyze_saas(url: str, existing_description: str | None = None) -> dict:
    page_text = await _crawl_page(url)
    truncated = page_text[:6000] if page_text else ""

    step1 = await _step_initial_scan(url, truncated, existing_description)
    step2 = await _step_deep_analysis(url, truncated, step1)

    return step2


async def _crawl_page(url: str) -> str | None:
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=15) as c:
            resp = await c.get(url, headers={"User-Agent": "SignalPulseBot/1.0"})
            if resp.status_code == 200:
                import re
                text = resp.text
                text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL)
                text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
                text = re.sub(r'<[^>]+>', ' ', text)
                text = re.sub(r'\s+', ' ', text).strip()
                return text
    except Exception:
        return None
    return None


async def _step_initial_scan(url: str, page_text: str, existing: str | None) -> dict:
    prompt = f"""Perform an initial scan of this SaaS product:

URL: {url}

Page content:
{page_text[:4000] if page_text else "Page could not be crawled — analyze based on URL alone."}

{f'Additional context: {existing}' if existing else ''}

Extract the product name, one-sentence description, likely target audience, and initial competitor guesses."""

    return await call_llm_json(prompt, system_instruction="You are a fast product scanner. Return JSON with: name, initial_description, target_audience, guessed_competitors (list), initial_tone.", temperature=0.2)


async def _step_deep_analysis(url: str, page_text: str, initial: dict) -> dict:
    prompt = f"""Perform a DEEP competitive intelligence analysis on this SaaS product.

URL: {url}

Page content:
{page_text[:5000] if page_text else "No page content available."}

Initial scan results:
{initial}

Now conduct a thorough analysis. Think like a top-tier product analyst. Consider:
1. What exact pain points does this solve? Be specific.
2. Who is the exact ideal customer profile?
3. What keywords would someone use when searching for this?
4. Who are the real competitors?
5. What is their pricing psychology?
6. What objections do buyers have?
7. What content would attract their audience?

Return ALL fields specified in the system prompt."""

    return await call_llm_json(prompt, system_instruction=SYSTEM_PROMPT_DEEP, temperature=0.2, model="llama-3.3-70b-versatile")
