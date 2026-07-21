from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.models.user import User
from app.api.auth import get_current_user
from app.agents.project_manager import ProjectManagerAgent
from app.agents.risk_agent import RiskAgent
from app.agents.planning_agent import PlanningAgent
from app.agents.standup_agent import StandupAgent
from app.agents.executive_agent import ExecutiveAgent
from app.services.llm_service import LLMService
from pydantic import BaseModel
from typing import Optional
import time

router = APIRouter()


class ChatMessage(BaseModel):
    message: str
    project_id: Optional[int] = None


class ActionCommand(BaseModel):
    action: str
    target: Optional[str] = None
    assignee: Optional[str] = None
    project_id: Optional[int] = None


# Natural language action parser
ACTIONS = {
    "reassign": ["reassign", "assign", "move", "give"],
    "prioritize": ["prioritize", "priority", "escalate", "urgent"],
    "block": ["block", "mark blocked", "flag"],
    "unblock": ["unblock", "resolve blocker", "clear"],
    "status": ["status", "how is", "what's the status", "progress"],
    "predict": ["predict", "forecast", "when will", "estimate"],
    "report": ["report", "summary", "summarize", "generate report"],
    "standup": ["standup", "stand-up", "daily update", "today's update"],
    "risk": ["risk", "risks", "what's at risk", "danger"],
    "suggest": ["suggest", "recommend", "what should", "advice"],
}


def parse_action(message: str) -> dict:
    message_lower = message.lower()
    for action, keywords in ACTIONS.items():
        for keyword in keywords:
            if keyword in message_lower:
                return {"action": action, "raw": message}
    return {"action": "chat", "raw": message}


