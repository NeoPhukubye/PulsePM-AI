import os
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, ProjectSubscription
from app.models.project import Project


class EmailNotificationService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_pass = os.getenv("SMTP_PASS", "")
        self.from_email = os.getenv("FROM_EMAIL", "notifications@projectpulse.ai")
        self.sendgrid_key = os.getenv("SENDGRID_API_KEY", "")

    async def send_email(self, to_email: str, subject: str, html_body: str):
        if self.sendgrid_key:
            return await self._send_via_sendgrid(to_email, subject, html_body)
        # Log for demo mode
        print(f"[EMAIL] To: {to_email} | Subject: {subject}")
        return {"status": "sent_demo", "to": to_email, "subject": subject}

    async def _send_via_sendgrid(self, to_email: str, subject: str, html_body: str):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {self.sendgrid_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "personalizations": [{"to": [{"email": to_email}]}],
                    "from": {"email": self.from_email, "name": "ProjectPulse AI"},
                    "subject": subject,
                    "content": [{"type": "text/html", "value": html_body}],
                },
            )
            return {"status": response.status_code}

    async def notify_project_behind(self, db: AsyncSession, project_id: int, details: dict):
        project = (await db.execute(select(Project).where(Project.id == project_id))).scalar_one_or_none()
        if not project:
            return

        subs = (await db.execute(
            select(ProjectSubscription).where(
                ProjectSubscription.project_id == project_id,
                ProjectSubscription.notify_behind == True
            )
        )).scalars().all()

        user_ids = [s.user_id for s in subs]
        if not user_ids:
            users_result = await db.execute(select(User).where(User.notify_project_behind == True))
            users = users_result.scalars().all()
        else:
            users_result = await db.execute(select(User).where(User.id.in_(user_ids)))
            users = users_result.scalars().all()

        for user in users:
            html = self._build_project_behind_email(project, details, user.name)
            await self.send_email(
                user.email,
                f"⚠️ Alert: {project.name} is behind schedule",
                html
            )

        return {"notified": len(users), "project": project.name}

    async def notify_risk_critical(self, db: AsyncSession, alerts: list):
        users = (await db.execute(
            select(User).where(User.notify_risk_critical == True)
        )).scalars().all()

        for user in users:
            html = self._build_risk_alert_email(alerts, user.name)
            await self.send_email(
                user.email,
                f"🚨 Critical Risk Alert: {len(alerts)} issues detected",
                html
            )

        return {"notified": len(users), "alerts": len(alerts)}

    async def send_weekly_report(self, db: AsyncSession, report_data: dict):
        users = (await db.execute(
            select(User).where(User.notify_weekly_report == True)
        )).scalars().all()

        for user in users:
            html = self._build_weekly_report_email(report_data, user.name)
            await self.send_email(
                user.email,
                "📊 Weekly Portfolio Report - ProjectPulse AI",
                html
            )

        return {"notified": len(users)}

    def _build_project_behind_email(self, project, details: dict, user_name: str) -> str:
        return f"""
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #1e293b; border-radius: 12px; padding: 30px; color: #e2e8f0;">
                <h1 style="color: #f8fafc; margin: 0 0 10px;">⚠️ Project Behind Schedule</h1>
                <p style="color: #94a3b8;">Hi {user_name},</p>
                <div style="background: #334155; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h2 style="color: #f8fafc; margin: 0 0 15px;">{project.name}</h2>
                    <table style="width: 100%; color: #e2e8f0;">
                        <tr><td style="padding: 5px 0; color: #94a3b8;">Health Score</td><td style="text-align: right; font-weight: bold; color: {'#ef4444' if project.health_score < 50 else '#eab308'};">{project.health_score}%</td></tr>
                        <tr><td style="padding: 5px 0; color: #94a3b8;">Completion</td><td style="text-align: right; font-weight: bold;">{project.completion}%</td></tr>
                        <tr><td style="padding: 5px 0; color: #94a3b8;">Status</td><td style="text-align: right; font-weight: bold; color: #ef4444;">{project.status.upper()}</td></tr>
                    </table>
                </div>
                <p style="color: #94a3b8;">{details.get('message', 'This project requires immediate attention.')}</p>
                <p style="color: #94a3b8;">Recommendation: {details.get('recommendation', 'Review project scope and resource allocation.')}</p>
                <hr style="border: 1px solid #334155; margin: 20px 0;">
                <p style="color: #64748b; font-size: 12px;">ProjectPulse AI - Intelligent Project Management</p>
            </div>
        </div>"""

    def _build_risk_alert_email(self, alerts: list, user_name: str) -> str:
        alert_rows = ""
        for alert in alerts[:5]:
            color = "#ef4444" if alert.get("type") == "critical" else "#eab308"
            alert_rows += f"""
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #334155; color: {color}; font-weight: bold;">{alert.get('type', 'warning').upper()}</td>
                <td style="padding: 10px; border-bottom: 1px solid #334155; color: #e2e8f0;">{alert.get('project', 'Unknown')}</td>
                <td style="padding: 10px; border-bottom: 1px solid #334155; color: #94a3b8;">{alert.get('message', '')}</td>
            </tr>"""

        return f"""
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #1e293b; border-radius: 12px; padding: 30px; color: #e2e8f0;">
                <h1 style="color: #f8fafc; margin: 0 0 10px;">🚨 Critical Risk Alert</h1>
                <p style="color: #94a3b8;">Hi {user_name}, our AI agents detected {len(alerts)} risk(s) requiring attention:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr style="background: #334155;">
                        <th style="padding: 10px; text-align: left; color: #94a3b8;">Severity</th>
                        <th style="padding: 10px; text-align: left; color: #94a3b8;">Project</th>
                        <th style="padding: 10px; text-align: left; color: #94a3b8;">Issue</th>
                    </tr>
                    {alert_rows}
                </table>
                <p style="color: #94a3b8;">Log in to ProjectPulse AI to review detailed recommendations from our Planning Agent.</p>
                <hr style="border: 1px solid #334155; margin: 20px 0;">
                <p style="color: #64748b; font-size: 12px;">ProjectPulse AI - Intelligent Project Management</p>
            </div>
        </div>"""

    def _build_weekly_report_email(self, report_data: dict, user_name: str) -> str:
        return f"""
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #1e293b; border-radius: 12px; padding: 30px; color: #e2e8f0;">
                <h1 style="color: #f8fafc; margin: 0 0 10px;">📊 Weekly Portfolio Report</h1>
                <p style="color: #94a3b8;">Hi {user_name}, here's your weekly summary:</p>
                <div style="background: #334155; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: #94a3b8;">Overall Health</span>
                        <span style="color: #22c55e; font-weight: bold;">{report_data.get('overall_health', 87)}%</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: #94a3b8;">Projects On Track</span>
                        <span style="color: #f8fafc; font-weight: bold;">{report_data.get('healthy_projects', 4)}/{report_data.get('total_projects', 6)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: #94a3b8;">Active Risks</span>
                        <span style="color: #eab308; font-weight: bold;">{report_data.get('active_alerts', 5)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #94a3b8;">Forecast</span>
                        <span style="color: #f8fafc; font-weight: bold;">{report_data.get('forecast', 'On track')}</span>
                    </div>
                </div>
                <hr style="border: 1px solid #334155; margin: 20px 0;">
                <p style="color: #64748b; font-size: 12px;">ProjectPulse AI - Intelligent Project Management</p>
            </div>
        </div>"""
