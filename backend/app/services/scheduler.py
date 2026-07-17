from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()


def start_scheduler():
    scheduler.add_job(daily_standup_job, "cron", hour=9, minute=0)
    scheduler.add_job(risk_scan_job, "interval", hours=4)
    scheduler.add_job(health_check_job, "interval", hours=1)
    scheduler.add_job(weekly_report_job, "cron", day_of_week="mon", hour=8, minute=0)
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
    from app.services.email_service import EmailNotificationService

    async with async_session() as db:
        agent = RiskAgent()
        alerts = await agent.scan_for_risks(db)

        critical_alerts = [a for a in alerts if a.get("type") == "critical"]
        if critical_alerts:
            email_service = EmailNotificationService()
            await email_service.notify_risk_critical(db, critical_alerts)

        for alert in alerts:
            if "behind schedule" in alert.get("message", "").lower():
                from sqlalchemy import select
                from app.models.project import Project
                project = (await db.execute(
                    select(Project).where(Project.name == alert.get("project"))
                )).scalar_one_or_none()
                if project:
                    email_service = EmailNotificationService()
                    await email_service.notify_project_behind(db, project.id, alert)


async def health_check_job():
    from app.database.database import async_session
    from app.agents.project_manager import ProjectManagerAgent

    async with async_session() as db:
        agent = ProjectManagerAgent()
        await agent.monitor_all_projects(db)


async def weekly_report_job():
    from app.database.database import async_session
    from app.agents.executive_agent import ExecutiveAgent
    from app.services.email_service import EmailNotificationService

    async with async_session() as db:
        agent = ExecutiveAgent()
        report = await agent.generate_report(db)
        email_service = EmailNotificationService()
        await email_service.send_weekly_report(db, report)
