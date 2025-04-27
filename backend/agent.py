import requests
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from dotenv import load_dotenv
import os
import json
import re
import urllib.parse
from datetime import datetime

load_dotenv()
# Initialize your chat LLM
chat_model = ChatOpenAI(model="gpt-4.1-nano", temperature=0.3)

# Helper to get a JWT session token from Herkey
def get_herkey_token() -> str:
    """Get a JWT session token from Herkey API."""
    resp = requests.get(
        "https://api-prod.herkey.com/api/v1/herkey/generate-session"
    )
    resp.raise_for_status()
    return resp.json()["body"]["session_id"]

# Job search function - extracts parameters from a query
def extract_job_search_params(query: str, conversation_history=None) -> dict:
    """
    Extract job search parameters from a natural language query.
    Returns a dictionary of parameters for the Herkey API.
    
    Args:
        query (str): The user's current query/message
        conversation_history (list, optional): Previous conversations in chronological order
    """
    system_prompt = """
    You are a job search parameter extractor for the Herkey API.
    Extract job search parameters from the user's query and return them in a JSON format.
    
    Parameters to extract:  
    - page_no: Always set to 1 for initial search
    - page_size: Always set to 15 for initial search
    - work_mode: One of ["work_from_home", "work_from_office", "hybrid", "freelance"] or omit if not specified
    - job_types: One of ["full_time", "freelance", "part_time", "returnee_program", "volunteer"] or omit if not specified
    - location_name: The city or location mentioned, or omit if not specified
    - keyword: The job title, role, skills, or keywords mentioned (ALWAYS include this and make it as specific as possible)
    - job_skills: Specific skills mentioned by the user, use comma-separated values
    - is_global_query: Always set to "false"
    
    IMPORTANT: 
    1. Be very specific with the 'keyword' parameter. This is the most important parameter for finding relevant jobs.
    2. Include all job titles, roles, and skill areas mentioned in the query.
    3. For general queries like "find me a job", use broader terms based on context or previous user messages.
    4. Include exact technical skills mentioned (e.g., Python, SQL, React) in both keyword and job_skills parameters.
    5. Consider the conversation history for additional context when extracting parameters.
    
    Omit any parameter that is not clearly specified in the query, except for page_no, page_size, and is_global_query.
    
    Return ONLY the JSON object with no additional text, explanations, or markdown formatting.
    """
    
    messages = [
        SystemMessage(content=system_prompt),
    ]
    
    # Add conversation history context if available
    if conversation_history and len(conversation_history) > 0:
        context = "Previous messages (in chronological order):\n"
        # The history is already in chronological order from oldest to newest
        # Include the last 3 messages for context
        recent_history = conversation_history[-3:] if len(conversation_history) > 3 else conversation_history
        
        for convo in recent_history:
            user_message = convo.get("message", "")
            bot_response = convo.get("response", {}).get("text", "")
            if user_message:
                context += f"User: {user_message}\n"
            if bot_response:
                context += f"Assistant: {bot_response}\n"
        
        context += "\nCurrent query:\n"
        messages.append(HumanMessage(content=f"{context}{query}"))
    else:
        messages.append(HumanMessage(content=query))
    
    response = chat_model(messages)
    content = response.content.strip()
    
    # Extract JSON from the response if it's wrapped in code fences
    if content.startswith("```") and content.endswith("```"):
        content = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", content).group(1)
    
    try:
        params = json.loads(content)
        # Set default values if not present
        params.setdefault("page_no", 1)
        params.setdefault("page_size", 15)
        params.setdefault("is_global_query", "false")
        
        # Ensure keyword is set and fallback if not provided
        if "keyword" not in params or params["keyword"].strip() == "":
            params["keyword"] = query.strip()
        
        # Clean up parameters - remove any/all values
        for key in list(params.keys()):
            if params[key] == "any" or params[key] == "all" or (isinstance(params[key], str) and params[key].strip() == ""):
                del params[key]
        
        return params
    except json.JSONDecodeError:
        # If JSON parsing fails, return basic parameters with query as keyword
        return {
            "page_no": 1,
            "page_size": 15,
            "keyword": query.strip(),
            "is_global_query": "false"
        }

# Get job search results from the Herkey API
def get_job_search_results(params: dict) -> dict:
    """
    Search for jobs on the Herkey API with the given parameters.
    Returns a dictionary with the search results.
    """
    token = get_herkey_token()
    headers = {"Authorization": f"Token {token}"}
    
    try:
        resp = requests.get(
            "https://api-prod.herkey.com/api/v1/herkey/jobs/es_candidate_jobs",
            params=params,
            headers=headers,
        )
        resp.raise_for_status()
        response_data = resp.json()
        
        # Filter out expired jobs
        if response_data.get("body"):
            current_date = datetime.now()
            valid_jobs = []
            
            for job in response_data["body"]:
                # If job has an expires_on field, check if it's still valid
                if "expires_on" in job:
                    try:
                        expiry_date = datetime.strptime(job["expires_on"], "%Y-%m-%d %H:%M:%S")
                        if expiry_date > current_date:
                            valid_jobs.append(job)
                    except (ValueError, TypeError):
                        # If date parsing fails, include the job anyway
                        valid_jobs.append(job)
                else:
                    # If no expiry date, include the job
                    valid_jobs.append(job)
            
            response_data["body"] = valid_jobs
            
        return response_data
    except Exception as e:
        return {"error": f"Error searching for jobs: {str(e)}"}

