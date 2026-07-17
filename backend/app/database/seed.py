from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import async_session
from app.models.project import Project
from app.models.team import Team
from app.models.sprint import Sprint
from app.models.task import Task
from datetime import datetime, timedelta
import random


async def seed_database():
    async with async_session() as session:
        projects_data = [
            {"name": "Project Alpha", "status": "active", "health": 92, "completion": 92},
            {"name": "Project Beta", "status": "warning", "health": 65, "completion": 65},
            {"name": "Project Gamma", "status": "critical", "health": 41, "completion": 41},
            {"name": "Project Delta", "status": "active", "health": 81, "completion": 81},
        ]

        for p in projects_data:
            project = Project(
                name=p["name"],
                status=p["status"],
                health_score=p["health"],
                completion=p["completion"],
                start_date=datetime.now() - timedelta(days=random.randint(30, 90)),
                target_date=datetime.now() + timedelta(days=random.randint(14, 60)),
            )
            session.add(project)

        await session.commit()
