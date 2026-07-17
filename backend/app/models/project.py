from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from app.database.database import Base
from datetime import datetime


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, default="")
    status = Column(String(50), default="active")  # active, warning, critical, completed
    health_score = Column(Float, default=100.0)
    completion = Column(Float, default=0.0)
    budget = Column(Float, default=0.0)
    budget_used = Column(Float, default=0.0)
    start_date = Column(DateTime, default=datetime.utcnow)
    target_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sprints = relationship("Sprint", back_populates="project")
    tasks = relationship("Task", back_populates="project")
    risks = relationship("Risk", back_populates="project")
