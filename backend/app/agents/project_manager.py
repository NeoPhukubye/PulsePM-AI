from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.project import Project
from app.models.task import Task
from app.models.sprint import Sprint
from app.services.llm_service import LLMService


class ProjectManagerAgent:
    def __init__(self):
        self.llm = LLMService()

    async def get_project_status(self, db: AsyncSession, project_id: int):
        result = await db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()
        if not project:
            return None

        tasks_result = await db.execute(select(Task).where(Task.project_id == project_id))
        tasks = tasks_result.scalars().all()

        total_tasks = len(tasks)
        completed = len([t for t in tasks if t.status == "done"])
        blocked = len([t for t in tasks if t.status == "blocked"])
        in_progress = len([t for t in tasks if t.status == "in_progress"])

        return {
            "project": project.name,
            "health_score": project.health_score,
            "status": project.status,
            "completion": project.completion,
            "total_tasks": total_tasks,
            "completed_tasks": completed,
            "blocked_tasks": blocked,
            "in_progress_tasks": in_progress,
            "budget_used": f"{(project.budget_used / project.budget * 100) if project.budget else 0:.1f}%",
            "days_remaining": (project.target_date - project.start_date).days if project.target_date else None,
        }

    async def monitor_all_projects(self, db: AsyncSession):
        result = await db.execute(select(Project))
        projects = result.scalars().all()
        statuses = []
        for project in projects:
            status = await self.get_project_status(db, project.id)
            if status:
                statuses.append(status)
        return statuses

    async def get_recommendations(self, db: AsyncSession, project_id: int):
        status = await self.get_project_status(db, project_id)
        prompt = f"""Based on this project status, provide 3-5 actionable recommendations:
        {status}"""
        return await self.llm.generate(prompt)
