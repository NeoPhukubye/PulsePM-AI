import httpx
import os


class JiraService:
    def __init__(self):
        self.base_url = os.getenv("JIRA_BASE_URL", "")
        self.token = os.getenv("JIRA_API_TOKEN", "")
        self.email = os.getenv("JIRA_EMAIL", "")

    async def get_project_issues(self, project_key: str):
        if not self.base_url:
            return {"error": "Jira not configured"}

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/rest/api/3/search",
                params={"jql": f"project={project_key}"},
                auth=(self.email, self.token),
            )
            return response.json()

    async def get_sprint_tasks(self, board_id: int, sprint_id: int):
        if not self.base_url:
            return {"error": "Jira not configured"}

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/rest/agile/1.0/board/{board_id}/sprint/{sprint_id}/issue",
                auth=(self.email, self.token),
            )
            return response.json()

    async def sync_tasks(self, project_key: str):
        issues = await self.get_project_issues(project_key)
        if "error" in issues:
            return issues
        return {"synced": len(issues.get("issues", [])), "project": project_key}
