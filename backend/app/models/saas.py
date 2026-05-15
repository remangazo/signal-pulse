import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class SaaS(Base):
    __tablename__ = "saas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    url = Column(String(500), nullable=False)
    name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    tone = Column(String(100), nullable=True, default="professional")
    competitors = Column(Text, nullable=True)
    pain_points = Column(Text, nullable=True)
    config = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