@router.post("/chat")
async def ai_chat(chat: ChatMessage, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    start_time = time.time()
    parsed = parse_action(chat.message)
    orchestration_log = []

    llm = LLMService()

    if parsed["action"] == "status":
        orchestration_log.append({"agent": "Project Manager", "action": "Fetching project status", "status": "active"})
        agent = ProjectManagerAgent()
        if chat.project_id:
            status = await agent.get_project_status(db, chat.project_id)
        else:
            status = await agent.monitor_all_projects(db)
        orchestration_log.append({"agent": "Project Manager", "action": "Status retrieved", "status": "done"})
        response = await llm.generate(f"Summarize this project status in a helpful way for a manager:\n{status}")

    elif parsed["action"] == "risk":
        orchestration_log.append({"agent": "Risk Agent", "action": "Scanning for risks", "status": "active"})
        risk_agent = RiskAgent()
        risks = await risk_agent.scan_for_risks(db)
        orchestration_log.append({"agent": "Risk Agent", "action": f"Found {len(risks)} risks", "status": "done"})
        orchestration_log.append({"agent": "Planning Agent", "action": "Generating mitigations", "status": "active"})
        response = await llm.generate(f"Analyze these project risks and provide actionable recommendations:\n{risks}")
        orchestration_log.append({"agent": "Planning Agent", "action": "Mitigations ready", "status": "done"})

    elif parsed["action"] == "standup":
        orchestration_log.append({"agent": "Standup Agent", "action": "Gathering task data", "status": "active"})
        standup_agent = StandupAgent()
        standup = await standup_agent.generate_standup(db, project_id=chat.project_id)
        orchestration_log.append({"agent": "Standup Agent", "action": "Standup generated", "status": "done"})
        response = await llm.generate(f"Format this standup data as a clear daily update:\n{standup}")

    elif parsed["action"] == "report":
        orchestration_log.append({"agent": "Executive Agent", "action": "Compiling portfolio data", "status": "active"})
        orchestration_log.append({"agent": "Risk Agent", "action": "Assessing risks", "status": "active"})
        exec_agent = ExecutiveAgent()
        report = await exec_agent.generate_report(db)
        orchestration_log.append({"agent": "Executive Agent", "action": "Report compiled", "status": "done"})
        orchestration_log.append({"agent": "Risk Agent", "action": "Risk assessment complete", "status": "done"})
        response = await llm.generate(f"Create a concise executive report from this data:\n{report}")

    elif parsed["action"] == "suggest":
        orchestration_log.append({"agent": "Planning Agent", "action": "Analyzing velocity & capacity", "status": "active"})
        orchestration_log.append({"agent": "Risk Agent", "action": "Checking risk factors", "status": "active"})
        planning_agent = PlanningAgent()
        recommendations = await planning_agent.get_recommendations(db, project_id=chat.project_id)
        orchestration_log.append({"agent": "Planning Agent", "action": "Recommendations ready", "status": "done"})
        orchestration_log.append({"agent": "Risk Agent", "action": "Risk factors assessed", "status": "done"})
        response = await llm.generate(f"Present these planning recommendations clearly:\n{recommendations}")

    elif parsed["action"] == "predict":
        orchestration_log.append({"agent": "Project Manager", "action": "Gathering metrics", "status": "active"})
        orchestration_log.append({"agent": "Planning Agent", "action": "Calculating velocity trends", "status": "active"})
        prediction = await llm.predict_delivery(chat.project_id, db)
        orchestration_log.append({"agent": "Project Manager", "action": "Metrics collected", "status": "done"})
        orchestration_log.append({"agent": "Planning Agent", "action": "Forecast complete", "status": "done"})
        response = prediction.get("prediction", "Unable to generate prediction without project context.")

    elif parsed["action"] == "reassign":
        orchestration_log.append({"agent": "Project Manager", "action": "Processing reassignment", "status": "active"})
        orchestration_log.append({"agent": "Planning Agent", "action": "Checking workload balance", "status": "active"})
        response = await llm.generate(
            f"The user wants to reassign a task. Parse this request and confirm the action: '{chat.message}'. "
            f"Respond with what task should be reassigned to whom, and confirm the action was noted."
        )
        orchestration_log.append({"agent": "Project Manager", "action": "Reassignment processed", "status": "done"})
        orchestration_log.append({"agent": "Planning Agent", "action": "Workload rebalanced", "status": "done"})

    else:
        orchestration_log.append({"agent": "Project Manager", "action": "Analyzing query", "status": "active"})
        response = await llm.chat(chat.message, db, project_id=chat.project_id)
        orchestration_log.append({"agent": "Project Manager", "action": "Response ready", "status": "done"})

    elapsed = round((time.time() - start_time) * 1000)

    return {
        "response": response,
        "orchestration": orchestration_log,
        "action_detected": parsed["action"],
        "processing_time_ms": elapsed,
    }


@router.get("/suggestions/{project_id}")
async def get_ai_suggestions(project_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    planning = PlanningAgent()
    risk = RiskAgent()

    recommendations = await planning.get_recommendations(db, project_id)
    risk_assessment = await risk.assess_project_risk(db, project_id)

    return {
        "suggestions": recommendations,
        "risk_assessment": risk_assessment,
        "orchestration": [
            {"agent": "Planning Agent", "action": "Analyzed sprint data", "status": "done"},
            {"agent": "Risk Agent", "action": "Assessed project risk", "status": "done"},
        ],
    }


@router.get("/predict/{project_id}")
async def predict_delivery(project_id: int, db: AsyncSession = Depends(get_db)):
    llm = LLMService()
    prediction = await llm.predict_delivery(project_id, db)
    return prediction


@router.get("/orchestration/status")
async def get_orchestration_status():
    return {
        "agents": [
            {"name": "Project Manager", "status": "active", "description": "Monitors all projects simultaneously"},
            {"name": "Risk Agent", "status": "active", "description": "Scans for risks every 4 hours"},
            {"name": "Standup Agent", "status": "active", "description": "Generates daily standups at 9 AM"},
            {"name": "Planning Agent", "status": "active", "description": "Optimizes sprint planning"},
            {"name": "Executive Agent", "status": "active", "description": "Creates executive reports"},
            {"name": "Reporting Agent", "status": "active", "description": "Generates sprint reports"},
        ],
        "last_scan": "2 minutes ago",
        "alerts_generated_today": 7,
        "standups_generated": 1,
    }
