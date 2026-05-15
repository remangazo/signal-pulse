"""
Auditor Agent — receives raw leads from Sentinel and:
1. Layer 1: Heuristic pre-filter (keyword boost, noise signals)
2. Layer 2: Fast LLM classification (Gemini Flash) — LEAD / NOISE / UNCERTAIN
3. Layer 3: Deep scoring (Claude or Gemini Pro) — only for LEAD/UNCERTAIN
4. Assigns intent_score (1-10) and pain_points
"""
import json
from typing import Optional
from app.core.llm import call_llm, call_llm_json

LEAD_BOOSTERS = [
    "alternativa", "reemplazar", "cambiar de",
    "demasiado caro", "no escala", "odio",
    "busco herramienta", "recomienden", "solution for",
    "tired of", "frustrated with", "switching from",
    "any alternative", "better way", "too expensive",
    "looking for a tool", "recommend me", "suggestion",
]

NOISE_SIGNALS = [
    "jaja", "lol", "XD",
    "acabo de empezar",
    "check my bio", "DM me",
    "follow for follow",
]


def layer1_heuristic(content: str) -> tuple[float, str]:
    content_lower = content.lower()
    boost_score = 0
    for kw in LEAD_BOOSTERS:
        if kw in content_lower:
            boost_score += 0.15

    for ns in NOISE_SIGNALS:
        if ns in content_lower:
            return 0.1, "noise"

    if len(content.split()) < 5:
        return 0.1, "noise"

    score = min(boost_score, 0.8)
    if score > 0.3:
        return score, "potential"
    return score, "uncertain"


LAYER2_SYSTEM = """You are a Lead Classifier AI. Your job is to determine if a social media post is a potential sales lead.

Rules:
- LEAD: The person EXPLICITLY wants to solve a problem that a SaaS product solves
- NOISE: Generic complaint, spam, bots, venting without intent
- UNCERTAIN: Has potential but lacks context

Respond with JSON: {"classification": "LEAD|NOISE|UNCERTAIN", "reason": "brief explanation", "confidence": 0.0-1.0}"""


async def layer2_fast_classify(content: str, saas_description: str) -> tuple[str, float]:
    prompt = f"""SaaS Description: {saas_description}

Post: "{content}"

Classify this post as LEAD, NOISE, or UNCERTAIN."""

    result = await call_llm_json(prompt, system_instruction=LAYER2_SYSTEM)
    classification = result.get("classification", "UNCERTAIN")
    confidence = result.get("confidence", 0.5)
    return classification, confidence


LAYER3_SYSTEM = """You are a Senior Lead Scoring AI. Analyze this post deeply and provide:
1. intent_score (1-10): how likely this person is to buy
2. pain_points: what specific problems they mentioned
3. competitor_mentioned: if they named a competitor
4. switch_readiness: low/medium/high
5. suggested_approach: one-sentence strategy for outreach

Respond with JSON."""


async def layer3_deep_score(content: str, saas_info: dict) -> dict:
    prompt = f"""SaaS Info: {json.dumps(saas_info)}

Post: "{content}"

Score and analyze this lead deeply."""

    result = await call_llm_json(prompt, system_instruction=LAYER3_SYSTEM)
    return result


async def run_pipeline(content: str, saas_description: str, saas_info: dict) -> dict:
    score, classification = layer1_heuristic(content)

    if classification == "noise":
        return {"intent_score": 0.1, "layer": 1, "classification": "NOISE", "pain_points": None, "competitor_mentioned": None}

    classification, confidence = await layer2_fast_classify(content, saas_description)

    if classification == "NOISE" and confidence > 0.8:
        return {"intent_score": 0.1, "layer": 2, "classification": "NOISE", "pain_points": None, "competitor_mentioned": None}

    deep = await layer3_deep_score(content, saas_info)

    return {
        "intent_score": deep.get("intent_score", 5),
        "layer": 3,
        "classification": classification,
        "pain_points": deep.get("pain_points"),
        "competitor_mentioned": deep.get("competitor_mentioned"),
        "switch_readiness": deep.get("switch_readiness", "low"),
        "suggested_approach": deep.get("suggested_approach"),
    }
