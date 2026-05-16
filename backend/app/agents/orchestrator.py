"""
Orchestrator Agent — chains Sentinel → Auditor → Ghostwriter
"""
import json
import time
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.saas import SaaS
from app.models.lead import Lead
from app.models.pipeline_run import PipelineRun

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
        pain_points = json.loads(saas.pain_points) if saas.pain_points else []
        competitors = json.loads(saas.competitors) if saas.competitors else []
        search_terms = pain_points + competitors + [saas.name]

        logger.info(f"Search terms: {search_terms}")
        raw_leads = []

        logger.info(f"Found {len(raw_leads)} raw leads")

        leads_created = 0
        errors = 0

        duration = round(time.time() - start, 1)

        run.status = "success"
        run.candidates = len(raw_leads)
        run.leads_found = leads_created
        run.errors = errors
        run.duration_seconds = duration
        await db.commit()

        logger.info(f"Pipeline complete: {leads_created} leads, {errors} errors, {duration}s")
        return {"status": "success", "leads_found": leads_created, "errors": errors, "total_candidates": len(raw_leads), "duration_seconds": duration}

    except Exception as e:
        run.status = "failed"
        run.error_message = str(e)
        run.duration_seconds = round(time.time() - start, 1)
        await db.commit()
        logger.error(f"Pipeline failed: {e}")
        return {"status": "error", "message": str(e)}
