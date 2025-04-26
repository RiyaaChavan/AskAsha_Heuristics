# agents/base_agent.py
import json
from herkey.config.config import Config

class BaseAgent:
    def __init__(self, name, description, instruction, tools=None):
        self.name = name
        self.description = description
        self.instruction = instruction
        self.tools = tools or []
        
        # Simple session tracking
        self.user_id = f"user_{name}"
        self.session_id = f"session_{name}"
    
    def _extract_search_params(self, query):
        """Extract search parameters from a query"""
        return {
            "q": query,
            "limit": 10
        }
    
    def _extract_job_params(self, query):
        """Extract job search parameters from the query"""
        params = {
            'keyword': query,
            'page_no': 1,
            'page_size': 10,
            'is_global_query': True  # Changed to True for broader results
        }
        
        # Look for work mode preferences
        if any(term in query.lower() for term in ['remote', 'work from home', 'wfh']):
            params['work_mode'] = 'remote'
        elif any(term in query.lower() for term in ['office', 'on-site', 'onsite']):
            params['work_mode'] = 'work_from_office'
        
        # Look for job type preferences
        if any(term in query.lower() for term in ['full time', 'full-time']):
            params['job_types'] = 'full_time'
        elif any(term in query.lower() for term in ['part time', 'part-time']):
            params['job_types'] = 'part_time'
        elif any(term in query.lower() for term in ['contract', 'temporary']):
            params['job_types'] = 'contract'
        
        # Extract location if mentioned
        location_indicators = ['in', 'at', 'near', 'around']
        query_terms = query.lower().split()
        for idx, term in enumerate(query_terms):
            if term in location_indicators and idx < len(query_terms) - 1:
                # The word after the indicator might be a location
                possible_location = query_terms[idx + 1]
                if len(possible_location) > 2:  # Avoid short words
                    params['location_name'] = possible_location.capitalize()
        
        return params
    
    async def process_query(self, query):
        """Process a user query by executing the appropriate tool"""
        try:
            # For job searches, use the direct parameter passing approach
            if self.name == "jobs_agent" and len(self.tools) > 1:
                # Extract parameters from the query
                search_params = self._extract_job_params(query)
                print(f"Extracted parameters: {search_params}")
                
                # Use the direct tool (second tool)
                direct_tool = self.tools[1]
                tool_result = direct_tool.function(search_params)
                
                if tool_result and tool_result.get('status') == 'success' and tool_result.get('data'):
                    # Format API response with clickable links
                    api_response = tool_result['data']
                    
                    # Format as JSON with links
                    response_data = {
                        "query": query,
                        "results": api_response.get("jobs", []),
                        "total_count": api_response.get("total_jobs", 0),
                        "summary": f"Found {api_response.get('total_jobs', 0)} jobs matching your query."
                    }
                    
                    return json.dumps(response_data, indent=2)
                else:
                    # Return error message without generating fake data
                    error_msg = tool_result.get('message', 'No results found') if tool_result else 'Tool execution failed'
                    return json.dumps({
                        "query": query,
                        "results": [],
                        "summary": f"Error: {error_msg}. Please try again later."
                    }, indent=2)
            
            # For other agents (groups and sessions), try the standard search
            elif self.tools and len(self.tools) > 0:
                tool = self.tools[0]
                search_params = self._extract_search_params(query)
                
                # Execute the tool function with the query params
                tool_result = tool.function(search_params)
                
                if tool_result and tool_result.get('status') == 'success' and tool_result.get('data'):
                    # Format the successful API response
                    api_response = tool_result['data']
                    
                    # Extract items from the response
                    items = []
                    if isinstance(api_response, dict):
                        body = api_response.get('body', [])
                        if isinstance(body, list):
                            items = body
                    
                    # Format as JSON
                    response_data = {
                        "query": query,
                        "results": items,
                        "summary": f"Found {len(items)} results matching your query."
                    }
                    
                    return json.dumps(response_data, indent=2)
                else:
                    # Return error message without generating fake data
                    error_msg = tool_result.get('message', 'No results found') if tool_result else 'Tool execution failed'
                    return json.dumps({
                        "query": query,
                        "results": [],
                        "summary": f"Error: {error_msg}. Please try again later."
                    }, indent=2)
            
            # If no tools are available, return a clear error
            return json.dumps({
                "query": query,
                "results": [],
                "summary": "No tools available to process this type of query."
            }, indent=2)
            
        except Exception as e:
            print(f"Error in process_query: {str(e)}")
            return json.dumps({
                "query": query,
                "results": [],
                "summary": f"An unexpected error occurred while processing your query. Please try again later."
            }, indent=2)