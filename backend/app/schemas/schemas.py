from datetime import datetime
from typing import Optional
from pydantic import BaseModel
import uuid


class UserCreate(BaseModel):
    email: str
    name: str = ""
    password: Optional[str] = None
    telegram_chat_id: Optional[str] = None


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    telegram_chat_id: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SaaSInput(BaseModel):
    url: str
    name: Optional[str] = None


class SaaSOut(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    url: str
    name: Optional[str]
    description: Optional[str]
    tone: Optional[str]
    competitors: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class LeadOut(BaseModel):
    id: uuid.UUID
    saas_id: uuid.UUID
    source: str
    source_url: Optional[str]
    author: Optional[str]
    content: str
    intent_score: Optional[float]
    layer: Optional[int]
    pain_points: Optional[str]
    competitor_mentioned: Optional[str]
    suggested_reply: Optional[str]
    reply_angle: Optional[str]
    status: str
    user_rating: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}


class LeadFeedback(BaseModel):
    lead_id: uuid.UUID
    rating: int


class AgentRunResponse(BaseModel):
    status: str
    leads_found: int
    message: str
