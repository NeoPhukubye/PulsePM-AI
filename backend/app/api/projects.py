from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.database import get_db
from app.models.project import Project
from app.models.user import User
from app.api.auth import get_current_user
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    budget: Optional[float] = 0.0
    target_date: Optional[datetime] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str
    status: str
    health_score: float
    completion: float
    budget: float
    budget_used: float
    start_date: Optional[datetime]
    target_date: Optional[datetime]

    class Config:
        from_attributes = True


@router.get("/", response_model=list[ProjectResponse])
async def get_projects(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project))
    return result.scalars().all()


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    return result.scalar_one_or_none()


@router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    db_project = Project(**project.model_dump())
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project


@router.get("/{project_id}/health")
async def get_project_health(project_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    return {
        "project_id": project_id,
        "health_score": project.health_score,
        "status": project.status,
        "completion": project.completion,
        "budget_status": "on_track" if project.budget_used <= project.budget else "over",
    }
