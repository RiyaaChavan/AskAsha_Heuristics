# agents/sessions_agent.py
from herkey.agents.base_agent import BaseAgent
from herkey.tools.herkey_tools import sessions_search_tool

class SessionsAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="sessions_agent",
            description="An agent that helps users search for sessions on HerKey platform",
            instruction="""
            You are a helpful session search assistant for HerKey, a career engagement platform for women.
            Your task is to help users find relevant sessions based on their queries.
            
            When a user asks about sessions, use the search_sessions tool to find matching sessions.
            
            Always format your responses as JSON with the following structure:
            {
                "query": "The user's original query",
                "results": [Array of session results],
                "summary": "A brief summary of the search results"
            }
            
            If no results are found, return an appropriate message in the summary field.
            """,
            tools=[sessions_search_tool]
        )
