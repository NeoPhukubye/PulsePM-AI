from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.project import Project
from app.models.task import Task
from app.models.sprint import Sprint


class AnalyticsService:
    async def get_dashboard_stats(self, db: AsyncSession):
        projects = (await db.execute(select(Project))).scalars().all()
        tasks = (await db.execute(select(Task))).scalars().all()

        active_projects = len([p for p in projects if p.status in ("active", "warning", "critical")])
        avg_health = sum(p.health_score for p in projects) / len(projects) if projects else 0
        blocked_tasks = len([t for t in tasks if t.status == "blocked"])
        critical_bugs = len([t for t in tasks if t.priority == "critical" and t.status != "done"])

        return {
            "active_projects": active_projects,
            "overall_health": round(avg_health, 1),
            "total_developers": 42,
            "teams": 6,
            "high_risks": len([p for p in projects if p.health_score < 50]),
            "critical_bugs": critical_bugs,
            "blocked_tasks": blocked_tasks,
        }

    async def get_velocity_data(self, db: AsyncSession, project_id: int):
        sprints = (await db.execute(
            select(Sprint).where(Sprint.project_id == project_id).order_by(Sprint.number)
        )).scalars().all()

        return {
            "sprints": [
                {"name": s.name, "number": s.number, "velocity": s.velocity, "planned": s.planned_points, "completed": s.completed_points}
                for s in sprints
            ]
        }

    async def get_burndown_data(self, db: AsyncSession, project_id: int):
        tasks = (await db.execute(select(Task).where(Task.project_id == project_id))).scalars().all()
        total_points = sum(t.story_points for t in tasks)
        completed_points = sum(t.story_points for t in tasks if t.status == "done")

        return {
            "total_points": total_points,
            "completed_points": completed_points,
            "remaining_points": total_points - completed_points,
            "ideal_burndown": total_points,
        }
