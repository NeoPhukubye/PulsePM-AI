from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json

from app.api import projects, teams, standups, reports, alerts, ai
from app.database.database import engine, Base
from app.database.seed import seed_database
from app.services.scheduler import start_scheduler

app = FastAPI(
    title="ProjectPulse AI",
    description="AI-powered multi-agent project management platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(teams.router, prefix="/api/teams", tags=["Teams"])
app.include_router(standups.router, prefix="/api/standups", tags=["Standups"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass


manager = ConnectionManager()


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_database()
    start_scheduler()
    asyncio.create_task(live_alert_broadcaster())


async def live_alert_broadcaster():
    """Periodically broadcasts live alerts to all connected WebSocket clients."""
    from app.database.database import async_session
    from app.agents.risk_agent import RiskAgent

    while True:
        await asyncio.sleep(30)
        if manager.active_connections:
            try:
                async with async_session() as db:
                    agent = RiskAgent()
                    alerts = await agent.scan_for_risks(db)
                    if alerts:
                        await manager.broadcast({
                            "type": "alert",
                            "data": alerts[:3],
                            "timestamp": __import__('datetime').datetime.now().isoformat(),
                        })
            except Exception:
                pass


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data) if data else {}
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/")
async def root():
    return {
        "message": "ProjectPulse AI API",
        "version": "1.0.0",
        "agents": ["project_manager", "standup", "risk", "planning", "executive", "reporting"],
        "websocket": "/ws",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


# Expose manager for use in other modules
app.state.ws_manager = manager
