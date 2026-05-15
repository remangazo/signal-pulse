import httpx
from app.config import get_settings

settings = get_settings()

BOT_TOKEN = settings.telegram_bot_token
DEFAULT_CHAT_ID = settings.telegram_chat_id


async def send_message(text: str, chat_id: str | None = None, parse_mode: str = "HTML") -> bool:
    target = chat_id or DEFAULT_CHAT_ID
    if not BOT_TOKEN or not target:
        print("Telegram not configured: missing BOT_TOKEN or chat_id")
        return False

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
            json={
                "chat_id": target,
                "text": text,
                "parse_mode": parse_mode,
                "disable_web_page_preview": True,
            },
        )
        return resp.is_success


async def notify_new_lead(saas_name: str, lead_name: str, lead_source: str, summary: str = "", chat_id: str | None = None):
    text = (
        f"\U0001f514 <b>Nuevo Lead Captado</b>\n\n"
        f"\U0001f4cc <b>SaaS:</b> {saas_name}\n"
        f"\U0001f464 <b>Contacto:</b> {lead_name}\n"
        f"\U0001f4e1 <b>Fuente:</b> {lead_source}\n"
    )
    if summary:
        text += f"\n\U0001f4ac <b>Resumen:</b>\n{summary}"
    text += "\n\n\U0001f449 Revisa el dashboard para más detalles."

    return await send_message(text, chat_id=chat_id)


async def notify_pipeline_complete(saas_name: str, total_leads: int, chat_id: str | None = None):
    text = (
        f"\u2705 <b>Pipeline Completado</b>\n\n"
        f"\U0001f4cc <b>SaaS:</b> {saas_name}\n"
        f"\U0001f4ca <b>Total leads captados:</b> {total_leads}\n\n"
        f"\U0001f50d Los agentes han finalizado el análisis."
    )
    return await send_message(text, chat_id=chat_id)
