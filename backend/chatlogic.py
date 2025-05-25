import requests
import time
import urllib.parse
from agent import run_agent
from db import get_user_conversations
import google.generativeai as genai
# from google import genai
# from google.genai import types
from google.generativeai import types

# from backend.session import get_session_id


import os

from dotenv import load_dotenv
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)



def generate(USER_PROMPT,SYSTEM_PROMPT=None):
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    model = "gemini-2.0-flash-lite"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=USER_PROMPT),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=genai.types.Schema(
            type = genai.types.Type.OBJECT,
            properties = {
                "classification": genai.types.Schema(
                    type = genai.types.Type.STRING,
                    enum = ["job_search", "event_search", "generate_roadmap", "bias_detected"],
                ),
            },
        ),
    )

    return client.generate_content(
        model=model,
        contents=contents,
        generate_content_config=generate_content_config,
        system_prompt=SYSTEM_PROMPT,
    ).result





def get_session_id():
    """Get a session ID from HerKey API"""
    response = requests.get('https://api-prod.herkey.com/api/v1/herkey/generate-session')
    if response.status_code == 200:
        return response.json()['body']['session_id']
    return None

def chat_logic(message,user_id,is_authenticated,resume_data):
    has_resume_context = bool(resume_data and message and '@resume' in message)

    conversation_history = []
    if is_authenticated:
        conversation_history = get_user_conversations(user_id, limit=5)
        conversation_history.reverse()  # chronological order
      # If @resume is in the message and we have resume data, pass it to the agent    # Try to extract topic for better contextual responses
    topic = None
    try:
        from helper_funcs import extract_topic_from_query
        topic = extract_topic_from_query(message)
    except ImportError:
        # If extraction fails, continue without it
        pass
    
    
    
    
    if has_resume_context:
        
        message += f"""
        \n The user provided their resume data by referring to '@resume' in their message.
        \n Here is the resume data: {str(resume_data)}
        """
        
        response = run_agent(message, conversation_history, resume_data)
    else:
        response = run_agent(message, conversation_history)
      # Add timestamp to the response for proper ordering in frontend
    current_time = int(time.time() * 1000)  # Current time in milliseconds
    response["timestamp"] = current_time
    
    

    # Fix job search API integration
    if response.get('canvasType') == 'job_search':
        # Get a proper session ID from HerKey
        session_id = get_session_id()
        params = response.get('canvasUtils', {}).get('param', {})
        
        if session_id:
            # Ensure params is a dictionary
            if not params:
                params = {}
            
            # Add the session ID to the params
            # params['session_id'] = session_id
            
            # Update the params in the response
            if 'canvasUtils' not in response:
                response['canvasUtils'] = {}
            response['canvasUtils']['param'] = params
            
            # Build the correct job URL
            query_string = urllib.parse.urlencode(params)
            job_url = f"https://api-prod.herkey.com/api/v1/herkey/jobs/es_candidate_jobs?{query_string}"
            
            # Add both job_link and job_api to the response
            response['canvasUtils']['job_link'] = job_url
            response['canvasUtils']['job_api'] = session_id
            
            # Log the job URL for debugging
            print(f"Job API URL: {job_url}")
            print(f"Session ID: {session_id}")
            
            # Pre-fetch some jobs to verify the API is working
            try:
                headers = {'Content-Type': 'application/json','Authorization': f'Token {session_id}'}
                job_response = requests.get(job_url, headers=headers)
                
                if job_response.status_code == 200:
                    job_data = job_response.json()
                    # print(job_data)
                    job_count = job_data.get('pagination',{}).get('total_items', 0)
                    response['canvasUtils']['job_count'] = job_count
                    print(f"Successfully fetched {job_count} jobs from API")
                else:
                    print(f"Error fetching jobs: {job_response.status_code}")
                    print(job_response.text)
            except Exception as e:
                print(f"Exception when testing job API: {str(e)}")
    return response