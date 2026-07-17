# ProjectPulse AI

AI-powered project management platform that uses intelligent agents to monitor projects, predict risks, automate standups, and provide executive insights.

## Features

- **Multi-Project Dashboard** — Track all projects simultaneously with health scores, velocity, and risk indicators
- **AI Agents** — Autonomous agents for project management, risk detection, standup generation, planning, and executive reporting
- **Live Alerts** — Real-time monitoring of sprint velocity, blockers, budget, and team workload
- **AI Chat** — Natural language interface for managers to query project status, predictions, and recommendations
- **Integration Ready** — Connects with Jira, GitHub, and Slack

## Architecture

- **Backend**: Python FastAPI with AI agent orchestration
- **Frontend**: React with real-time dashboards and charts
- **Database**: PostgreSQL
- **AI**: LLM-powered agents (OpenAI/Anthropic)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/projectpulse-ai.git
cd projectpulse-ai

# Start with Docker
docker-compose up --build

# Or run separately:

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## AI Agents

| Agent | Role |
|-------|------|
| Project Manager | Tracks deadlines, budget, sprint progress, resource allocation |
| Risk Agent | Monitors blocked tasks, missed deadlines, sprint slippage, scope creep |
| Standup Agent | Generates daily standup summaries with blockers and recommendations |
| Executive Agent | Creates high-level reports with health scores and forecasts |
| Planning Agent | Recommends task reassignment, sprint adjustments based on velocity |

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/projectpulse
OPENAI_API_KEY=your-key
JIRA_API_TOKEN=your-token
GITHUB_TOKEN=your-token
SLACK_WEBHOOK_URL=your-url
SECRET_KEY=your-secret
```

## License

MIT
