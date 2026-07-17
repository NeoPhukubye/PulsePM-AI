from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from app.database.database import Base
from datetime import datetime


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    lead = Column(String(200))
    member_count = Column(Integer, default=0)
    velocity = Column(Float, default=0.0)
    workload = Column(Float, default=0.0)  # percentage
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("TeamMember", back_populates="team")


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, nullable=False)
    name = Column(String(200), nullable=False)
    role = Column(String(100))
    workload = Column(Float, default=0.0)
    tasks_completed = Column(Integer, default=0)
    tasks_assigned = Column(Integer, default=0)

    team = relationship("Team", back_populates="members", foreign_keys=[team_id])
