from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.services.llm_service import LLMService
from pydantic import BaseModel

router = APIRouter()


class ChatMessage(BaseModel):
    message: str
    project_id: int = None


@router.post("/chat")
async def ai_chat(chat: ChatMessage, db: AsyncSession = Depends(get_db)):
    llm = LLMService()
    response = await llm.chat(chat.message, db, project_id=chat.project_id)
    return {"response": response}


@router.get("/suggestions/{project_id}")
async def get_ai_suggestions(project_id: int, db: AsyncSession = Depends(get_db)):
    llm = LLMService()
    suggestions = await llm.get_suggestions(project_id, db)
    return {"suggestions": suggestions}


@router.get("/predict/{project_id}")
async def predict_delivery(project_id: int, db: AsyncSession = Depends(get_db)):
    llm = LLMService()
    prediction = await llm.predict_delivery(project_id, db)
    return prediction
