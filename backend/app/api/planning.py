from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.models.user import User
from app.api.auth import get_current_user
from app.agents.forge_mind_agent import ForgeMindAgent

router = APIRouter()

class ProjectDescription(BaseModel):
    description: str

@router.post("/generate")
async def generate_project_plan(project_description: ProjectDescription, current_user: User = Depends(get_current_user)):
    agent = ForgeMindAgent()
    plan = await agent.generate_plan(project_description.description)
    return {"plan": plan}
