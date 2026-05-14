from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.lead import Lead
from app.schemas.schemas import LeadOut, LeadFeedback
import uuid

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("/{saas_id}", response_model=list[LeadOut])
async def list_leads(saas_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Lead).where(Lead.saas_id == saas_id).order_by(Lead.intent_score.desc().nullslast())
    )
    leads = result.scalars().all()
    return leads


@router.post("/feedback")
async def submit_feedback(payload: LeadFeedback, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).where(Lead.id == payload.lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    lead.user_rating = payload.rating
    if payload.rating >= 4:
        lead.status = "approved"
    elif payload.rating <= 2:
        lead.status = "rejected"
    else:
        lead.status = "reviewed"

    await db.commit()
    return {"status": "ok"}
