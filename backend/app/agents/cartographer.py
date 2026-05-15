"""
Cartographer Agent — analyzes a SaaS landing page and extracts:
- What problem does it solve?
- Who are its competitors?
- What keywords/triggers to search for?
- What tone of voice to use in replies?
"""
from app.core.llm import call_llm_json


SYSTEM_PROMPT = """You are a Product Analyst AI. Your job is to analyze a SaaS product URL and extract structured information about it.
Return JSON with these fields:
- name: product name
- description: one-sentence what it does
- pain_points: list of 3-5 specific problems it solves
- search_triggers: list of 5-10 keywords/phrases people use when they need this product
- competitors: list of 2-4 competitor names if identifiable
- tone: the brand's communication tone (casual, professional, technical, playful)
- icp_description: who is the ideal customer in one sentence"""


async def analyze_saas(url: str, existing_description: str | None = None) -> dict:
    prompt = f"""Analyze this SaaS product:
URL: {url}
{f'Additional info: {existing_description}' if existing_description else ''}

Extract all structured information about this product."""

    result = await call_llm_json(prompt, system_instruction=SYSTEM_PROMPT)
    return result
