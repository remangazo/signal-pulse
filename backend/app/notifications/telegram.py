"""
Telegram notification module.
Sends per-lead and batch pipeline summaries via the Telegram Bot API.
"""
import httpx
from app.config import get_settings

settings = get_settings()

BOT_TOKEN = settings.telegram_bot_token
DEFAULT_CHAT_ID = settings.telegram_chat_id


async def send_message(text: str, chat_id: str | None = None, parse_mode: str = "HTML") -> bool:
    target = chat_id or DEFAULT_CHAT_ID
    if not BOT_TOKEN or not target:
        return False

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
            json={
                "chat_id": target,
                "text": text,
                "parse_mode": parse_mode,
                "disable_web_page_preview": False,
            },
        )
        return resp.is_success


async def notify_batch_leads(saas_name: str, leads: list[dict], chat_id: str | None = None):
    if not leads:
        return

    text = (
        f"\U0001f514 <b>Nuevos Leads - {saas_name}</b>\n"
        f"({len(leads)} captados en este ciclo)\n\n"
    )

    for i, lead in enumerate(leads[:5], 1):
        author = lead.get("author", "Desconocido")
        source = lead.get("source", "unknown")
        score = lead.get("intent_score", 0)
        preview = lead.get("content_preview", lead.get("content", ""))[:80]

        text += (
            f"{i}. <b>{author}</b> (\u2b50 {score}/10)\n"
            f"   \U0001f4e1 {source}\n"
            f"   \U0001f4ac {preview}...\n\n"
        )

    if len(leads) > 5:
        text += f"... y {len(leads) - 5} m\u00e1s. Revisa el dashboard."

    return await send_message(text, chat_id=chat_id)


async def notify_pipeline_complete(saas_name: str, total_leads: int, avg_score: float = 0.0, chat_id: str | None = None):
    text = (
        f"\U0001f4ca <b>Pipeline Completado</b>\n\n"
        f"\U0001f4cc <b>SaaS:</b> {saas_name}\n"
        f"\U0001f50d <b>Total leads:</b> {total_leads}\n"
        f"\u2b50 <b>Score promedio:</b> {avg_score}/10\n\n"
        f"Revisa el dashboard para m\u00e1s detalles."
    )
    return await send_message(text, chat_id=chat_id)
