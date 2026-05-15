from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db, async_session
from app.models.saas import SaaS
from app.schemas.schemas import SaaSInput, SaaSOut, AgentRunResponse
from app.agents.cartographer import analyze_saas, quick_scan_saas
from app.agents.sentinel import gather_raw_leads
from app.agents.auditor import run_pipeline
from app.agents.ghostwriter import draft_reply
from app.agents.orchestrator import run_full_pipeline
from app.models.lead import Lead
import json

router = APIRouter(prefix="/saas", tags=["saas"])


async def _run_pipeline_background(saas_id: str):
    import logging
    logger = logging.getLogger(__name__)
    try:
        logger.info(f"Starting background pipeline for {saas_id}")
        async with async_session() as db:
            result = await run_full_pipeline(saas_id, db)
            logger.info(f"Pipeline result: {result}")
    except Exception as e:
        import traceback
        logging.getLogger(__name__).error(f"Background pipeline failed: {e}\n{traceback.format_exc()}")


@router.post("/quick-scan")
async def quick_scan(payload: SaaSInput):
    result = await quick_scan_saas(payload.url, payload.name)
    return result


@router.post("/register", response_model=SaaSOut)
async def register_saas(payload: SaaSInput, background: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    try:
        saas = SaaS(
            user_id=payload.user_id,
            url=payload.url,
            name=payload.name or payload.url,
            config=payload.config,
        )

        analysis = await analyze_saas(payload.url, payload.name)
        saas.description = analysis.get("description", "")
        saas.tone = analysis.get("tone", "professional")
        saas.competitors = json.dumps(analysis.get("competitors", []))
        saas.pain_points = json.dumps(analysis.get("pain_points", []))
        try:
            existing = json.loads(saas.config or "{}")
            existing.update(analysis)
            saas.config = json.dumps(existing)
        except Exception:
            pass

        db.add(saas)
        await db.commit()
        await db.refresh(saas)

        background.add_task(_run_pipeline_background, saas.id)

        return saas
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Register SaaS error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"SaaS analysis failed: {str(e)}")


@router.post("/{saas_id}/scan", response_model=AgentRunResponse)
async def scan_for_leads(saas_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SaaS).where(SaaS.id == saas_id))
    saas = result.scalar_one_or_none()
    if not saas:
        raise HTTPException(status_code=404, detail="SaaS not found")

    pain_points = json.loads(saas.pain_points) if saas.pain_points else []
    competitors = json.loads(saas.competitors) if saas.competitors else []
    search_terms = pain_points + competitors + [saas.name]

    raw_leads = await gather_raw_leads(search_terms)

    saas_info = {
        "name": saas.name,
        "description": saas.description,
        "tone": saas.tone,
        "competitors": competitors,
        "pain_points": pain_points,
    }

    leads_created = 0
    for raw in raw_leads:
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

    await db.commit()
    return AgentRunResponse(
        status="success",
        leads_found=leads_created,
        message=f"Found {leads_created} qualified leads from {len(raw_leads)} raw mentions",
    )


@router.get("/")
async def list_saas(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SaaS).order_by(SaaS.created_at.desc()))
    return result.scalars().all()


@router.get("/{saas_id}")
async def get_saas(saas_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SaaS).where(SaaS.id == saas_id))
    saas = result.scalar_one_or_none()
    if not saas:
        raise HTTPException(status_code=404, detail="SaaS not found")
    return saas


@router.get("/stats/overview")
async def get_stats(db: AsyncSession = Depends(get_db)):
    from app.models.pipeline_run import PipelineRun
    from sqlalchemy import func

    total_saas = (await db.execute(select(func.count(SaaS.id)))).scalar()
    total_leads = (await db.execute(select(func.count(Lead.id)))).scalar()
    new_leads = (await db.execute(select(func.count(Lead.id)).where(Lead.status == "new"))).scalar()
    pipeline_runs = (await db.execute(select(func.count(PipelineRun.id)))).scalar()
    avg_score = (await db.execute(select(func.avg(Lead.intent_score)))).scalar()
    last_run = (await db.execute(select(PipelineRun).order_by(PipelineRun.created_at.desc()).limit(1))).scalar_one_or_none()

    return {
        "total_saas": total_saas,
        "total_leads": total_leads,
        "new_leads": new_leads,
        "pipeline_runs": pipeline_runs,
        "avg_intent_score": round(float(avg_score or 0), 1),
        "last_pipeline_run": last_run.created_at.isoformat() if last_run else None,
    }


@router.get("/pipeline-runs")
async def list_pipeline_runs(db: AsyncSession = Depends(get_db)):
    from app.models.pipeline_run import PipelineRun
    result = await db.execute(select(PipelineRun).order_by(PipelineRun.created_at.desc()).limit(10))
    runs = result.scalars().all()
    out = []
    for r in runs:
        out.append({
            "id": str(r.id),
            "saas_id": str(r.saas_id),
            "status": r.status,
            "candidates": r.candidates,
            "leads_found": r.leads_found,
            "errors": r.errors,
            "duration_seconds": r.duration_seconds,
            "error_message": r.error_message,
            "created_at": str(r.created_at),
        })
    return out
