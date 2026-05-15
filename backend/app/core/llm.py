import json
from typing import Optional
import httpx
from app.config import get_settings

settings = get_settings()

PROVIDER_CONFIGS = {
    "openai":      {"base_url": "https://api.openai.com/v1",           "default_model": "gpt-4o-mini"},
    "groq":        {"base_url": "https://api.groq.com/openai/v1",      "default_model": "llama-3.3-70b-versatile"},
    "openrouter":  {"base_url": "https://openrouter.ai/api/v1",        "default_model": "openai/gpt-4o-mini"},
    "deepseek":    {"base_url": "https://api.deepseek.com/v1",          "default_model": "deepseek-chat"},
    "together":    {"base_url": "https://api.together.xyz/v1",          "default_model": "mistralai/Mixtral-8x7B-Instruct-v0.1"},
}


def _build_client():
    provider = settings.llm_provider or "gemini"
    cfg = PROVIDER_CONFIGS.get(provider, {})
    base_url = settings.llm_base_url or cfg.get("base_url", "")
    api_key = settings.llm_api_key or settings.openai_api_key or settings.gemini_api_key
    model = settings.llm_model or cfg.get("default_model", "")
    return provider, base_url, api_key, model


async def call_llm(
    prompt: str,
    system_instruction: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: int = 1024,
) -> str:
    provider, base_url, api_key, default_model = _build_client()

    if provider == "gemini" and settings.gemini_api_key:
        return await _call_gemini_native(prompt, system_instruction, model or default_model, temperature, max_tokens)

    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    if provider == "openrouter":
        headers["HTTP-Referer"] = "https://signalpulse.com"
        headers["X-Title"] = "SignalPulse"

    body = {
        "model": model or default_model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(f"{base_url}/chat/completions", json=body, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def call_llm_json(
    prompt: str,
    system_instruction: Optional[str] = None,
    model: Optional[str] = None,
    temperature: float = 0.2,
) -> dict:
    provider, base_url, api_key, default_model = _build_client()

    if provider == "gemini" and settings.gemini_api_key:
        return await _call_gemini_json_native(prompt, system_instruction, model or default_model)

    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": f"{prompt}\n\nRespond only with valid JSON."})

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    if provider == "openrouter":
        headers["HTTP-Referer"] = "https://signalpulse.com"
        headers["X-Title"] = "SignalPulse"

    body = {
        "model": model or default_model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 2048,
        "response_format": {"type": "json_object"},
    }

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(f"{base_url}/chat/completions", json=body, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return json.loads(data["choices"][0]["message"]["content"])


async def _call_gemini_native(prompt, system_instruction, model, temperature, max_tokens):
    from google import genai
    client = genai.Client(api_key=settings.gemini_api_key)
    contents = []
    if system_instruction:
        contents.append({"role": "system", "parts": [system_instruction]})
    contents.append({"role": "user", "parts": [prompt]})
    response = client.models.generate_content(
        model=model or "gemini-2.0-flash",
        contents=contents,
        config={"temperature": temperature, "max_output_tokens": max_tokens},
    )
    return response.text


async def _call_gemini_json_native(prompt, system_instruction, model):
    from google import genai
    client = genai.Client(api_key=settings.gemini_api_key)
    response = client.models.generate_content(
        model=model or "gemini-2.0-flash",
        contents=[
            {"role": "system", "parts": [system_instruction or ""]},
            {"role": "user", "parts": [prompt]},
        ],
        config={"temperature": 0.2, "response_mime_type": "application/json"},
    )
    return json.loads(response.text)
