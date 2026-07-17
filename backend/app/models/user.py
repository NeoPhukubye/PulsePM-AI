from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.database import Base
from datetime import datetime


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(300), nullable=False)
    domain = Column(String(200))
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="company")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(300), unique=True, nullable=False, index=True)
    name = Column(String(300), nullable=False)
    password_hash = Column(String(500), nullable=False)
    role = Column(String(100), default="member")
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    is_active = Column(Boolean, default=True)

    # OAuth
    oauth_provider = Column(String(50), nullable=True)  # github, gitlab
    github_token = Column(String(500), nullable=True)
    gitlab_token = Column(String(500), nullable=True)
    avatar_url = Column(String(500), nullable=True)

    # Notification preferences
    notify_project_behind = Column(Boolean, default=True)
    notify_risk_critical = Column(Boolean, default=True)
    notify_daily_standup = Column(Boolean, default=False)
    notify_weekly_report = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="users")
    subscriptions = relationship("ProjectSubscription", back_populates="user")


class ProjectSubscription(Base):
    __tablename__ = "project_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    notify_behind = Column(Boolean, default=True)
    notify_blocked = Column(Boolean, default=True)
    notify_budget = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="subscriptions")
