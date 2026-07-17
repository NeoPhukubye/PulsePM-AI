from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.agents.executive_agent import ExecutiveAgent
from app.agents.reporting_agent import ReportingAgent
from app.models.report import Report
from sqlalchemy import select

router = APIRouter()


@router.get("/executive")
async def get_executive_report(db: AsyncSession = Depends(get_db)):
    agent = ExecutiveAgent()
    report = await agent.generate_report(db)
    return report


@router.get("/sprint/{sprint_id}")
async def get_sprint_report(sprint_id: int, db: AsyncSession = Depends(get_db)):
    agent = ReportingAgent()
    return await agent.generate_sprint_report(db, sprint_id)


@router.get("/history")
async def get_report_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Report).order_by(Report.created_at.desc()).limit(20)
    )
    return result.scalars().all()


@router.post("/generate")
async def generate_report(report_type: str = "executive", db: AsyncSession = Depends(get_db)):
    if report_type == "executive":
        agent = ExecutiveAgent()
        content = await agent.generate_report(db)
    else:
        agent = ReportingAgent()
        content = await agent.generate_sprint_report(db)

    report = Report(type=report_type, title=f"{report_type.title()} Report", content=str(content))
    db.add(report)
    await db.commit()
    return content
