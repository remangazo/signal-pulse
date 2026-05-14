"""
Ghostwriter Agent — takes a qualified lead and drafts a first-contact message.
The draft references the specific context of the lead (the signal) and matches
the SaaS brand's tone of voice.
"""
import json
from app.core.llm import call_gemini

SYSTEM_PROMPT = """You are a Sales Copywriter AI. Your job is to write ultra-personalized first-contact messages for sales leads.

Rules:
1. MUST reference the specific context of the lead's post (the signal)
2. MUST be helpful first, sales second
3. MUST match the SaaS brand's tone of voice
4. Keep it under 150 words
5. Never sound like a template or spam
6. Include a specific observation from their post to prove you read it

Output format:
{
  "reply": "the full message text",
  "angle": "what approach you took (helpful, competitor switch, feature pitch, etc)",
  "subject_line": "if email, a subject line"
}"""


async def draft_reply(
    lead_content: str,
    saas_name: str,
    saas_description: str,
    tone: str = "professional",
    competitor_mentioned: str | None = None,
    pain_points: str | None = None,
) -> dict:
    prompt = f"""Draft a first-contact reply for this lead:

Lead's Post: "{lead_content}"
{f'Competitor Mentioned: {competitor_mentioned}' if competitor_mentioned else ''}
{f'Pain Points: {pain_points}' if pain_points else ''}

Our SaaS: {saas_name}
What we do: {saas_description}
Our tone: {tone}

Write a response that feels personal and helpful, not salesy."""

    result = await call_gemini(prompt, system_instruction=SYSTEM_PROMPT, temperature=0.7)

    try:
        return json.loads(result)
    except json.JSONDecodeError:
        return {"reply": result, "angle": "helpful", "subject_line": ""}