# Generate a roadmap for a given topic
def generate_roadmap(topic: str, conversation_history=None) -> list:
    """
    Generate a structured learning roadmap for the given topic.
    Returns a list of roadmap items.
    The roadmap should address one of these three user personas:
   
    1. FRESHERS: Women just beginning their career, seeking guidance on entry-level positions and early career development
    2. RISERS: Women with 3-8 years of experience looking to advance to leadership positions
    3. REJOINERS: Women returning to the workforce after a career break (maternity, caregiving, etc.)
   
    
    Args:
        topic (str): The topic to generate a roadmap for
        conversation_history (list, optional): Previous conversations in chronological order
    """
    system_prompt = """
    Create a detailed learning roadmap for the given topic. The roadmap should have 
    5-10 well-structured steps that progress from beginner to advanced level.
    
    For each step in the roadmap, provide:
    1. A clear title
    2. A short but meaningful description (1-2 sentences)
    3. A fictional but plausible URL for resources (starting with https://)
    
    Format your response as a JSON array where each item has the keys:
    - title: The name of the step
    - description: A brief explanation
    - link: A URL to learn more
    
    Example:
    [
      {
        "title": "Getting Started with Python",
        "description": "Learn the basic syntax and concepts of Python programming",
        "link": "https://example.com/python-basics"
      },
      {
        "title": "Data Structures",
        "description": "Master lists, dictionaries, sets, and tuples in Python",
        "link": "https://example.com/python-data-structures"
      }
    ]
    
    Return ONLY the JSON array without any additional text, explanations, or markdown formatting.
    """
    
    messages = [
        SystemMessage(content=system_prompt),
    ]
    
    # Add conversation history context if available
    if conversation_history and len(conversation_history) > 0:
        context = "Previous messages (in chronological order):\n"
        # The history is already in chronological order from oldest to newest
        # Include the last 2 messages for context
        recent_history = conversation_history[-2:] if len(conversation_history) > 2 else conversation_history
        
        for convo in recent_history:
            user_message = convo.get("message", "")
            if user_message:
                context += f"User: {user_message}\n"
        
        context += "\nCurrent request:\n"
        messages.append(HumanMessage(content=f"{context}Create a learning roadmap for: {topic}"))
    else:
        messages.append(HumanMessage(content=f"Create a learning roadmap for: {topic}"))
    
    response = chat_model(messages)
    content = response.content.strip()
    
    # Extract JSON from the response if it's wrapped in code fences
    if content.startswith("```") and content.endswith("```"):
        content = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", content).group(1)
    
    try:
        roadmap = json.loads(content)
        return roadmap
    except json.JSONDecodeError:
        # If parsing fails, return a simple error roadmap
        return [
            {
                "title": "Error Creating Roadmap",
                "description": f"We couldn't create a roadmap for '{topic}'. Please try a different topic.",
                "link": "https://example.com/error"
            }
        ]

# Classify user query
def classify_query(query: str) -> str:
    """
    Classify the user query as job_search, roadmap, or normal_text.
    """
    system_prompt = """
    Classify the user's query into one of these three categories:
    1. job_search - If the user is looking for job listings, opportunities, or asking about positions
    2. roadmap - If the user is asking for a learning path, career progression steps, or a roadmap for a topic
    3. normal_text - For general questions, greetings, or anything else
    4. events - If the user is asking about events, workshops, or meetups
    
    Respond with only one of these three words: job_search, roadmap, or normal_text
    """
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=query)
    ]
    
    response = chat_model(messages)
    classification = response.content.strip().lower()
    
    # Ensure we only return one of the valid categories
    if classification not in ["job_search", "roadmap", "normal_text","events"]:
        # Default to normal_text if classification is unclear
        classification = "normal_text"
    
    return classification

