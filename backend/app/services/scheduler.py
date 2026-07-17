from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()


def start_scheduler():
    scheduler.add_job(daily_standup_job, "cron", hour=9, minute=0)
    scheduler.add_job(risk_scan_job, "interval", hours=4)
    scheduler.add_job(health_check_job, "interval", hours=1)
    scheduler.start()


async def daily_standup_job():
    from app.database.database import async_session
    from app.agents.standup_agent import StandupAgent

    async with async_session() as db:
        agent = StandupAgent()
        await agent.generate_standup(db)


async def risk_scan_job():
    from app.database.database import async_session
    from app.agents.risk_agent import RiskAgent

    async with async_session() as db:
        agent = RiskAgent()
        await agent.scan_for_risks(db)


async def health_check_job():
    from app.database.database import async_session
    from app.agents.project_manager import ProjectManagerAgent

    async with async_session() as db:
        agent = ProjectManagerAgent()
        await agent.monitor_all_projects(db)
