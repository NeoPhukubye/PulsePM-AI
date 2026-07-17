from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.project import Project
from app.models.sprint import Sprint
from app.services.llm_service import LLMService


class ReportingAgent:
    def __init__(self):
        self.llm = LLMService()

    async def generate_sprint_report(self, db: AsyncSession, sprint_id: int = None):
        if sprint_id:
            sprint = (await db.execute(select(Sprint).where(Sprint.id == sprint_id))).scalar_one_or_none()
            if not sprint:
                return {"error": "Sprint not found"}
            sprints = [sprint]
        else:
            sprints = (await db.execute(select(Sprint).where(Sprint.status == "active"))).scalars().all()

        reports = []
        for sprint in sprints:
            completion = (sprint.completed_points / sprint.planned_points * 100) if sprint.planned_points else 0
            reports.append({
                "sprint": sprint.name,
                "number": sprint.number,
                "velocity": sprint.velocity,
                "planned_points": sprint.planned_points,
                "completed_points": sprint.completed_points,
                "completion_rate": round(completion, 1),
                "status": "on_track" if completion >= 70 else "at_risk" if completion >= 40 else "behind",
            })

        return {"sprint_reports": reports}
