"""
Orchestrator Agent — chains Sentinel → Auditor → Ghostwriter with timeouts
"""
import asyncio
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

logger = logging.getLogger(__name__)


async def run_full_pipeline(saas_id: str, session_factory: async_sessionmaker[AsyncSession]) -> dict:
    try:
        return await asyncio.wait_for(
            _run_pipeline(saas_id, session_factory), timeout=120)
    except asyncio.TimeoutError:
        logger.error(f"TIMEOUT pipeline {saas_id}")
        return {"status": "error", "message": "Pipeline timed out"}
    except BaseException as e:
        logger.error(f"CRASH pipeline {saas_id}: {type(e).__name__}: {e}")
        return {"status": "error", "message": f"{type(e).__name__}: {e}"}


async def _run_pipeline(saas_id: str, session_factory: async_sessionmaker[AsyncSession]) -> dict:
    start = time.time()
    async with session_factory() as db:
        result = await db.execute(select(SaaS).where(SaaS.id == saas_id))
        saas = result.scalar_one_or_none()
        if not saas:
            return {"status": "error", "message": "SaaS not found"}

        run = PipelineRun(saas_id=saas_id, status="running")
        db.add(run)
        await db.commit()
        await db.refresh(run)

        try:
            pain_points = json.loads(saas.pain_points) if saas.pain_points else []
            competitors = json.loads(saas.competitors) if saas.competitors else []
            search_terms = pain_points + competitors + [saas.name]

            raw_leads = await asyncio.wait_for(gather_raw_leads(search_terms), timeout=30)

            saas_info = {
                "name": saas.name,
                "description": saas.description,
                "tone": saas.tone,
                "competitors": competitors,
                "pain_points": pain_points,
            }

            scored = []
            for raw in raw_leads:
                s, c = layer1_heuristic(raw.get("content", ""))
                scored.append((s, c, raw))
            scored.sort(key=lambda x: x[0], reverse=True)
            limit = min(10, len(scored))

            leads_created = 0
            errors = 0

            for i, (score, classification, raw) in enumerate(scored[:limit]):
                try:
                    if i < 3:
                        audio = await asyncio.wait_for(
                            run_pipeline(content=raw["content"], saas_description=saas.description or "", saas_info=saas_info),
                            timeout=25)
                    else:
                        audio = {
                            "intent_score": round(score * 10, 1),
                            "layer": 1,
                            "classification": "LEAD" if score > 0.15 else ("UNCERTAIN" if score > 0 else "NOISE"),
                        }

                    if audio.get("classification") == "NOISE":
                        continue

                    if i < 3:
                        ghost = await asyncio.wait_for(
                            draft_reply(
                                lead_content=raw["content"],
                                saas_name=saas.name or "",
                                saas_description=saas.description or "",
                                tone=saas.tone or "professional",
                                competitor_mentioned=audio.get("competitor_mentioned"),
                                pain_points=audio.get("pain_points"),
                            ),
                            timeout=20)
                    else:
                        ghost = {"reply": "", "angle": "layer1"}

                    lead = Lead(
                        saas_id=saas.id,
                        source=raw.get("source", "unknown"),
                        source_url=raw.get("url", ""),
                        author=raw.get("author", ""),
                        content=raw["content"],
                        intent_score=audio.get("intent_score"),
                        layer=audio.get("layer"),
                        pain_points=audio.get("pain_points"),
                        competitor_mentioned=audio.get("competitor_mentioned"),
                        suggested_reply=ghost.get("reply", ""),
                        reply_angle=ghost.get("angle", ""),
                        status="new",
                    )
                    db.add(lead)
                    leads_created += 1
                except asyncio.TimeoutError:
                    errors += 1
                    logger.warning(f"TIMEOUT lead {i}")
                except Exception as e:
                    errors += 1
                    logger.error(f"ERROR lead {i}: {e}")

            run.status = "success"
            run.candidates = len(raw_leads)
            run.leads_found = leads_created
            run.errors = errors
            run.duration_seconds = round(time.time() - start, 1)
            await db.commit()

            return {"status": "success", "leads_found": leads_created, "errors": errors, "total_candidates": len(raw_leads), "duration_seconds": run.duration_seconds}

        except asyncio.TimeoutError:
            run.status = "failed"
            run.error_message = "Sentinel timeout"
            run.duration_seconds = round(time.time() - start, 1)
            await db.commit()
            return {"status": "error", "message": "Sentinel timeout"}
        except BaseException as e:
            run.status = "failed"
            run.error_message = f"{type(e).__name__}: {e}"
            run.duration_seconds = round(time.time() - start, 1)
            await db.commit()
            logger.error(f"PIPELINE_FAILED: {e}")
            return {"status": "error", "message": str(e)}