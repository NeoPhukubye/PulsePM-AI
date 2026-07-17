import httpx
import os


class GitHubService:
    def __init__(self):
        self.token = os.getenv("GITHUB_TOKEN", "")
        self.base_url = "https://api.github.com"

    async def get_repo_activity(self, owner: str, repo: str):
        if not self.token:
            return {"error": "GitHub not configured"}

        headers = {"Authorization": f"token {self.token}"}
        async with httpx.AsyncClient() as client:
            commits = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/commits",
                headers=headers,
                params={"per_page": 10},
            )
            prs = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/pulls",
                headers=headers,
                params={"state": "open"},
            )
            return {
                "recent_commits": commits.json()[:5] if commits.status_code == 200 else [],
                "open_prs": len(prs.json()) if prs.status_code == 200 else 0,
            }

    async def get_open_prs(self, owner: str, repo: str):
        if not self.token:
            return []
        headers = {"Authorization": f"token {self.token}"}
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/pulls",
                headers=headers,
                params={"state": "open"},
            )
            return response.json() if response.status_code == 200 else []
