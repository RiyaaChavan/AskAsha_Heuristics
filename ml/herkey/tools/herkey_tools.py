# tools/herkey_tools.py
from herkey.tools.api_client import HerkeyAPIClient

api_client = HerkeyAPIClient()

class Tool:
    """Simple Tool class to replace Google ADK Tool"""
    def __init__(self, name, description, function):
        self.name = name
        self.description = description
        self.function = function

def search_jobs_direct(params):
    """
    Search for jobs on HerKey platform with direct parameter passing
    
    Args:
        params (dict): Search parameters to pass directly to the API
            - page_no: Page number (default: 1)
            - page_size: Results per page (default: 10)
            - work_mode: Work mode (e.g., 'work_from_office', 'remote')
            - job_types: Job types (e.g., 'full_time', 'part_time')
            - job_skills: Skills required
            - location_name: Location name
            - keyword: Search keywords
            - is_global_query: Whether to search globally (default: False)
        
    Returns:
        dict: Search results with clickable links
    """
    # Ensure required parameters are present
    if not params.get('keyword') and not params.get('q'):
        if params.get('q'):
            params['keyword'] = params.get('q')
            del params['q']
        else:
            params['keyword'] = ""
    
    # Set defaults
    params.setdefault('page_no', 1)
    params.setdefault('page_size', 10)
    params.setdefault('is_global_query', False)
    
    # Call the API client to search for jobs
    results = api_client.search_jobs_with_params(params)
    return results

# Create a new tool for direct parameter passing
jobs_direct_tool = Tool(
    name="search_jobs_direct",
    description="Search for jobs on HerKey platform with direct parameter passing",
    function=search_jobs_direct
)

# Jobs Search Tool
def search_jobs(query):
    """
    Search for jobs on HerKey platform
    
    Args:
        query (str): Search query for jobs
        
    Returns:
        dict: Search results
    """
    # Parse the query to extract relevant parameters
    query_params = {
        "q": query,
        "limit": 10
    }
    
    # Call the API client to search for jobs
    results = api_client.search_jobs(query_params)
    return results

jobs_search_tool = Tool(
    name="search_jobs",
    description="Search for jobs on HerKey platform based on user query",
    function=search_jobs
)

# Groups Search Tool
def search_groups(query):
    """
    Search for groups on HerKey platform
    """
    query_params = {
        "q": query,
        "limit": 10
    }
    
    results = api_client.search_groups(query_params)
    return results

groups_search_tool = Tool(
    name="search_groups",
    description="Search for groups on HerKey platform based on user query",
    function=search_groups
)

# Sessions Search Tool
def search_sessions(query):
    """
    Search for sessions on HerKey platform
    """
    query_params = {
        "q": query,
        "limit": 10
    }
    
    results = api_client.search_sessions(query_params)
    return results

sessions_search_tool = Tool(
    name="search_sessions",
    description="Search for sessions on HerKey platform based on user query",
    function=search_sessions
)