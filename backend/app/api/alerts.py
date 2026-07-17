from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.agents.risk_agent import RiskAgent
from app.models.risk import Risk
from sqlalchemy import select

router = APIRouter()


@router.get("/")
async def get_alerts(db: AsyncSession = Depends(get_db)):
    agent = RiskAgent()
    alerts = await agent.scan_for_risks(db)
    return alerts


@router.get("/active")
async def get_active_risks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Risk).where(Risk.status == "open"))
    return result.scalars().all()


@router.get("/project/{project_id}")
async def get_project_alerts(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Risk).where(Risk.project_id == project_id, Risk.status == "open")
    )
    return result.scalars().all()
