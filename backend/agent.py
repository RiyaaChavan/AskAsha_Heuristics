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
def extract_job_search_params(query: str, conversation_history=None, resume_data=None) -> dict:
    """
    Extract job search parameters from a natural language query.
    Returns a dictionary of parameters for the Herkey API.
    
    Args:
        query (str): The user's current query/message
        conversation_history (list, optional): Previous conversations in chronological order
        resume_data (dict, optional): User's resume data including skills and work experience
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
    6. If resume data is provided, incorporate those skills and work experiences into your search parameters.
    
    Omit any parameter that is not clearly specified in the query, except for page_no, page_size, and is_global_query.
    
    Return ONLY the JSON object with no additional text, explanations, or markdown formatting.
    """
    
    messages = [
        SystemMessage(content=system_prompt),
    ]
    
    # Prepare context with conversation history and resume data if available
    context = ""
    
    # Add resume data if available (when @resume tag is used)
    if resume_data:
        resume_context = "User's resume information(This is the information the user is requesting when they say @resume):\n"
        
        # Add skills from resume
        skills = resume_data.get('skills', [])
        if skills:
            resume_context += "Skills: " + ", ".join(skills) + "\n"
            
        # Add work experience from resume
        work_experience = resume_data.get('workExperience', [])
        if work_experience:
            resume_context += "Work Experience:\n"
            for exp in work_experience:
                company = exp.get('company', '')
                role = exp.get('role', '')
                description = exp.get('description', '')
                if company and role:
                    resume_context += f"- {role} at {company}\n"
                    if description:
                        resume_context += f"  Description: {description}\n"
        
        # Add education if available
        education = resume_data.get('education', [])
        if education:
            resume_context += "Education:\n"
            for edu in education:
                degree = edu.get('degree', '')
                institution = edu.get('institution', '')
                if degree and institution:
                    resume_context += f"- {degree} from {institution}\n"
        
        context += resume_context + "\n"
        # return context
    # Add conversation history context if available
    if conversation_history and len(conversation_history) > 0:
        context += "Previous messages (in chronological order):\n"
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
            # If we have resume skills, use them for the keyword
            if resume_data and resume_data.get('skills'):
                params["keyword"] = ", ".join(resume_data.get('skills', [])[:5])  # Use first 5 skills
            else:
                params["keyword"] = query.strip()
                
        # If we have resume skills but no job_skills were extracted, add them from the resume
        if resume_data and resume_data.get('skills') and ("job_skills" not in params or not params["job_skills"]):
            params["job_skills"] = ", ".join(resume_data.get('skills', []))
        
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
    """
    system_prompt = """
    Create a detailed learning roadmap for the user's requested topic. The roadmap must be practical, actionable, and include ONLY VERIFIED EXISTING resources.

    IMPORTANT ROADMAP STRUCTURE:
    1. Create 5-8 sequential PHASE-BASED roadmap steps that build progressively
    2. DO NOT use "Week 1", "Day 2" or ANY time-specific headers - use descriptive phase titles only
    3. DO NOT use day-specific language like "Monday", "Tuesday" in descriptions
    4. ADAPT THE TIMELINE to fit exactly within the user's requested timeframe
    5. Use headers like "Foundation Building", "Core Concepts", "Practical Application" instead

    FOR EACH ROADMAP STEP INCLUDE:
    - "title": Clear focus area based on user's topic (e.g., "Python Fundamentals: Data Types")
    - "description": Detailed guidance with:
        * Specific activities to complete (e.g., "Complete exercises on variables & data types")
        * Concrete topics with examples
        * Measurable milestones
        * Practical mini-projects to apply learning
        * DO NOT reference specific days of the week
        * If user specified a timeframe, portion activities accordingly (e.g., "Spend 25% of your time on...")
    - "link": ONLY verified working URLs to free or low-cost resources directly relevant to this phase
    - "calendar_event": A short description for calendar integration

    SPECIAL FOCUS FOR WOMEN IN THE WORKFORCE:
    - For WOMEN RETURNERS (after career break): Include confidence-building exercises, skills refreshers, return-to-work programs, and relevant communities. Focus on translating past experience to current market needs.
    - For WOMEN RESTARTING CAREERS: Emphasize transferable skills, flexible work options, and networking strategies. Include resources for balancing family responsibilities.
    - For WOMEN STARTING CAREERS: Focus on entry points, mentorship opportunities, and building professional presence. Include women-specific career development resources.
    - For WORKING MOTHERS: Highlight flexible learning options, time management, and resources that acknowledge family responsibilities.

    RESOURCE LINKS - MUST FOLLOW THESE RULES:
    1. USE ONLY these GUARANTEED working resources:
       - For women returners/restarting careers:
         * "https://www.returnship.com/resources"
         * "https://www.jobsforher.com/"
         * "https://www.womenreturners.com/returners/"
         * "https://www.themuse.com/advice/9-job-search-tips-for-women-returning-to-work"
         * "https://www.linkedin.com/learning/returning-to-work-after-a-career-break"
         * "https://www.indeed.com/career-advice/finding-a-job/resume-tips-women-returning-to-workforce"
       - For women starting careers:
         * "https://www.womenwhocode.com/resources"
         * "https://girlswhocode.com/programs"
         * "https://www.hiretechladies.com/resources"
         * "https://www.ellevatenetwork.com/articles"
         * "https://www.leanin.org/tips/mentorship"
       - For career development:
         * "https://www.linkedin.com/learning"
         * "https://www.indeed.com/career-advice"
         * "https://www.glassdoor.com/blog/"
         * "https://www.themuse.com/advice/"
       - For interview preparation:
         * "https://www.interviewcake.com/"
         * "https://leetcode.com/"
         * "https://www.pramp.com/"
         * "https://www.themuse.com/advice/interview-questions-and-answers"
       - For technical skills:
         * "https://www.freecodecamp.org/learn"
         * "https://developer.mozilla.org/en-US/docs/Learn"
         * "https://www.w3schools.com/"
         * "https://www.codecademy.com/catalog"
         * "https://github.com/microsoft/Web-Dev-For-Beginners"

    2. MATCH LINKS TO CONTENT - each resource must be SPECIFICALLY relevant to the phase it's attached to
    3. DO NOT use links you're uncertain about or that don't specifically match the content
    4. For topic-specific resources, link to the exact documentation page (not just homepage)

    FORMAT YOUR RESPONSE AS A JSON ARRAY with 5-8 objects.
    Each object MUST have these fields:
    - "title": string (Clear focus area without time references)
    - "description": string (Detailed guidance without specific days/weeks)
    - "link": string (VERIFIED working URL to relevant resource)
    - "calendar_event": string (Short summary for calendar)

    RETURN ONLY THE JSON ARRAY. No introductions or other text.
    """
    
    # Extract any timeframe from the user's query
    timeframe_patterns = [
        r'(\d+)\s*(day|days|week|weeks|month|months)',  # numeric: "2 weeks", "1 month"
        r'(one|two|three|four|five|six|seven|eight|nine|ten)\s+(day|days|week|weeks|month|months)',  # text: "one week"
        r'(a|an)\s+(day|week|month)'  # "a week", "a month"
    ]
    
    timeframe = None
    for pattern in timeframe_patterns:
        match = re.search(pattern, topic, re.IGNORECASE)
        if match:
            if match.group(1).isdigit():
                number = int(match.group(1))
            elif match.group(1).lower() in ['a', 'an']:
                number = 1
            else:
                number_map = {
                    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
                    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
                }
                number = number_map.get(match.group(1).lower(), 1)
                
            unit = match.group(2).lower() if len(match.groups()) > 1 else 'week'
            if 'day' in unit:
                timeframe = f"{number} day{'s' if number > 1 else ''}"
            elif 'week' in unit:
                timeframe = f"{number} week{'s' if number > 1 else ''}"
            elif 'month' in unit:
                timeframe = f"{number} month{'s' if number > 1 else ''}"
            break
    
    # Also check for words that imply timeframes without explicit numbers
    if not timeframe:
        if any(word in topic.lower() for word in ['quick', 'fast', 'rapid', 'short', 'brief']):
            timeframe = "short-term (1-2 weeks)"
        elif any(word in topic.lower() for word in ['thorough', 'comprehensive', 'complete', 'in-depth']):
            timeframe = "comprehensive (1-2 months)"
    
    # Build context from the user's query
    context = f"Topic: {topic}\n"
    if timeframe:
        context += f"Requested timeframe: {timeframe}\n"
        context += "Important: Adjust the roadmap to fit exactly within this timeframe.\n"
    
    # Check for women-specific career needs
    women_career_patterns = {
        "returner": "This user is a woman returning to the workforce after a career break. Include resources specifically for returners, addressing confidence rebuilding and skills refreshers.",
        "rejoining": "This user is a woman rejoining the workforce after a break. Focus on translating past experience to current market needs.",
        "restart": "This user is a woman restarting her career. Emphasize transferable skills and flexible work options.",
        "returning": "This user is a woman returning to professional work. Include return-to-work programs and relevant communities.",
        "starting": "This user is a woman starting her career. Focus on entry points and building professional presence.",
        "beginning": "This user is a woman beginning her career journey. Include foundational skills and mentorship opportunities.",
        "mother": "This user is a working mother. Highlight flexible options and resources that acknowledge family responsibilities.",
        "married": "This user is balancing career with family responsibilities. Include strategies for work-life integration.",
        "balance": "This user needs resources that support work-life balance. Include efficient learning strategies."
    }
    
    for keyword, description in women_career_patterns.items():
        if keyword in topic.lower():
            context += f"\nSpecial audience: {description}\n"
    
    # Initialize messages with system prompt
    messages = [SystemMessage(content=system_prompt)]
    
    # Add the context and topic as a human message
    context += "\nCurrent request:\n"
    messages.append(HumanMessage(content=f"{context}Create a learning roadmap for: {topic}"))
    
    # Generate response from the model
    response = chat_model(messages)
    content = response.content.strip()
    
    # Extract JSON from the response if it's wrapped in code fences
    if content.startswith("```") and content.endswith("```"):
        content = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", content).group(1)

    try:
        roadmap_items = json.loads(content)
        return roadmap_items
    except json.JSONDecodeError:
        print("Failed to parse JSON. Using fallback roadmap.")
        return [
            {
                "title": "Understanding Your Career Goals",
                "description": "Begin by assessing your current skills, interests, and career objectives. Create a document that outlines your strengths, areas for growth, and specific goals you want to achieve.",
                "link": "https://www.themuse.com/advice/how-to-figure-out-what-you-want-next-in-your-career",
                "calendar_event": "Career Goals Assessment"
            },
            {
                "title": "Skill Enhancement Planning",
                "description": "Identify the key skills needed for your target role. Research industry requirements and create a prioritized list of skills to develop.",
                "link": "https://www.indeed.com/career-advice/finding-a-job/resume-tips-women_returning_to_workforce",
                "calendar_event": "Skills Planning Session"
            },
            {
                "title": "Networking and Community Building",
                "description": "Connect with professional networks in your field. Join relevant online communities, attend virtual events, and reach out to former colleagues.",
                "link": "https://www.ellevatenetwork.com/articles",
                "calendar_event": "Networking Strategy Session"
            },
            {
                "title": "Application Materials Preparation",
                "description": "Update your resume and LinkedIn profile to highlight relevant skills and experiences. Create templates for cover letters and prepare your portfolio.",
                "link": "https://www.linkedin.com/learning",
                "calendar_event": "Resume and Profile Updates"
            },
            {
                "title": "Interview Preparation",
                "description": "Research common interview questions in your field and prepare thoughtful responses. Practice answering questions confidently and concisely.",
                "link": "https://www.themuse.com/advice/interview-questions-and-answers",
                "calendar_event": "Interview Practice"
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
def generate_text_response(query: str, conversation_history=None, resume_data=None) -> str:
    """
    Generate a conversational response for general inquiries.
    
    Args:
        query (str): The user's current query/message
        conversation_history (list, optional): Previous conversations in chronological order
        resume_data (dict, optional): User's resume data including skills and work experience
    """
    system_prompt = """
    You are a helpful assistant for job seekers and career advancers.
    Respond in a friendly, concise manner. Keep responses brief and focused.
    If the user seems to be asking about jobs or careers but not requesting specific listings,
    suggest they can ask for job listings or a career roadmap.
    
    Use the conversation history to provide more personalized and contextually relevant responses.
    Refer to previous information that the user has shared when appropriate.
    
    If the user mentions @resume in their query, consider their resume information when providing advice.
    """
    
    messages = [
        SystemMessage(content=system_prompt),
    ]
    
    context = ""
    
    # Add resume data if available (when @resume tag is used)
    if "@resume" in query:


        resume_context = "User's resume information:\n"
        
        # Add skills from resume
        skills = resume_data.get('skills', [])
        if skills:
            resume_context += "Skills: " + ", ".join(skills) + "\n"
            
        # Add work experience from resume
        work_experience = resume_data.get('workExperience', [])
        if work_experience:
            resume_context += "Work Experience:\n"
            for exp in work_experience:
                company = exp.get('company', '')
                role = exp.get('role', '')
                description = exp.get('description', '')
                if company and role:
                    resume_context += f"- {role} at {company}\n"
                    if description:
                        resume_context += f"  Description: {description[:100]}...\n"
        
        # Add education if available
        education = resume_data.get('education', [])
        if education:
            resume_context += "Education:\n"
            for edu in education:
                degree = edu.get('degree', '')
                institution = edu.get('institution', '')
                if degree and institution:
                    resume_context += f"- {degree} from {institution}\n"
        
        context += resume_context + "\n"
    
    # Add conversation history context if available
    if conversation_history and len(conversation_history) > 0:
        context += "Previous messages (in chronological order):\n"
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
        # Check if this was a resume-based search
        is_resume_search = "@resume" in query
        
        # Create a natural language response based on search results
        if job_count > 0:
            if is_resume_search:
                if location:
                    response_text = f"Based on your resume, I found {job_count} {role} opportunities in {location} that match your skills! Here are some matches that might interest you."
                else:
                    response_text = f"Great news! Using your resume skills, I found {job_count} relevant {role} openings that match your profile."
            else:
                if location:
                    response_text = f"I found {job_count} {role} opportunities in {location}! Here are some matches that might interest you."
                else:
                    response_text = f"Great news! I found {job_count} relevant {role} openings that match your criteria."
        else:
            if is_resume_search:
                if location:
                    response_text = f"I couldn't find any {role} opportunities in {location} that match your resume skills at the moment."
                else:
                    response_text = f"I couldn't find exact matches for '{role}' based on your resume skills. Try broadening your search or adding more skills to your profile."
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
        
        # Add calendar_event to each item if not present
        for item in roadmap_items:
            if "calendar_event" not in item:
                item["calendar_event"] = item.get("title", "Learning session")
        
        return {
            "text": f"I've created a day-by-day roadmap for learning {query}. Each step includes daily activities and resources. You can add these to your calendar using the 'Add to Calendar' button.",
            "canvasType": "roadmap",
            "canvasUtils": {
                "roadmap": roadmap_items,
                "enableCalendarIntegration": True  # Flag to enable calendar integration in frontend
            }
        }
    elif query_type == "events":
        # Events response
        
        session_link, session_api = get_events_links()
        
        return {
            "text": "I can help you find events or workshops related to your query. Please click on the toggle to view",
            "canvasType": "sessions",
            "canvasUtils": {
                "session_link": session_link,
                "session_api": session_api  # Placeholder for events data
            }
        }
        
    else:
        # Normal text response
        return {
            "text": result,
            "canvasType": "none",
            "canvasUtils": {}
        }

def run_agent(prompt: str, conversation_history=None, resume_data=None) -> dict:
    """
    Process a user prompt and return an appropriate response.
    Returns a dictionary in the format expected by the frontend.
    
    Args:
        prompt (str): The user's current query/message
        conversation_history (list, optional): Previous conversation messages for context
        resume_data (dict, optional): User's resume data including skills and work experience
    """
    # Step 1: Classify the query
    query_type = classify_query(prompt)
      # Step 2: Handle based on classification
    if query_type == "job_search":
        # Handle job search with resume data if available
        job_params = extract_job_search_params(prompt, conversation_history, resume_data)
        return format_response(query_type, prompt, job_params)
    
    elif query_type == "roadmap":
        # Handle roadmap (using resume data in the future for better personalization)
        # For now, we're not passing resume_data to generate_roadmap
        roadmap_items = generate_roadmap(prompt, conversation_history)
        return format_response(query_type, prompt, roadmap_items)
    
    else:
        # Handle normal text with resume context if available
        text_response = generate_text_response(prompt, conversation_history, resume_data)
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
