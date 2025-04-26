# services/agent_service.py
import json
from herkey.agents.jobs_agent import JobsAgent
from herkey.agents.groups_agent import GroupsAgent
from herkey.agents.sessions_agent import SessionsAgent

class AgentService:
    def __init__(self):
        self.jobs_agent = JobsAgent()
        self.groups_agent = GroupsAgent()
        self.sessions_agent = SessionsAgent()
    
    async def process_query(self, query_data):
        """
        Process a user query by selecting the appropriate agent
        
        Args:
            query_data (dict): User query data containing the query and type
            
        Returns:
            dict: Agent response
        """
        try:
            query_text = query_data.get('query', '')
            query_type = query_data.get('type', 'jobs').lower()
            
            if query_type == 'jobs':
                response = await self.jobs_agent.process_query(query_text)
            elif query_type == 'groups':
                response = await self.groups_agent.process_query(query_text)
            elif query_type == 'sessions':
                response = await self.sessions_agent.process_query(query_text)
            else:
                return {
                    "status": "error",
                    "message": f"Invalid query type: {query_type}. Supported types are: jobs, groups, sessions",
                    "data": None
                }
            
            # Parse the response as JSON
            try:
                response_data = json.loads(response)
                return {
                    "status": "success",
                    "message": "Query processed successfully",
                    "data": response_data
                }
            except json.JSONDecodeError:
                # If the response is not valid JSON, return it as plain text
                return {
                    "status": "success",
                    "message": "Query processed successfully",
                    "data": {
                        "query": query_text,
                        "results": [],
                        "summary": response
                    }
                }
                
        except Exception as e:
            return {
                "status": "error",
                "message": f"Error processing query: {str(e)}",
                "data": None
            }