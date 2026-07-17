from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import projects, teams, standups, reports, alerts, ai
from app.database.database import engine, Base
from app.services.scheduler import start_scheduler

app = FastAPI(
    title="ProjectPulse AI",
    description="AI-powered project management platform",
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


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    start_scheduler()


@app.get("/")
async def root():
    return {"message": "ProjectPulse AI API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