# Generate a text response for normal conversation
def generate_text_response(query: str, conversation_history=None) -> str:
    """
    Generate a conversational response for general inquiries.
    
    Args:
        query (str): The user's current query/message
        conversation_history (list, optional): Previous conversations in chronological order
    """
    system_prompt = """
    You are a helpful assistant for job seekers and career advancers.
    Respond in a friendly, concise manner. Keep responses brief and focused.
    If the user seems to be asking about jobs or careers but not requesting specific listings,
    suggest they can ask for job listings or a career roadmap.
    
    Use the conversation history to provide more personalized and contextually relevant responses.
    Refer to previous information that the user has shared when appropriate.
    """
    
    messages = [
        SystemMessage(content=system_prompt),
    ]
    
    # Add conversation history context if available
    if conversation_history and len(conversation_history) > 0:
        context = "Previous messages (in chronological order):\n"
        # The history is already in chronological order from oldest to newest
        # Include the last 3 messages for context
        recent_history = conversation_history[-3:] if len(conversation_history) > 3 else conversation_history
        
        for convo in recent_history:
            user_message = convo.get("message", "")
            bot_response = convo.get("response", {}).get("text", "")
            if user_message:
                context += f"User: {user_message}\n"
            if bot_response:
                context += f"Assistant: {bot_response}\n"
        
        context += "\nCurrent query:\n"
        messages.append(HumanMessage(content=f"{context}{query}"))
    else:
        messages.append(HumanMessage(content=query))
    
    response = chat_model(messages)
    return response.content.strip()

# Format the response for the frontend
def format_response(query_type: str, query: str, result) -> dict:
    """
    Format the response based on the query type.
    Returns a dictionary in the format expected by the frontend.
    """
    if query_type == "job_search":
        # Job search response
        job_params = result
        
        # Get fresh token for job API
        token = get_herkey_token()
        
        # Create query string for job_link
        query_string = urllib.parse.urlencode(job_params)
        base_url = "https://api-prod.herkey.com/api/v1/herkey/jobs/es_candidate_jobs"
        job_link = f"{base_url}?{query_string}"
        
        # Actually fetch the job search results here
        jobs_data = get_job_search_results(job_params)
        job_count = len(jobs_data.get("body", []))
        
        # Create a more human-like response based on the search parameters
        location = job_params.get("location_name", "")
        role = job_params.get("keyword", "jobs")
        
        # Create a natural language response based on search results
        if job_count > 0:
            if location:
                response_text = f"I found {job_count} {role} opportunities in {location}! Here are some matches that might interest you."
            else:
                response_text = f"Great news! I found {job_count} relevant {role} openings that match your criteria."
        else:
            if location:
                response_text = f"I couldn't find any {role} opportunities in {location} at the moment."
            else:
                response_text = f"I couldn't find exact matches for '{role}'"
        
        return {
            "text": response_text,
            "canvasType": "job_search",
            "canvasUtils": {
                "param": job_params,
                "job_link": job_link,
                "job_api": token,  # Include the actual token value
                "job_results": jobs_data.get("body", [])  # Include actual job results
            }
        }
    
    elif query_type == "roadmap":
        # Roadmap response
        roadmap_items = result
        
        return {
            "text": f"Generated this roadmap for you.",
            "canvasType": "roadmap",
            "canvasUtils": {
                "roadmap": roadmap_items
            }
        }
    elif query_type == "events":
        # Events response
        
        session_link,session_api=get_events_links()
        
        
        return {
            "text": "I can help you find events or workshops related to your query. Please provide more details.",
            "canvasType": "sessions",
            "canvasUtils": {
                "session_link":session_link,
                "session_api":session_api# Placeholder for events data
            }
        }
        
    else:
        # Normal text response
        return {
            "text": result,
            "canvasType": "none",
            "canvasUtils": {}
        }

def run_agent(prompt: str, conversation_history=None) -> dict:
    """
    Process a user prompt and return an appropriate response.
    Returns a dictionary in the format expected by the frontend.
    
    Args:
        prompt (str): The user's current query/message
        conversation_history (list, optional): Previous conversation messages for context
    """
    # Step 1: Classify the query
    query_type = classify_query(prompt)
    
    # Step 2: Handle based on classification
    if query_type == "job_search":
        # Handle job search
        job_params = extract_job_search_params(prompt, conversation_history)
        return format_response(query_type, prompt, job_params)
    
    elif query_type == "roadmap":
        # Handle roadmap
        roadmap_items = generate_roadmap(prompt, conversation_history)
        return format_response(query_type, prompt, roadmap_items)
    
    else:
        # Handle normal text
        text_response = generate_text_response(prompt, conversation_history)
        return format_response(query_type, prompt, text_response)

def get_events_links():
    """
    Get the session link and API token for events.
    Returns a tuple of (session_link, session_api).
    """
    # Placeholder for actual implementation to get events links
    # For now, return dummy values
    session_link = "https://api-prod.herkey.com/api/v1/herkey/sessions/get-session-widgets?category=Featured"
    session_api = get_herkey_token()
    
    return session_link, session_api


# Example usage
if __name__ == "__main__":
    # Test job search
    print(json.dumps(run_agent("Find me data science jobs in Mumbai"), indent=2))
    
    # Test roadmap
    print(json.dumps(run_agent("Can you give me a roadmap to learn machine learning?"), indent=2))
    
    # Test normal text
    print(json.dumps(run_agent("Hello, how are you today?"), indent=2))
