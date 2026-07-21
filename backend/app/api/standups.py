from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.models.user import User
from app.api.auth import get_current_user
from app.agents.standup_agent import StandupAgent
from app.models.report import Report
from sqlalchemy import select

router = APIRouter()


@router.get("/today")
async def get_today_standup(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    agent = StandupAgent()
    standup = await agent.generate_standup(db)
    return standup


@router.get("/history")
async def get_standup_history(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Report).where(Report.type == "standup").order_by(Report.created_at.desc()).limit(14)
    )
    return result.scalars().all()


@router.post("/generate")
async def generate_standup(project_id: int = None, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    agent = StandupAgent()
    standup = await agent.generate_standup(db, project_id=project_id)
    report = Report(
        project_id=project_id,
        type="standup",
        title="Daily Standup",
        content=str(standup),
    )
    db.add(report)
    await db.commit()
    return standup
