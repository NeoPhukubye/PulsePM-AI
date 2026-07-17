from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.database import get_db
from app.models.user import User, Company, ProjectSubscription
from pydantic import BaseModel, EmailStr
from typing import Optional
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "projectpulse-secret-key-change-in-production")
ALGORITHM = "HS256"


class CompanyRegister(BaseModel):
    company_name: str
    admin_name: str
    admin_email: str
    password: str


class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    company_id: Optional[int] = None
    role: Optional[str] = "member"


class UserLogin(BaseModel):
    email: str
    password: str


class NotificationPreferences(BaseModel):
    notify_project_behind: bool = True
    notify_risk_critical: bool = True
    notify_daily_standup: bool = False
    notify_weekly_report: bool = True


class SubscribeProject(BaseModel):
    project_id: int
    notify_behind: bool = True
    notify_blocked: bool = True
    notify_budget: bool = True


def create_token(user_id: int, email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode({"sub": str(user_id), "email": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register/company")
async def register_company(data: CompanyRegister, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == data.admin_email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    company = Company(name=data.company_name, domain=data.admin_email.split("@")[1])
    db.add(company)
    await db.flush()

    user = User(
        email=data.admin_email,
        name=data.admin_name,
        password_hash=pwd_context.hash(data.password),
        role="admin",
        company_id=company.id,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return {
        "message": "Company registered successfully",
        "user_id": user.id,
        "company_id": company.id,
        "token": create_token(user.id, user.email),
    }


@router.post("/register")
async def register_user(data: UserRegister, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        name=data.name,
        password_hash=pwd_context.hash(data.password),
        role=data.role,
        company_id=data.company_id,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return {
        "message": "Registration successful",
        "user_id": user.id,
        "token": create_token(user.id, user.email),
    }


@router.post("/login")
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "company_id": user.company_id,
        "token": create_token(user.id, user.email),
        "notifications": {
            "notify_project_behind": user.notify_project_behind,
            "notify_risk_critical": user.notify_risk_critical,
            "notify_daily_standup": user.notify_daily_standup,
            "notify_weekly_report": user.notify_weekly_report,
        },
    }


@router.put("/notifications/{user_id}")
async def update_notifications(user_id: int, prefs: NotificationPreferences, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.notify_project_behind = prefs.notify_project_behind
    user.notify_risk_critical = prefs.notify_risk_critical
    user.notify_daily_standup = prefs.notify_daily_standup
    user.notify_weekly_report = prefs.notify_weekly_report
    await db.commit()

    return {"message": "Notification preferences updated"}


@router.post("/subscribe")
async def subscribe_to_project(data: SubscribeProject, user_id: int = 1, db: AsyncSession = Depends(get_db)):
    sub = ProjectSubscription(
        user_id=user_id,
        project_id=data.project_id,
        notify_behind=data.notify_behind,
        notify_blocked=data.notify_blocked,
        notify_budget=data.notify_budget,
    )
    db.add(sub)
    await db.commit()
    return {"message": f"Subscribed to project {data.project_id} notifications"}


@router.get("/subscriptions/{user_id}")
async def get_subscriptions(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProjectSubscription).where(ProjectSubscription.user_id == user_id))
    subs = result.scalars().all()
    return [{"project_id": s.project_id, "notify_behind": s.notify_behind, "notify_blocked": s.notify_blocked, "notify_budget": s.notify_budget} for s in subs]


@router.delete("/subscribe/{subscription_id}")
async def unsubscribe(subscription_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProjectSubscription).where(ProjectSubscription.id == subscription_id))
    sub = result.scalar_one_or_none()
    if sub:
        await db.delete(sub)
        await db.commit()
    return {"message": "Unsubscribed"}
