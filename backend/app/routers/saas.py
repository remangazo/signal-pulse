from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.saas import SaaS
from app.schemas.schemas import SaaSInput, SaaSOut, AgentRunResponse
from app.agents.cartographer import analyze_saas
from app.agents.sentinel import gather_raw_leads
from app.agents.auditor import run_pipeline
from app.agents.ghostwriter import draft_reply
from app.models.lead import Lead
import json

router = APIRouter(prefix="/saas", tags=["saas"])


@router.post("/register", response_model=SaaSOut)
async def register_saas(payload: SaaSInput, user_id: str = "mock-user", db: AsyncSession = Depends(get_db)):
    saas = SaaS(
        user_id=user_id,
        url=payload.url,
        name=payload.name or payload.url,
    )

    analysis = await analyze_saas(payload.url, payload.name)
    saas.description = analysis.get("description", "")
    saas.tone = analysis.get("tone", "professional")
    saas.competitors = json.dumps(analysis.get("competitors", []))
    saas.pain_points = json.dumps(analysis.get("pain_points", []))

    db.add(saas)
    await db.commit()
    await db.refresh(saas)
    return saas


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
