# ProjectPulse AI

**AI-Powered Multi-Agent Project Management Platform**

> 6 autonomous AI agents work together in real-time to monitor your projects, predict risks, generate standups, and deliver executive insights — so you can manage by exception, not by micromanagement.

---

## The Problem

Project managers spend 60% of their time on status updates, risk tracking, and report generation. Teams lose days to blockers that could have been predicted. Executives make decisions on stale data.

## The Solution

ProjectPulse AI deploys a team of specialized AI agents that continuously monitor your portfolio, communicate with each other, and surface only what needs human attention.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Tailwind)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │Dashboard │ │ Projects │ │Analytics │ │  AI Command Center│  │
│  │  Health  │ │  Cards   │ │  Charts  │ │  (Natural Lang)   │  │
│  │  Gauges  │ │  Status  │ │  Heatmap │ │  Agent Visibility │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
│                         ▲ WebSocket (Live Alerts)                │
└─────────────────────────┼───────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────┐
│                    FASTAPI BACKEND                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              AI AGENT ORCHESTRATION LAYER                │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │    │
│  │  │ Project │  │  Risk   │  │Standup  │  │Planning │  │    │
│  │  │ Manager │◄─┤  Agent  │◄─┤  Agent  │  │  Agent  │  │    │
│  │  │  Agent  │  │         │  │         │  │         │  │    │
│  │  └────┬────┘  └────┬────┘  └─────────┘  └────┬────┘  │    │
│  │       │             │                          │        │    │
│  │       ▼             ▼                          ▼        │    │
│  │  ┌─────────┐  ┌─────────┐              ┌─────────┐    │    │
│  │  │Executive│  │Reporting│              │   LLM   │    │    │
│  │  │  Agent  │  │  Agent  │              │ Service │    │    │
│  │  └─────────┘  └─────────┘              └─────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│  │   Jira    │  │  GitHub   │  │   Slack   │  │ Scheduler │   │
│  │  Service  │  │  Service  │  │  Service  │  │  (Cron)   │   │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │
└──────────────────────────────┼──────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                    DATABASE (PostgreSQL / SQLite)                 │
│  Projects │ Teams │ Sprints │ Tasks │ Risks │ Reports            │
└─────────────────────────────────────────────────────────────────┘
```

---

## AI Agents

| Agent | Role | Trigger |
|-------|------|---------|
| **Project Manager** | Monitors all projects, tracks health/budget/progress | Continuous |
| **Risk Agent** | Detects blockers, velocity drops, budget overruns | Every 4 hours |
| **Standup Agent** | Generates daily standup with yesterday/today/blockers | Daily at 9 AM |
| **Planning Agent** | Recommends sprint plans based on velocity & capacity | On demand |
| **Executive Agent** | Creates portfolio-level reports for leadership | On demand |
| **Reporting Agent** | Generates sprint reviews and performance reports | On demand |

### Multi-Agent Orchestration

Agents communicate and trigger each other:
- Risk Agent detects a problem → triggers Planning Agent for mitigation strategies
- Executive Agent compiles a report → queries Risk Agent for top concerns
- Standup Agent generates daily update → references Planning Agent's recommendations

The UI shows this orchestration in real-time, so users can see which agents are working on their query.

---

## Key Features

- **Real-time WebSocket Alerts** — Live push notifications for risks as they're detected
- **Natural Language Commands** — "Reassign auth to Sarah", "What's at risk?", "Predict delivery"
- **Agent Orchestration Visibility** — See which AI agents are working and what they're doing
- **Animated Health Gauges** — Instant visual portfolio status
- **Risk Heatmap** — 5x5 grid showing risk categories across projects
- **Velocity & Burndown Charts** — Sprint performance tracking
- **Automatic Standup Generation** — AI writes your daily standup from task data
- **Executive Reports** — One-click portfolio summary for leadership
- **Multi-Project Comparison** — AI compares projects and tells you where to focus

---

## Quick Start

### No database required — runs with SQLite out of the box!

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

The app auto-seeds with realistic demo data on first start.

### With Docker

```bash
docker-compose up --build
```

Open `http://localhost:3000`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons |
| Backend | FastAPI, SQLAlchemy (async), WebSockets |
| AI | OpenAI GPT-4, Multi-agent architecture |
| Database | PostgreSQL (prod) / SQLite (demo) |
| Integrations | Jira, GitHub, Slack |
| Deployment | Docker, Render |

---

## Demo Walkthrough

1. **Dashboard** — See all 6 projects with animated health gauges, live alerts streaming in via WebSocket
2. **AI Chat** — Ask "What's at risk?" and watch the Risk Agent + Planning Agent work together
3. **Analytics** — View velocity trends, burndown, and the risk heatmap identifying Project Gamma as critical
4. **Reports** — Generate an executive report that synthesizes data from all agents
5. **Natural Language** — Try "Generate today's standup" or "Which team is overloaded?"

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No* | OpenAI API key for GPT-4 agent responses |
| `DATABASE_URL` | No | PostgreSQL URL (defaults to SQLite) |
| `JIRA_BASE_URL` | No | Jira instance URL |
| `GITHUB_TOKEN` | No | GitHub API token |
| `SLACK_WEBHOOK_URL` | No | Slack webhook for notifications |

*Demo works without OpenAI key — agents use rule-based fallbacks.

---

## What Makes This Different

1. **Multi-Agent Collaboration** — Not just one AI, but 6 specialized agents that talk to each other
2. **Visible AI Thinking** — Users see agent orchestration in real-time (not a black box)
3. **Zero-Config Demo** — Works instantly with SQLite + seed data, no API keys needed
4. **Proactive, Not Reactive** — Agents continuously scan and alert before problems escalate
5. **Natural Language Actions** — Move beyond chat to actual project management commands

---

## License

MIT
