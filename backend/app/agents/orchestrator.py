"""
Orchestrator Agent — chains Sentinel → Auditor → Ghostwriter
and stores results in the database with monitoring.
"""
import asyncio
import json
import time
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.saas import SaaS
from app.models.lead import Lead
from app.models.pipeline_run import PipelineRun
from app.agents.sentinel import gather_raw_leads
from app.agents.auditor import run_pipeline
from app.agents.ghostwriter import draft_reply
from app.notifications.telegram import notify_new_lead, notify_pipeline_complete

logger = logging.getLogger(__name__)


async def run_full_pipeline(saas_id: str, db: AsyncSession) -> dict:
    start = time.time()
    logger.info(f"Starting pipeline for SaaS {saas_id}")
    result = await db.execute(select(SaaS).where(SaaS.id == saas_id))
    saas = result.scalar_one_or_none()
    if not saas:
        logger.error(f"SaaS {saas_id} not found")
        return {"status": "error", "message": "SaaS not found"}

    run = PipelineRun(saas_id=saas_id, status="running")
    db.add(run)
    await db.commit()

    try:
        config = json.loads(saas.config or "{}")
        icp_ideal = config.get("icp_ideal", "")
        icp_not_ideal = config.get("icp_not_ideal", "")
        icp_signals = config.get("icp_signals", "")
        icp_exclude = config.get("icp_exclude", "")
        icp_geo = config.get("icp_geo", "")
        icp_budget = config.get("icp_budget", "")

        pain_points = json.loads(saas.pain_points) if saas.pain_points else []
        competitors = json.loads(saas.competitors) if saas.competitors else []
        search_terms = pain_points + competitors + [saas.name]

        if icp_ideal:
            search_terms.append(icp_ideal)
        if icp_signals:
            search_terms.extend(icp_signals.split(","))

        user_chat_id = None
        if saas.user_id:
            from app.models.user import User
            user_result = await db.execute(select(User).where(User.id == saas.user_id))
            user = user_result.scalar_one_or_none()
            user_chat_id = user.telegram_chat_id if user else None
            logger.info(f"User chat_id: {user_chat_id}")

        logger.info(f"Searching with terms: {search_terms}")
        raw_leads = await gather_raw_leads(search_terms)
        logger.info(f"Found {len(raw_leads)} raw leads")

        saas_info = {
            "name": saas.name,
            "description": saas.description,
            "tone": saas.tone,
            "competitors": competitors,
            "pain_points": pain_points,
            "icp_ideal": icp_ideal,
            "icp_not_ideal": icp_not_ideal,
            "icp_signals": icp_signals,
            "icp_exclude": icp_exclude,
            "icp_geo": icp_geo,
            "icp_budget": icp_budget,
        }

        leads_created = 0
        errors = 0

        from app.agents.auditor import layer1_heuristic
        scored_leads = []
        for raw in raw_leads:
            score, classification = layer1_heuristic(raw.get("content", ""))
            scored_leads.append((score, classification, raw))

        scored_leads.sort(key=lambda x: x[0], reverse=True)
        max_leads_to_process = min(3, len(scored_leads))
        logger.info(f"Processing top {max_leads_to_process} leads out of {len(raw_leads)}")

        for score, classification, raw in scored_leads[:max_leads_to_process]:
            try:
                await asyncio.sleep(15)

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
                logger.info(f"Created lead: {raw.get('author', 'unknown')} from {raw.get('source', 'unknown')}")

                await notify_new_lead(
                    saas_name=saas.name,
                    lead_name=raw.get("author", "unknown"),
                    lead_source=raw.get("source", "unknown"),
                    summary=audio_result.get("suggested_approach", ""),
                    chat_id=user_chat_id,
                )
            except Exception as e:
                errors += 1
                logger.error(f"Error processing lead: {e}")
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

        logger.info(f"Pipeline complete: {leads_created} leads, {errors} errors, {duration}s")
        return {"status": "success", "leads_found": leads_created, "errors": errors, "total_candidates": len(raw_leads), "duration_seconds": duration}

    except Exception as e:
        run.status = "failed"
        run.error_message = str(e)
        run.duration_seconds = round(time.time() - start, 1)
        await db.commit()
        logger.error(f"Pipeline failed: {e}")
        return {"status": "error", "message": str(e)}
