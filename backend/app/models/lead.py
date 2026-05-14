import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Float, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    saas_id = Column(UUID(as_uuid=True), ForeignKey("saas.id", ondelete="CASCADE"), nullable=False, index=True)
    source = Column(String(50), nullable=False)
    source_url = Column(Text, nullable=True)
    author = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    intent_score = Column(Float, nullable=True)
    layer = Column(Integer, nullable=True)
    pain_points = Column(Text, nullable=True)
    competitor_mentioned = Column(String(255), nullable=True)
    suggested_reply = Column(Text, nullable=True)
    reply_angle = Column(String(255), nullable=True)
    status = Column(String(50), default="new")
    user_rating = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
