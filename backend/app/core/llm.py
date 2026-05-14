from typing import Optional
from google import genai
from app.config import get_settings

settings = get_settings()


async def call_gemini(
    prompt: str,
    system_instruction: Optional[str] = None,
    model: str = "gemini-2.0-flash",
    temperature: float = 0.3,
    max_tokens: int = 1024,
) -> str:
    client = genai.Client(api_key=settings.gemini_api_key)

    contents = []
    if system_instruction:
        contents.append({"role": "system", "parts": [system_instruction]})
    contents.append({"role": "user", "parts": [prompt]})

    response = client.models.generate_content(
        model=model,
        contents=contents,
        config={
            "temperature": temperature,
            "max_output_tokens": max_tokens,
        },
    )
    return response.text


async def call_gemini_json(
    prompt: str,
    system_instruction: Optional[str] = None,
    model: str = "gemini-2.0-flash",
) -> dict:
    client = genai.Client(api_key=settings.gemini_api_key)
    response = client.models.generate_content(
        model=model,
        contents=[
            {"role": "system", "parts": [system_instruction or ""]},
            {"role": "user", "parts": [prompt]},
        ],
        config={
            "temperature": 0.2,
            "response_mime_type": "application/json",
        },
    )
    import json
    return json.loads(response.text)
