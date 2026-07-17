from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.task import Task
from app.models.project import Project
from app.services.llm_service import LLMService


class StandupAgent:
    def __init__(self):
        self.llm = LLMService()

    async def generate_standup(self, db: AsyncSession, project_id: int = None):
        query = select(Task)
        if project_id:
            query = query.where(Task.project_id == project_id)

        result = await db.execute(query)
        tasks = result.scalars().all()

        completed = [t for t in tasks if t.status == "done"]
        in_progress = [t for t in tasks if t.status == "in_progress"]
        blocked = [t for t in tasks if t.status == "blocked"]

        context = {
            "yesterday": [{"title": t.title, "assignee": t.assignee} for t in completed[-5:]],
            "today_focus": [{"title": t.title, "assignee": t.assignee, "priority": t.priority} for t in in_progress[:5]],
            "blockers": [{"title": t.title, "assignee": t.assignee} for t in blocked],
        }

        prompt = f"""Generate a daily standup summary based on this data:

Yesterday completed: {context['yesterday']}
Today's focus: {context['today_focus']}
Current blockers: {context['blockers']}

Format as a clear standup with sections: Yesterday, Today's Focus, Blockers, and Recommended Discussion Topics."""

        ai_summary = await self.llm.generate(prompt)

        return {
            "standup": {
                "yesterday": context["yesterday"],
                "today_focus": context["today_focus"],
                "blockers": context["blockers"],
            },
            "ai_summary": ai_summary,
            "recommendations": await self._get_recommendations(blocked),
        }

    async def _get_recommendations(self, blocked_tasks):
        if not blocked_tasks:
            return ["No blockers - team is progressing well"]
        return [f"Unblock: {t.title} (assigned to {t.assignee})" for t in blocked_tasks[:3]]
