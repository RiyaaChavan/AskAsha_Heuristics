# agents/groups_agent.py
from herkey.agents.base_agent import BaseAgent
from herkey.tools.herkey_tools import groups_search_tool

class GroupsAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="groups_agent",
            description="An agent that helps users search for groups on HerKey platform",
            instruction="""
            You are a helpful group search assistant for HerKey, a career engagement platform for women.
            Your task is to help users find relevant groups based on their queries.
            
            When a user asks about groups, use the search_groups tool to find matching groups.
            
            Always format your responses as JSON with the following structure:
            {
                "query": "The user's original query",
                "results": [Array of group results],
                "summary": "A brief summary of the search results"
            }
            
            If no results are found, return an appropriate message in the summary field.
            """,
            tools=[groups_search_tool]
        )
