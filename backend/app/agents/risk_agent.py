from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.project import Project
from app.models.task import Task
from app.models.sprint import Sprint
from app.services.llm_service import LLMService


class RiskAgent:
    def __init__(self):
        self.llm = LLMService()

    async def scan_for_risks(self, db: AsyncSession):
        alerts = []

        projects = (await db.execute(select(Project))).scalars().all()
        for project in projects:
            tasks = (await db.execute(select(Task).where(Task.project_id == project.id))).scalars().all()
            blocked = [t for t in tasks if t.status == "blocked"]
            total = len(tasks)
            done = len([t for t in tasks if t.status == "done"])

            if len(blocked) > 3:
                alerts.append({
                    "type": "critical",
                    "project": project.name,
                    "message": f"{len(blocked)} tasks are blocked",
                    "recommendation": "Immediate triage needed",
                })

            if total > 0 and done / total < 0.5 and project.completion > 70:
                alerts.append({
                    "type": "warning",
                    "project": project.name,
                    "message": "Sprint velocity dropping - behind schedule",
                    "recommendation": "Consider scope reduction or resource reallocation",
                })

            if project.budget and project.budget_used > project.budget * 0.9:
                alerts.append({
                    "type": "warning",
                    "project": project.name,
                    "message": "Budget utilization above 90%",
                    "recommendation": "Review remaining scope and budget allocation",
                })

            if project.health_score < 50:
                alerts.append({
                    "type": "critical",
                    "project": project.name,
                    "message": f"Health score critical: {project.health_score}%",
                    "recommendation": "Escalate to project leadership",
                })

        return alerts

    async def assess_project_risk(self, db: AsyncSession, project_id: int):
        project = (await db.execute(select(Project).where(Project.id == project_id))).scalar_one_or_none()
        tasks = (await db.execute(select(Task).where(Task.project_id == project_id))).scalars().all()

        blocked = len([t for t in tasks if t.status == "blocked"])
        total = len(tasks)

        risk_score = 0
        risk_score += min(blocked * 10, 40)
        risk_score += max(0, (100 - project.health_score))
        if project.budget and project.budget_used > project.budget * 0.8:
            risk_score += 20

        return {
            "project": project.name,
            "risk_score": min(risk_score, 100),
            "level": "critical" if risk_score > 70 else "high" if risk_score > 50 else "medium" if risk_score > 30 else "low",
            "factors": {
                "blocked_tasks": blocked,
                "health_score": project.health_score,
                "budget_pressure": project.budget_used / project.budget * 100 if project.budget else 0,
            },
        }
