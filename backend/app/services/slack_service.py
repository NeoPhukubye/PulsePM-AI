import httpx
import os


class SlackService:
    def __init__(self):
        self.webhook_url = os.getenv("SLACK_WEBHOOK_URL", "")

    async def send_alert(self, message: str, channel: str = None):
        if not self.webhook_url:
            return {"error": "Slack not configured"}

        payload = {"text": message}
        if channel:
            payload["channel"] = channel

        async with httpx.AsyncClient() as client:
            response = await client.post(self.webhook_url, json=payload)
            return {"status": response.status_code}

    async def send_standup(self, standup_data: dict):
        blocks = [
            {"type": "header", "text": {"type": "plain_text", "text": "Daily Standup Summary"}},
            {"type": "section", "text": {"type": "mrkdwn", "text": "*Yesterday:*\n" + "\n".join(f"• {t['title']}" for t in standup_data.get("yesterday", []))}},
            {"type": "section", "text": {"type": "mrkdwn", "text": "*Today's Focus:*\n" + "\n".join(f"• {t['title']}" for t in standup_data.get("today_focus", []))}},
            {"type": "section", "text": {"type": "mrkdwn", "text": "*Blockers:*\n" + "\n".join(f"• {t['title']}" for t in standup_data.get("blockers", []))}},
        ]

        async with httpx.AsyncClient() as client:
            response = await client.post(self.webhook_url, json={"blocks": blocks})
            return {"status": response.status_code}
