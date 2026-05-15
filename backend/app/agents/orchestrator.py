"""
Orchestrator Agent — chains Sentinel → Auditor → Ghostwriter
and stores results in the database with monitoring.
"""
import json
import time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.saas import SaaS
from app.models.lead import Lead
from app.models.pipeline_run import PipelineRun
from app.agents.sentinel import gather_raw_leads
from app.agents.auditor import run_pipeline
from app.agents.ghostwriter import draft_reply
from app.notifications.telegram import notify_new_lead, notify_pipeline_complete


async def run_full_pipeline(saas_id: str, db: AsyncSession) -> dict:
    start = time.time()
    result = await db.execute(select(SaaS).where(SaaS.id == saas_id))
    saas = result.scalar_one_or_none()
    if not saas:
        return {"status": "error", "message": "SaaS not found"}

    run = PipelineRun(saas_id=saas_id, status="running")
    db.add(run)
    await db.commit()

    try:
        pain_points = json.loads(saas.pain_points) if saas.pain_points else []
        competitors = json.loads(saas.competitors) if saas.competitors else []
        search_terms = pain_points + competitors + [saas.name]

        user_chat_id = None
        if saas.user_id:
            from app.models.user import User
            user_result = await db.execute(select(User).where(User.id == saas.user_id))
            user = user_result.scalar_one_or_none()
            user_chat_id = user.telegram_chat_id if user else None

        raw_leads = await gather_raw_leads(search_terms)

        saas_info = {
            "name": saas.name,
            "description": saas.description,
            "tone": saas.tone,
            "competitors": competitors,
            "pain_points": pain_points,
        }

        leads_created = 0
        errors = 0

        for raw in raw_leads:
            try:
                audio_result = await run_pipeline(
                    content=raw["content"],
                    saas_description=saas.description or "",
                    saas_info=saas_info,
                )

                if audio_result.get("classification") == "NOISE":
                    continue

                ghost = await draft_reply(
                    lead_content=raw["content"],
                    saas_name=saas.name or "",
                    saas_description=saas.description or "",
                    tone=saas.tone or "professional",
                    competitor_mentioned=audio_result.get("competitor_mentioned"),
                    pain_points=audio_result.get("pain_points"),
                )

                lead = Lead(
                    saas_id=saas.id,
                    source=raw.get("source", "unknown"),
                    source_url=raw.get("url", ""),
                    author=raw.get("author", ""),
                    content=raw["content"],
                    intent_score=audio_result.get("intent_score"),
                    layer=audio_result.get("layer"),
                    pain_points=audio_result.get("pain_points"),
                    competitor_mentioned=audio_result.get("competitor_mentioned"),
                    suggested_reply=ghost.get("reply", ""),
                    reply_angle=ghost.get("angle", ""),
                    status="new",
                )
                db.add(lead)
                leads_created += 1

                await notify_new_lead(
                    saas_name=saas.name,
                    lead_name=raw.get("author", "unknown"),
                    lead_source=raw.get("source", "unknown"),
                    summary=audio_result.get("suggested_approach", ""),
                    chat_id=user_chat_id,
                )
            except Exception:
                errors += 1
                continue

        duration = round(time.time() - start, 1)

        run.status = "success"
        run.candidates = len(raw_leads)
        run.leads_found = leads_created
        run.errors = errors
        run.duration_seconds = duration
        await db.commit()

        if leads_created > 0:
            await notify_pipeline_complete(saas_name=saas.name, total_leads=leads_created, chat_id=user_chat_id)

        return {"status": "success", "leads_found": leads_created, "errors": errors, "total_candidates": len(raw_leads), "duration_seconds": duration}

    except Exception as e:
        run.status = "failed"
        run.error_message = str(e)
        run.duration_seconds = round(time.time() - start, 1)
        await db.commit()
        return {"status": "error", "message": str(e)}
