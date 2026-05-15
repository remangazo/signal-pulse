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
    from sqlalchemy import text
    try:
        result = await db.execute(text("SELECT status, candidates, leads_found, errors, error_message FROM pipeline_runs ORDER BY created_at DESC LIMIT 5"))
        rows = result.fetchall()
        return {
            "count": len(rows),
            "runs": [
                {"status": r[0], "candidates": r[1], "leads_found": r[2], "errors": r[3], "error_message": r[4]}
                for r in rows
            ]
        }
    except Exception as e:
        import traceback
        return {"error": str(e), "traceback": traceback.format_exc()}


@router.get("/debug/sentinel")
async def debug_sentinel():
    import json
    from app.agents.sentinel import gather_raw_leads
    from app.config import get_settings
    settings = get_settings()
    search_terms = ["analytics tool alternative", "looking for analytics software", "tired of manual reporting"]
    raw = await gather_raw_leads(search_terms)
    return {
        "apify_configured": bool(settings.apify_api_key),
        "search_terms": search_terms,
        "raw_leads_count": len(raw),
        "raw_leads": raw[:5],
    }


@router.get("/debug/pipeline-test")
async def debug_pipeline_test():
    from app.agents.auditor import run_pipeline, layer1_heuristic
    from app.core.llm import call_llm_json
    from app.config import get_settings
    settings = get_settings()

    test_content = "I'm really frustrated with how slow our current analytics tool is. Looking for something faster that doesn't cost a fortune. Anyone tried alternatives?"

    layer1_score, layer1_class = layer1_heuristic(test_content)

    try:
        layer2_result = await call_llm_json(
            f"""SaaS Description: AI analytics for SaaS
Post: "{test_content}"
Classify this post as LEAD, NOISE, or UNCERTAIN.""",
            system_instruction="You are a Lead Classifier AI. Respond with JSON: {\"classification\": \"LEAD|NOISE|UNCERTAIN\", \"reason\": \"brief explanation\", \"confidence\": 0.0-1.0}",
            temperature=0.2
        )
        layer2_ok = True
    except Exception as e:
        layer2_result = {"error": str(e)}
        layer2_ok = False

    try:
        full_result = await run_pipeline(
            content=test_content,
            saas_description="AI analytics for SaaS",
            saas_info={"name": "AnalyticsAI", "icp_ideal": "SaaS founders"},
        )
        pipeline_ok = True
    except Exception as e:
        full_result = {"error": str(e)}
        pipeline_ok = False

    return {
        "llm_provider": settings.llm_provider,
        "llm_model": settings.llm_model,
        "layer1": {"score": layer1_score, "classification": layer1_class},
        "layer2": {"ok": layer2_ok, "result": layer2_result},
        "full_pipeline": {"ok": pipeline_ok, "result": full_result},
    }
