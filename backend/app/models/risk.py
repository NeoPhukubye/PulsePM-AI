from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.database import Base
from datetime import datetime


class Risk(Base):
    __tablename__ = "risks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, default="")
    severity = Column(String(50), default="medium")  # low, medium, high, critical
    category = Column(String(100))  # schedule, budget, scope, resource, technical
    status = Column(String(50), default="open")  # open, mitigated, resolved
    impact_score = Column(Float, default=0.0)
    detected_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="risks")
