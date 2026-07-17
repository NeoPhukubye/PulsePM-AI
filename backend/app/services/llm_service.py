import os
from openai import AsyncOpenAI


class LLMService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))
        self.model = "gpt-4"

    async def generate(self, prompt: str) -> str:
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an AI project management assistant for ProjectPulse AI."},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=1000,
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"AI generation unavailable: {str(e)}"

    async def chat(self, message: str, db, project_id: int = None) -> str:
        context = ""
        if project_id:
            from app.agents.project_manager import ProjectManagerAgent
            agent = ProjectManagerAgent()
            status = await agent.get_project_status(db, project_id)
            context = f"Project context: {status}\n\n"

        prompt = f"""{context}User question: {message}

Provide a helpful, concise answer based on the project data available."""
        return await self.generate(prompt)

    async def get_suggestions(self, project_id: int, db) -> list:
        from app.agents.planning_agent import PlanningAgent
        agent = PlanningAgent()
        return await agent.get_recommendations(db, project_id)

    async def predict_delivery(self, project_id: int, db) -> dict:
        from app.agents.project_manager import ProjectManagerAgent
        agent = ProjectManagerAgent()
        status = await agent.get_project_status(db, project_id)

        if not status:
            return {"prediction": "No data available"}

        completion = status["completion"]
        prompt = f"""Based on this project status, predict the delivery timeline:
{status}

Provide: estimated_completion_date, confidence_level, risks_to_timeline"""
        prediction = await self.generate(prompt)
        return {"status": status, "prediction": prediction}
