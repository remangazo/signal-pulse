"""
Orchestrator Agent — chains Sentinel → Auditor → Ghostwriter
"""
import json
import time
import logging
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy import select
from app.models.saas import SaaS
from app.models.lead import Lead
from app.models.pipeline_run import PipelineRun
from app.agents.sentinel import gather_raw_leads
from app.agents.auditor import run_pipeline, layer1_heuristic
from app.agents.ghostwriter import draft_reply
from app.notifications.telegram import notify_batch_leads, notify_pipeline_complete

logger = logging.getLogger(__name__)


async def run_full_pipeline(saas_id: str, session_factory: async_sessionmaker[AsyncSession]) -> dict:
    start = time.time()
    logger.info(f"PIPELINE_START: {saas_id}")

    async with session_factory() as db:
        result = await db.execute(select(SaaS).where(SaaS.id == saas_id))
        saas = result.scalar_one_or_none()
        if not saas:
            logger.error(f"SaaS {saas_id} not found")
            return {"status": "error", "message": "SaaS not found"}

        run = PipelineRun(saas_id=saas_id, status="running")
        db.add(run)
        await db.commit()
        await db.refresh(run)

        try:
            config = json.loads(saas.config or "{}")
            pain_points = json.loads(saas.pain_points) if saas.pain_points else []
            competitors = json.loads(saas.competitors) if saas.competitors else []
            search_terms = pain_points + competitors + [saas.name]

            logger.info(f"PIPELINE_SEARCH_TERMS: {search_terms}")
            raw_leads = await gather_raw_leads(search_terms)
            logger.info(f"PIPELINE_RAW_LEADS: {len(raw_leads)}")

            logger.info(f"PIPELINE_LLM_START")
            # Process leads with LLM (first 3) + layer1 (rest)
            leads_created = 0
            errors = 0
            created_leads = []

            saas_info = {
                "name": saas.name,
                "description": saas.description,
                "tone": saas.tone,
                "competitors": competitors,
                "pain_points": pain_points,
            }

            scored_leads = []
            for raw in raw_leads:
                score, classification = layer1_heuristic(raw.get("content", ""))
                scored_leads.append((score, classification, raw))

            scored_leads.sort(key=lambda x: x[0], reverse=True)
            max_leads_to_process = min(10, len(scored_leads))

            for i, (score, classification, raw) in enumerate(scored_leads[:max_leads_to_process]):
                try:
                    uses_llm = i < 3
                    if uses_llm:
                        logger.info(f"PIPELINE_LLM_LEAD_{i}")
                        audio_result = await run_pipeline(
                            content=raw["content"],
                            saas_description=saas.description or "",
                            saas_info=saas_info,
                        )
                        logger.info(f"PIPELINE_LLM_LEAD_{i}_DONE")
                    else:
                        audio_result = {
                            "intent_score": round(score * 10, 1),
                            "layer": 1,
                            "classification": "LEAD" if score > 0.15 else ("UNCERTAIN" if score > 0 else "NOISE"),
                            "pain_points": None,
                            "competitor_mentioned": None,
                            "switch_readiness": "medium" if score > 0.3 else "low",
                            "suggested_approach": f"Potential lead (layer1, score: {score})",
                        }

                    if audio_result.get("classification") == "NOISE":
                        continue

                    if uses_llm:
                        logger.info(f"PIPELINE_GHOST_{i}")
                        ghost = await draft_reply(
                            lead_content=raw["content"],
                            saas_name=saas.name or "",
                            saas_description=saas.description or "",
                            tone=saas.tone or "professional",
                            competitor_mentioned=audio_result.get("competitor_mentioned"),
                            pain_points=audio_result.get("pain_points"),
                        )
                        logger.info(f"PIPELINE_GHOST_{i}_DONE")
                    else:
                        ghost = {"reply": "", "angle": "layer1"}

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
                    logger.info(f"PIPELINE_LEAD_CREATED_{i}")
                except Exception as e:
                    errors += 1
                    logger.error(f"PIPELINE_LEAD_ERROR_{i}: {e}")
                    continue

            logger.info(f"PIPELINE_LLM_DONE leads={leads_created} errors={errors}")

            run.status = "success"
            run.candidates = len(raw_leads)
            run.leads_found = leads_created
            run.errors = errors
            run.duration_seconds = round(time.time() - start, 1)
            await db.commit()

            logger.info(f"PIPELINE_DONE: {leads_created} leads, {errors} errors, {run.duration_seconds}s")
            return {"status": "success", "leads_found": leads_created, "errors": errors, "total_candidates": len(raw_leads), "duration_seconds": run.duration_seconds}

        except Exception as e:
            run.status = "failed"
            run.error_message = f"{type(e).__name__}: {e}"
            run.duration_seconds = round(time.time() - start, 1)
            await db.commit()
            logger.error(f"PIPELINE_FAILED: {e}")
            return {"status": "error", "message": str(e)}