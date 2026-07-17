from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.agents.forge_mind_agent import ForgeMindAgent

router = APIRouter()

class ProjectDescription(BaseModel):
    description: str

@router.post("/generate")
async def generate_project_plan(project_description: ProjectDescription):
    """
    Generates a new project plan using ForgeMind AI.
    """
    agent = ForgeMindAgent()
    plan = await agent.generate_plan(project_description.description)
    return {"plan": plan}
