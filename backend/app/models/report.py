from sqlalchemy import Column, Integer, String, DateTime, Text
from app.database.database import Base
from datetime import datetime


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=True)
    type = Column(String(100), nullable=False)  # standup, executive, sprint_review, risk
    title = Column(String(500))
    content = Column(Text, nullable=False)
    generated_by = Column(String(100), default="ai")
    created_at = Column(DateTime, default=datetime.utcnow)
