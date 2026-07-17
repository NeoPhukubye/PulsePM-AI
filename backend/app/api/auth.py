from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.database import get_db
from app.models.user import User, Company
from pydantic import BaseModel
from typing import Optional
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import httpx
import os

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "projectpulse-secret-key-change-in-production")
ALGORITHM = "HS256"

# OAuth Config
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "demo_github_client_id")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "demo_github_client_secret")
GITLAB_CLIENT_ID = os.getenv("GITLAB_CLIENT_ID", "demo_gitlab_client_id")
GITLAB_CLIENT_SECRET = os.getenv("GITLAB_CLIENT_SECRET", "demo_gitlab_client_secret")
GITLAB_URL = os.getenv("GITLAB_URL", "https://gitlab.com")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def create_token(user_id: int, email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode({"sub": str(user_id), "email": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


class CompanyRegister(BaseModel):
    company_name: str
    admin_name: str
    admin_email: str
    password: str


class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    company_id: Optional[int] = None
    role: Optional[str] = "member"


class UserLogin(BaseModel):
    email: str
    password: str


class NotificationPreferences(BaseModel):
    notify_project_behind: bool = True
    notify_risk_critical: bool = True
    notify_daily_standup: bool = False
    notify_weekly_report: bool = True


class SubscribeProject(BaseModel):
    project_id: int
    notify_behind: bool = True
    notify_blocked: bool = True
    notify_budget: bool = True


# --- Standard Auth ---

@router.post("/register/company")
async def register_company(data: CompanyRegister, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == data.admin_email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    company = Company(name=data.company_name, domain=data.admin_email.split("@")[1])
    db.add(company)
    await db.flush()

    user = User(
        email=data.admin_email, name=data.admin_name,
        password_hash=pwd_context.hash(data.password),
        role="admin", company_id=company.id,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return {
        "message": "Company registered successfully",
        "user_id": user.id, "company_id": company.id,
        "token": create_token(user.id, user.email),
    }


@router.post("/register")
async def register_user(data: UserRegister, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email, name=data.name,
        password_hash=pwd_context.hash(data.password),
        role=data.role, company_id=data.company_id,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return {"message": "Registration successful", "user_id": user.id, "token": create_token(user.id, user.email)}


@router.post("/login")
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "user_id": user.id, "name": user.name, "email": user.email,
        "role": user.role, "company_id": user.company_id,
        "token": create_token(user.id, user.email),
        "github_token": user.github_token or None,
        "gitlab_token": user.gitlab_token or None,
        "notifications": {
            "notify_project_behind": user.notify_project_behind,
            "notify_risk_critical": user.notify_risk_critical,
            "notify_daily_standup": user.notify_daily_standup,
            "notify_weekly_report": user.notify_weekly_report,
        },
    }


# --- GitHub OAuth ---

@router.get("/github/login")
async def github_login():
    scope = "user:email,repo,read:org"
    return {
        "url": f"https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}&scope={scope}&redirect_uri={FRONTEND_URL}/auth/github/callback"
    }


@router.post("/github/callback")
async def github_callback(code: str, db: AsyncSession = Depends(get_db)):
    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )
        token_data = token_res.json()

    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="GitHub authentication failed")

    # Get user info
    async with httpx.AsyncClient() as client:
        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"token {access_token}"},
        )
        github_user = user_res.json()

        # Get primary email
        email_res = await client.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"token {access_token}"},
        )
        emails = email_res.json()
        primary_email = next((e["email"] for e in emails if e.get("primary")), github_user.get("email"))

    if not primary_email:
        raise HTTPException(status_code=400, detail="Could not retrieve email from GitHub")

    # Find or create user
    result = await db.execute(select(User).where(User.email == primary_email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=primary_email,
            name=github_user.get("name") or github_user.get("login"),
            password_hash=pwd_context.hash(access_token[:16]),
            role="member",
            github_token=access_token,
            avatar_url=github_user.get("avatar_url"),
            oauth_provider="github",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        user.github_token = access_token
        user.avatar_url = github_user.get("avatar_url")
        await db.commit()

    return {
        "message": "GitHub login successful",
        "user_id": user.id, "name": user.name, "email": user.email,
        "token": create_token(user.id, user.email),
        "github_token": access_token,
        "avatar_url": user.avatar_url,
    }


# --- GitLab OAuth ---

@router.get("/gitlab/login")
async def gitlab_login():
    scope = "read_user+read_api+read_repository"
    return {
        "url": f"{GITLAB_URL}/oauth/authorize?client_id={GITLAB_CLIENT_ID}&redirect_uri={FRONTEND_URL}/auth/gitlab/callback&response_type=code&scope={scope}"
    }


@router.post("/gitlab/callback")
async def gitlab_callback(code: str, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            f"{GITLAB_URL}/oauth/token",
            json={
                "client_id": GITLAB_CLIENT_ID,
                "client_secret": GITLAB_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": f"{FRONTEND_URL}/auth/gitlab/callback",
            },
        )
        token_data = token_res.json()

    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="GitLab authentication failed")

    async with httpx.AsyncClient() as client:
        user_res = await client.get(
            f"{GITLAB_URL}/api/v4/user",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        gitlab_user = user_res.json()

    email = gitlab_user.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Could not retrieve email from GitLab")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=email,
            name=gitlab_user.get("name") or gitlab_user.get("username"),
            password_hash=pwd_context.hash(access_token[:16]),
            role="member",
            gitlab_token=access_token,
            avatar_url=gitlab_user.get("avatar_url"),
            oauth_provider="gitlab",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        user.gitlab_token = access_token
        user.avatar_url = gitlab_user.get("avatar_url")
        await db.commit()

    return {
        "message": "GitLab login successful",
        "user_id": user.id, "name": user.name, "email": user.email,
        "token": create_token(user.id, user.email),
        "gitlab_token": access_token,
        "avatar_url": user.avatar_url,
    }


# --- Fetch Repos ---

@router.get("/github/repos")
async def get_github_repos(token: str = Query(...)):
    repos = []
    page = 1
    async with httpx.AsyncClient() as client:
        while True:
            res = await client.get(
                "https://api.github.com/user/repos",
                headers={"Authorization": f"token {token}"},
                params={"per_page": 100, "page": page, "sort": "updated"},
            )
            batch = res.json()
            if not batch or not isinstance(batch, list):
                break
            repos.extend(batch)
            if len(batch) < 100:
                break
            page += 1

    return [{
        "id": r["id"],
        "name": r["name"],
        "full_name": r["full_name"],
        "description": r.get("description") or "",
        "language": r.get("language") or "Unknown",
        "stars": r.get("stargazers_count", 0),
        "open_issues": r.get("open_issues_count", 0),
        "updated_at": r.get("updated_at"),
        "private": r.get("private", False),
        "url": r.get("html_url"),
        "default_branch": r.get("default_branch", "main"),
    } for r in repos]


@router.get("/gitlab/repos")
async def get_gitlab_repos(token: str = Query(...)):
    repos = []
    page = 1
    async with httpx.AsyncClient() as client:
        while True:
            res = await client.get(
                f"{GITLAB_URL}/api/v4/projects",
                headers={"Authorization": f"Bearer {token}"},
                params={"per_page": 100, "page": page, "membership": True, "order_by": "last_activity_at"},
            )
            batch = res.json()
            if not batch or not isinstance(batch, list):
                break
            repos.extend(batch)
            if len(batch) < 100:
                break
            page += 1

    return [{
        "id": r["id"],
        "name": r["name"],
        "full_name": r.get("path_with_namespace", r["name"]),
        "description": r.get("description") or "",
        "language": "",
        "stars": r.get("star_count", 0),
        "open_issues": r.get("open_issues_count", 0),
        "updated_at": r.get("last_activity_at"),
        "private": r.get("visibility") == "private",
        "url": r.get("web_url"),
        "default_branch": r.get("default_branch", "main"),
    } for r in repos]


# --- Import Repos as Projects ---

class ImportReposRequest(BaseModel):
    repos: list[dict]
    provider: str  # github or gitlab
    token: str


@router.post("/import/repos")
async def import_repos(data: ImportReposRequest, db: AsyncSession = Depends(get_db)):
    from app.models.project import Project
    from app.models.task import Task

    imported = []
    for repo in data.repos:
        project = Project(
            name=repo["name"],
            description=repo.get("description", "") or f"Imported from {data.provider}: {repo.get('full_name', '')}",
            status="active",
            health_score=85.0,
            completion=0.0,
        )
        db.add(project)
        await db.flush()

        # Import open issues as tasks
        issues = await _fetch_issues(repo, data.provider, data.token)
        for issue in issues[:50]:
            task = Task(
                project_id=project.id,
                title=issue["title"],
                description=issue.get("description", ""),
                status=_map_issue_status(issue),
                priority=_map_issue_priority(issue),
                assignee=issue.get("assignee"),
                story_points=_estimate_points(issue),
            )
            db.add(task)

        imported.append({"project_id": project.id, "name": repo["name"], "issues_imported": len(issues[:50])})

    await db.commit()
    return {"imported": imported, "total_projects": len(imported)}


async def _fetch_issues(repo: dict, provider: str, token: str) -> list:
    async with httpx.AsyncClient() as client:
        if provider == "github":
            res = await client.get(
                f"https://api.github.com/repos/{repo['full_name']}/issues",
                headers={"Authorization": f"token {token}"},
                params={"state": "open", "per_page": 50},
            )
            issues = res.json() if res.status_code == 200 else []
            return [{
                "title": i.get("title", ""),
                "description": i.get("body", ""),
                "status": "in_progress" if any(l["name"].lower() in ("in progress", "wip") for l in i.get("labels", [])) else "todo",
                "priority": "high" if any(l["name"].lower() in ("priority: high", "critical", "urgent", "bug") for l in i.get("labels", [])) else "medium",
                "assignee": i.get("assignee", {}).get("login") if i.get("assignee") else None,
                "labels": [l["name"] for l in i.get("labels", [])],
            } for i in issues if not i.get("pull_request")]
        else:
            res = await client.get(
                f"{GITLAB_URL}/api/v4/projects/{repo['id']}/issues",
                headers={"Authorization": f"Bearer {token}"},
                params={"state": "opened", "per_page": 50},
            )
            issues = res.json() if res.status_code == 200 else []
            return [{
                "title": i.get("title", ""),
                "description": i.get("description", ""),
                "status": "in_progress" if i.get("state") == "opened" and i.get("assignee") else "todo",
                "priority": "high" if any(l in ("priority::high", "critical", "bug") for l in i.get("labels", [])) else "medium",
                "assignee": i.get("assignee", {}).get("username") if i.get("assignee") else None,
                "labels": i.get("labels", []),
            } for i in issues]


def _map_issue_status(issue: dict) -> str:
    return issue.get("status", "todo")


def _map_issue_priority(issue: dict) -> str:
    return issue.get("priority", "medium")


def _estimate_points(issue: dict) -> int:
    priority_map = {"critical": 13, "high": 8, "medium": 5, "low": 3}
    return priority_map.get(issue.get("priority", "medium"), 5)


# --- Notification Preferences ---

@router.put("/notifications/{user_id}")
async def update_notifications(user_id: int, prefs: NotificationPreferences, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.notify_project_behind = prefs.notify_project_behind
    user.notify_risk_critical = prefs.notify_risk_critical
    user.notify_daily_standup = prefs.notify_daily_standup
    user.notify_weekly_report = prefs.notify_weekly_report
    await db.commit()
    return {"message": "Notification preferences updated"}


@router.post("/subscribe")
async def subscribe_to_project(data: SubscribeProject, user_id: int = 1, db: AsyncSession = Depends(get_db)):
    from app.models.user import ProjectSubscription
    sub = ProjectSubscription(
        user_id=user_id, project_id=data.project_id,
        notify_behind=data.notify_behind, notify_blocked=data.notify_blocked, notify_budget=data.notify_budget,
    )
    db.add(sub)
    await db.commit()
    return {"message": f"Subscribed to project {data.project_id} notifications"}
