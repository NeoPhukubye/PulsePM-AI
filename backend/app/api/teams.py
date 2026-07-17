from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.database import get_db
from app.models.team import Team, TeamMember
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class TeamResponse(BaseModel):
    id: int
    name: str
    lead: Optional[str]
    member_count: int
    velocity: float
    workload: float

    class Config:
        from_attributes = True


@router.get("/", response_model=list[TeamResponse])
async def get_teams(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Team))
    return result.scalars().all()


@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(team_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Team).where(Team.id == team_id))
    return result.scalar_one_or_none()


@router.get("/{team_id}/workload")
async def get_team_workload(team_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TeamMember).where(TeamMember.team_id == team_id))
    members = result.scalars().all()
    return {
        "team_id": team_id,
        "members": [
            {
                "name": m.name,
                "role": m.role,
                "workload": m.workload,
                "tasks_assigned": m.tasks_assigned,
                "tasks_completed": m.tasks_completed,
            }
            for m in members
        ],
    }
