from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.database import get_db
from app.api.auth import get_current_user
from app.agents.executive_agent import ExecutiveAgent
from app.agents.reporting_agent import ReportingAgent
from app.models.report import Report
from app.models.user import User
from app.services.email_service import EmailNotificationService

router = APIRouter()


class EmailReportRequest(BaseModel):
    report_type: str = "executive"
    recipients: List[str] = []
    include_managers: bool = True
    include_stakeholders: bool = True
    custom_message: Optional[str] = None


@router.get("/executive")
async def get_executive_report(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    agent = ExecutiveAgent()
    report = await agent.generate_report(db)
    return report


@router.get("/sprint/{sprint_id}")
async def get_sprint_report(sprint_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    agent = ReportingAgent()
    return await agent.generate_sprint_report(db, sprint_id)


@router.get("/history")
async def get_report_history(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Report).order_by(Report.created_at.desc()).limit(20)
    )
    return result.scalars().all()


@router.post("/generate")
async def generate_report(report_type: str = "executive", current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
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


@router.post("/generate-and-email")
async def generate_and_email_report(request: EmailReportRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if request.report_type == "executive":
        agent = ExecutiveAgent()
        content = await agent.generate_report(db)
    elif request.report_type == "sprint":
        agent = ReportingAgent()
        content = await agent.generate_sprint_report(db)
    elif request.report_type == "risk":
        agent = ExecutiveAgent()
        content = await agent.generate_report(db)
    else:
        agent = ExecutiveAgent()
        content = await agent.generate_report(db)

    report = Report(type=request.report_type, title=f"{request.report_type.title()} Report", content=str(content))
    db.add(report)
    await db.commit()

    # Collect recipients
    recipient_emails = list(request.recipients)

    if request.include_managers:
        managers = (await db.execute(
            select(User).where(User.role.in_(["manager", "project_manager", "admin"]))
        )).scalars().all()
        recipient_emails.extend([u.email for u in managers])

    if request.include_stakeholders:
        stakeholders = (await db.execute(
            select(User).where(User.role.in_(["stakeholder", "executive"]))
        )).scalars().all()
        recipient_emails.extend([u.email for u in stakeholders])

    # Deduplicate
    recipient_emails = list(set(recipient_emails))

    # Send emails
    email_service = EmailNotificationService()
    sent_count = 0
    report_title = f"{request.report_type.title()} Report"

    html_body = _build_report_email(report_title, content, request.custom_message)

    for email in recipient_emails:
        await email_service.send_email(email, f"📊 {report_title} - PulsePM AI", html_body)
        sent_count += 1

    return {
        "report": content,
        "email_sent_to": recipient_emails,
        "sent_count": sent_count,
        "report_type": request.report_type,
    }


def _build_report_email(title: str, report_data: dict, custom_message: str = None) -> str:
    custom_section = f'<p style="color: #e2e8f0; margin: 15px 0; padding: 15px; background: #1e3a5f; border-radius: 8px;">{custom_message}</p>' if custom_message else ""

    metrics_rows = ""
    if isinstance(report_data, dict):
        for key, value in list(report_data.items())[:10]:
            if key.startswith("_"):
                continue
            label = key.replace("_", " ").title()
            metrics_rows += f'<tr><td style="padding: 8px 12px; color: #94a3b8; border-bottom: 1px solid #334155;">{label}</td><td style="padding: 8px 12px; color: #f8fafc; font-weight: bold; text-align: right; border-bottom: 1px solid #334155;">{value}</td></tr>'

    return f"""
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1e293b; border-radius: 12px; padding: 30px; color: #e2e8f0;">
            <h1 style="color: #f8fafc; margin: 0 0 10px;">📊 {title}</h1>
            <p style="color: #94a3b8;">Generated by PulsePM AI</p>
            {custom_section}
            <div style="background: #334155; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    {metrics_rows}
                </table>
            </div>
            <hr style="border: 1px solid #334155; margin: 20px 0;">
            <p style="color: #64748b; font-size: 12px;">PulsePM AI - Intelligent Project Management</p>
        </div>
    </div>"""
