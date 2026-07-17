from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.project import Project
from app.models.sprint import Sprint
from app.models.task import Task
from app.services.llm_service import LLMService


class PlanningAgent:
    def __init__(self):
        self.llm = LLMService()

    async def get_recommendations(self, db: AsyncSession, project_id: int = None):
        query = select(Project)
        if project_id:
            query = query.where(Project.id == project_id)

        projects = (await db.execute(query)).scalars().all()
        recommendations = []

        for project in projects:
            tasks = (await db.execute(select(Task).where(Task.project_id == project.id))).scalars().all()
            sprints = (await db.execute(select(Sprint).where(Sprint.project_id == project.id))).scalars().all()

            in_progress = [t for t in tasks if t.status == "in_progress"]
            blocked = [t for t in tasks if t.status == "blocked"]
            high_priority_todo = [t for t in tasks if t.status == "todo" and t.priority in ("high", "critical")]

            avg_velocity = sum(s.velocity for s in sprints) / len(sprints) if sprints else 0

            if blocked:
                recommendations.append({
                    "project": project.name,
                    "action": "reassign",
                    "details": f"Reassign blocked tasks: {', '.join(t.title for t in blocked[:3])}",
                    "priority": "high",
                })

            if len(in_progress) > 10:
                recommendations.append({
                    "project": project.name,
                    "action": "reduce_wip",
                    "details": "Too many tasks in progress. Reduce WIP to improve flow.",
                    "priority": "medium",
                })

            if high_priority_todo:
                recommendations.append({
                    "project": project.name,
                    "action": "prioritize",
                    "details": f"High priority items waiting: {', '.join(t.title for t in high_priority_todo[:3])}",
                    "priority": "high",
                })

        return recommendations

    async def suggest_sprint_plan(self, db: AsyncSession, project_id: int):
        tasks = (await db.execute(select(Task).where(Task.project_id == project_id, Task.status == "todo"))).scalars().all()
        sprints = (await db.execute(select(Sprint).where(Sprint.project_id == project_id))).scalars().all()

        avg_velocity = sum(s.velocity for s in sprints) / len(sprints) if sprints else 20
        available_points = int(avg_velocity)

        suggested = sorted(tasks, key=lambda t: {"critical": 0, "high": 1, "medium": 2, "low": 3}.get(t.priority, 2))
        planned = []
        total_points = 0
        for task in suggested:
            if total_points + task.story_points <= available_points:
                planned.append({"title": task.title, "points": task.story_points, "priority": task.priority})
                total_points += task.story_points

        return {
            "recommended_capacity": available_points,
            "planned_points": total_points,
            "tasks": planned,
        }
