from app.services.llm_service import LLMService

class ForgeMindAgent:
    def __init__(self):
        self.llm = LLMService()

    async def generate_plan(self, project_description: str):
        """
        Generates a project plan using an LLM.
        """
        with open("app/prompts/forgemind.txt", "r") as f:
            prompt_template = f.read()
        
        prompt = prompt_template.format(project_description=project_description)
        
        plan = await self.llm.generate(prompt)
        
        return plan

