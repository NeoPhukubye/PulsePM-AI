from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.project import Project
from app.agents.risk_agent import RiskAgent
from app.services.llm_service import LLMService


class ExecutiveAgent:
    def __init__(self):
        self.llm = LLMService()
        self.risk_agent = RiskAgent()

    async def generate_report(self, db: AsyncSession):
        projects = (await db.execute(select(Project))).scalars().all()
        alerts = await self.risk_agent.scan_for_risks(db)

        total_health = sum(p.health_score for p in projects) / len(projects) if projects else 0
        total_completion = sum(p.completion for p in projects) / len(projects) if projects else 0

        critical_projects = [p for p in projects if p.status == "critical"]
        healthy_projects = [p for p in projects if p.health_score >= 80]

        overall_status = "green" if total_health >= 80 else "yellow" if total_health >= 60 else "red"

        report = {
            "overall_health": round(total_health, 1),
            "overall_status": overall_status,
            "total_projects": len(projects),
            "average_completion": round(total_completion, 1),
            "critical_projects": len(critical_projects),
            "healthy_projects": len(healthy_projects),
            "active_alerts": len(alerts),
            "high_risk_alerts": len([a for a in alerts if a["type"] == "critical"]),
            "projects": [
                {
                    "name": p.name,
                    "health": p.health_score,
                    "completion": p.completion,
                    "status": p.status,
                }
                for p in projects
            ],
            "top_risks": alerts[:5],
            "forecast": "On track" if total_health >= 75 else "At risk - intervention needed",
        }

        return report
