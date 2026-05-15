import httpx
from app.config import get_settings

settings = get_settings()

BOT_TOKEN = settings.telegram_bot_token
CHAT_ID = settings.telegram_chat_id
API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"


async def send_message(text: str, parse_mode: str = "HTML") -> bool:
    if not BOT_TOKEN or not CHAT_ID:
        print("Telegram not configured: missing BOT_TOKEN or CHAT_ID")
        return False

    async with httpx.AsyncClient() as client:
        resp = await client.post(API_URL, json={
            "chat_id": CHAT_ID,
            "text": text,
            "parse_mode": parse_mode,
            "disable_web_page_preview": True,
        })
        return resp.is_success


async def notify_new_lead(saas_name: str, lead_name: str, lead_source: str, summary: str = ""):
    text = (
        f"\U0001f514 <b>Nuevo Lead Captado</b>\n\n"
        f"\U0001f4cc <b>SaaS:</b> {saas_name}\n"
        f"\U0001f464 <b>Contacto:</b> {lead_name}\n"
        f"\U0001f4e1 <b>Fuente:</b> {lead_source}\n"
    )
    if summary:
        text += f"\n\U0001f4ac <b>Resumen:</b>\n{summary}"
    text += "\n\n\U0001f449 Revisa el dashboard para más detalles."

    return await send_message(text)


async def notify_pipeline_complete(saas_name: str, total_leads: int):
    text = (
        f"\u2705 <b>Pipeline Completado</b>\n\n"
        f"\U0001f4cc <b>SaaS:</b> {saas_name}\n"
        f"\U0001f4ca <b>Total leads captados:</b> {total_leads}\n\n"
        f"\U0001f50d Los agentes han finalizado el análisis."
    )
    return await send_message(text)
