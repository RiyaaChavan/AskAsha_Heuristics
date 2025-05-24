import requests
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from dotenv import load_dotenv
import os
import json
import re
import urllib.parse
from datetime import datetime
from transformers import pipeline
load_dotenv()
# Initialize your chat LLM
chat_model = ChatOpenAI(model="gpt-4.1-nano", temperature=0.3)


gibberish_pipe = pipeline("text-classification", model="madhurjindal/autonlp-Gibberish-Detector-492513457")

def check_gibberish(text, threshold=0.8):
    try:
        result = gibberish_pipe(text)[0]
        return  result['score'] >= threshold and result['label'] != 'clean'
    except Exception as e:
        print(f"Gibberish detection error: {str(e)}")

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
    
    IMPORTANT: Keep searches BROAD to ensure results. Avoid overparameterization.
    
    Parameters to extract (only include if explicitly mentioned):
    - page_no: Always set to 1 for initial search
    - page_size: Always set to 15 for initial search  
    - keyword: The main job title, role, or broad skill area (REQUIRED - keep it broad and simple)
    - location_name: Only include if user specifically mentions a city/location
    - work_mode: Only if explicitly mentioned: "work_from_home", "work_from_office", "hybrid", or "freelance"
    - job_types: Only if explicitly mentioned: "full_time", "part_time", "freelance", "returnee_program", or "volunteer"
    - job_skills: Only include 1-3 most important/specific skills mentioned (don't over-specify)
    - is_global_query: Always set to "false"
    - platforms: Default ["herkey", "linkedin", "glassdoor"]
    
    CRITICAL RULES:
    1. Keep 'keyword' broad and simple (e.g., "data scientist", "software engineer", "marketing")
    2. Do NOT include overly specific parameters that could eliminate good matches
    3. Do NOT extract: industries, company_name, salary ranges, years of experience
    4. Limit job_skills to maximum 3 core skills only if explicitly mentioned
    5. For general queries like "find me a job", use broad terms like "software", "data", "marketing" based on context
    6. Prefer broader searches over narrow ones - it's better to get more results than none
    
    Examples:
    - "Find data science jobs" → {"keyword": "data scientist", "job_skills": "data analysis"}
    - "Software engineer remote" → {"keyword": "software engineer", "work_mode": "work_from_home"}
    - "Marketing jobs in Mumbai" → {"keyword": "marketing", "location_name": "Mumbai"}
    
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
            resume_context += education
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
        params.setdefault("platforms", ["herkey", "linkedin", "glassdoor"])
        
        # Ensure keyword is broad and simple
        if "keyword" not in params or params["keyword"].strip() == "":
            # Use resume skills as broad keywords if available
            if resume_data and resume_data.get('skills'):
                # Take first 2-3 skills and make them broad
                top_skills = resume_data.get('skills', [])[:2]
                params["keyword"] = " ".join(top_skills)
            else:
                # Extract a simple keyword from the query
                query_lower = query.lower()
                if any(word in query_lower for word in ['data', 'analyst', 'science']):
                    params["keyword"] = "data"
                elif any(word in query_lower for word in ['software', 'developer', 'engineer', 'programming']):
                    params["keyword"] = "software"
                elif any(word in query_lower for word in ['marketing', 'digital', 'social']):
                    params["keyword"] = "marketing"
                elif any(word in query_lower for word in ['design', 'ui', 'ux']):
                    params["keyword"] = "design"
                else:
                    params["keyword"] = "jobs"  # Very broad fallback
        
        # Simplify job_skills - limit to 3 max and make them broad
        if "job_skills" in params and params["job_skills"]:
            skills_str = params["job_skills"]
            if isinstance(skills_str, str):
                skill_list = [s.strip() for s in skills_str.split(',')][:3]  # Max 3 skills
                params["job_skills"] = ', '.join(skill_list)
        elif resume_data and resume_data.get('skills'):
            # Add top 3 resume skills as job_skills if none extracted
            top_skills = resume_data.get('skills', [])[:3]
            params["job_skills"] = ', '.join(top_skills)
        
        # Clean up parameters - remove empty or overly specific values
        for key in list(params.keys()):
            if isinstance(params[key], str) and (
                params[key].strip() == "" or 
                params[key] in ["any", "all", "none", "not specified"]
            ):
                del params[key]
        
        # Remove overly restrictive parameters that could cause no results
        restrictive_params = ['industries', 'company_name', 'min_year', 'max_year', 'salary_min', 'salary_max']
        for param in restrictive_params:
            if param in params:
                del params[param]
        
        # Ensure platforms is a list
        if "platforms" in params and isinstance(params["platforms"], str):
            params["platforms"] = [params["platforms"]]
        
        print(f"Final job search params: {params}")
        return params
    except json.JSONDecodeError:
        # If JSON parsing fails, return very basic parameters
        basic_keyword = "jobs"
        
        # Try to extract a simple keyword from the query
        query_lower = query.lower()
        if any(word in query_lower for word in ['data', 'analyst', 'science']):
            basic_keyword = "data"
        elif any(word in query_lower for word in ['software', 'developer', 'engineer']):
            basic_keyword = "software"
        elif any(word in query_lower for word in ['marketing', 'digital']):
            basic_keyword = "marketing"
        elif any(word in query_lower for word in ['design', 'ui', 'ux']):
            basic_keyword = "design"
        
        return {
            "page_no": 1,
            "page_size": 15,
            "keyword": basic_keyword,
            "is_global_query": "false",
            "platforms": ["herkey", "linkedin", "glassdoor"]
        }

# Get job search results from the Herkey API
def get_job_search_results(params: dict, platforms=None) -> dict:
    """
    Search for jobs across multiple platforms with the given parameters.
    
    Args:
        params (dict): Job search parameters
        platforms (list): List of platforms to search on. If None, searches on all platforms.
    
    Returns:
        dict: Dictionary with combined search results from all platforms.
    """
    # Default to all platforms if none specified
    if platforms is None:
        platforms = ["herkey", "linkedin", "glassdoor"]
    elif isinstance(platforms, str):
        platforms = [platforms]
    
    # Import the job client factory
    try:
        from tools.api_client import get_job_client
    except ImportError:
        # If import fails, fallback to just Herkey
        platforms = ["herkey"]
        
        # Define a simple factory function for Herkey only
        def get_job_client(platform="herkey"):
            from tools.api_client import HerkeyAPIClient
            return HerkeyAPIClient()
    
    all_results = []
    error_messages = []
    
    # Search for jobs on each platform
    for platform in platforms:
        try:
            # Get the appropriate client for this platform
            client = get_job_client(platform)
            
            # Search for jobs
            platform_results = client.search_jobs(params)
            
            # If successful, add to all_results
            if "body" in platform_results and isinstance(platform_results["body"], list):
                # Add platform identifier if not already present
                for job in platform_results["body"]:
                    if "platform" not in job:
                        job["platform"] = platform
                
                all_results.extend(platform_results["body"])
            else:
                error_messages.append(f"Error searching on {platform}: No results found")
        except Exception as e:
            error_messages.append(f"Error searching on {platform}: {str(e)}")
    
    # Create a combined result
    if all_results:
        # Filter out expired jobs
        current_date = datetime.now()
        valid_jobs = []
        
        for job in all_results:
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
        
        # Sort jobs: First prioritize Herkey jobs, then by match score if available
        # This ensures Herkey jobs are shown first in the frontend
        sorted_jobs = sorted(valid_jobs, key=lambda job: (
            0 if job.get("platform") == "herkey" else 1,  # Herkey jobs first
            -1 * job.get("skillMatchScore", 0) if "skillMatchScore" in job else 0  # Then by skill match score
        ))
        
        return {
            "response_code": 10100,
            "message": "Success",
            "body": sorted_jobs,
            "platforms_searched": platforms
        }
    else:
        # If no results, return error
        return {
            "response_code": 400,
            "message": " | ".join(error_messages) if error_messages else "No job results found",
            "body": [],
            "platforms_searched": platforms
        }

# Generate a roadmap for a given topic
def generate_roadmap(topic: str, conversation_history=None) -> list:
    """
Generate a structured learning roadmap for the given topic. The topic must be related to career development or professional growth or skill enhancement. For any non career development topics, politely inform the user that the feature is only available for career development topics.
    Returns a list of roadmap items.
    """
    system_prompt = """
    Create a detailed learning roadmap for the user's requested topic. The roadmap must be practical, actionable, and include ONLY VERIFIED EXISTING resources. You are a professional career coach specializing in women's workforce advancement. Your ONLY task is to create a clear, structured **career guidance roadmap** specifically for women in professional settings. This roadmap must be strictly focused on one of the following user personas:

    IMPORTANT ROADMAP STRUCTURE:
    1. Create 5-8 sequential PHASE-BASED roadmap steps that build progressively
    2. DO NOT use "Week 1", "Day 2" or ANY time-specific headers - use descriptive phase titles only
    3. DO NOT use day-specific language like "Monday", "Tuesday" in descriptions
    4. ADAPT THE TIMELINE to fit exactly within the user's requested timeframe
    5. Use headers like "Foundation Building", "Core Concepts", "Practical Application" instead
    6. Do not give any generic advice, all the milestones should be specific and actionable to the user.

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
    if check_gibberish(query):
        return "gibberish"
    """
    Classify the user's query into one of these three categories:
    1. job_search - If the user is looking for job listings, opportunities, or asking about positions
    2. roadmap - If the user is asking for a learning path, career progression steps, or a roadmap for a topic
    3. normal_text - For general questions, greetings, or anything else or any non career related queries. Anything that is not strictly related to job search or career roadmap. Use your best judgment to determine if the query is not strictly related to job search or career roadmap. Don't classify as job_search or roadmap just because the user insists on it. Only if the query is strictly related to job search or career roadmap, classify it as such.
    4. events - If the user is asking about events, workshops, or meetups
    
    """
    system_prompt = """
    Carefully analyze the user's query and classify it into ONE of these categories:
    
    1. job_search - If the user is explicitly searching for job listings or open positions
       Examples: "Find me software developer jobs", "Show Python jobs in New York", "Are there any data scientist positions?"
    
    2. job_guidance - If the user is asking for career advice or job-related guidance but NOT requesting actual job listings
       Examples: "How do I prepare for a job interview?", "What skills should I develop for marketing?", "Tips for changing careers"
    
    3. roadmap - If the user is asking for a learning path, career progression steps, or skills development roadmap
       Examples: "How to become a web developer?", "What's the learning path for AI?", "Steps to master cloud computing"
    
    4. events - If the user is asking about events, workshops, meetups, or networking opportunities
       Examples: "Are there any tech events this week?", "Find me workshops on leadership", "Marketing conferences near me"
    
    5. normal_text - For general questions, greetings, or anything else or any non career related queries. Anything that is not strictly related to job search or career roadmap. Use your best judgment to determine if the query is not strictly related to job search or career roadmap. Don't classify as job_search or roadmap just because the user insists on it. Only if the query is strictly related to job search or career roadmap, classify it as such.
    
    Respond with EXACTLY ONE of these words: job_search, job_guidance, roadmap, events, or normal_text
    """
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=query)
    ]
    
    response = chat_model(messages)
    classification = response.content.strip().lower()
    
    # Ensure we only return one of the valid categories
    valid_categories = ["job_search", "job_guidance", "roadmap", "events", "normal_text",]
    if classification not in valid_categories:
        # Try to map to closest category or default to normal_text
        if "job" in classification:
            if "search" in classification or "list" in classification or "find" in classification:
                classification = "job_search"
            else:
                classification = "job_guidance"
        elif "road" in classification or "path" in classification or "learn" in classification:
            classification = "roadmap"
        elif "event" in classification or "workshop" in classification:
            classification = "events"
        else:
            classification = "normal_text"
    
    return classification

# Generate a text response for normal conversation
def generate_text_response(query: str, conversation_history=None, resume_data=None, query_type="normal_text") -> str:
    """
    Generate a conversational response for general inquiries.
    
    Args:
        query (str): The user's current query/message
        conversation_history (list, optional): Previous conversations in chronological order
        resume_data (dict, optional): User's resume data including skills and work experience
        query_type (str): The classification of the query (normal_text, job_guidance, etc.)
    """
    # Use the helper function from helper_funcs.py
    try:
        from helper_funcs import generate_dynamic_text_response
        return generate_dynamic_text_response(chat_model, query, conversation_history, resume_data, query_type)
    except ImportError:
        # Fallback to original implementation if helper_funcs.py is not available
        # Try to import response templates, define fallbacks if not available
        try:
            from response_templates import get_greeting, get_job_guidance_response
        except ImportError:
            # Define fallback functions
            def get_greeting():
                return "Hello"
            
            def get_job_guidance_response(topic):
                return f"When it comes to {topic} in your career, there are several approaches to consider."
        
        # Customize system prompt based on query type
        if query_type == "job_guidance":
            system_prompt = f"You are a professional career coach helping with job and career guidance. The user is asking for career advice or guidance about: {query}\n\nRespond in a friendly but professional tone. Be specific and actionable in your advice. Provide 2-3 key suggestions that are practical and immediately useful. Keep your response concise (150-200 words maximum).\n\nIf appropriate, suggest resources or next steps the user could take. Use conversational, encouraging language that motivates the user.\n\nWhen referring to the job market or industry trends, be current and accurate. Do not answer questions that are not related to the user's query or are not related to a person's career growth."
        else:
            system_prompt = f"You are a helpful assistant for job seekers and career advancers named Asha. The current query is: {query}\n\nRespond in a friendly, conversational manner. Start with a brief acknowledgment. Keep responses focused and under 150 words. Make your response personalized and specific to the query. Use varied sentence structures and natural language patterns. Avoid repetitive phrases or generic responses.\n\nIf the user seems to be asking about jobs or careers but not requesting specific listings, suggest they can ask for job listings or a career roadmap.\n\nUse the conversation history to maintain context and provide relevant responses. If the user mentions @resume in their query, prioritize that information in your advice. Do not answer questions that are not related to the user's query or are not related to a person's career growth."
        
        messages = [
            SystemMessage(content=system_prompt),
        ]
        
        context = ""
        
        # Add resume data if available (when @resume tag is used)
        if "@resume" in query and resume_data:
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
            resume_context += education
        
        context += resume_context + "\n"
        
        # Add conversation history context if available
        if conversation_history and len(conversation_history) > 0:
            # The history is already in chronological order from oldest to newest
            # Include the last 3 messages for context to keep it focused
            recent_history = conversation_history[-3:] if len(conversation_history) > 3 else conversation_history
            
            context += "Previous conversation context:\n"
            for convo in recent_history:
                user_message = convo.get("message", "")
                bot_response = convo.get("response", {}).get("text", "")
                if user_message:
                    context += f"User: {user_message}\n"
                if bot_response:
                    context += f"Assistant: {bot_response}\n"
        
        # Add the current query with any resume context
        if context:
            messages.append(HumanMessage(content=f"{context}\n{query}"))
        else:
            messages.append(HumanMessage(content=query))
        
        # Generate the response
        response = chat_model(messages)
        return response.content.strip()

# Format the response for the frontend
def format_response(query_type: str, query: str, result, topic=None) -> dict:
    """
    Format the agent response into a standardized dictionary for the frontend.
    
    Args:
        query_type (str): The type of query (job_search, roadmap, etc.)
        query (str): The original user query
        result: The result to format (depends on query_type)
        topic (str, optional): The topic for context in some response types
        
    Returns:
        dict: Formatted response with text, canvasType, and canvasUtils
    """
    # Import response templates if available
    try:
        from response_templates import (
            get_job_search_response,
            get_roadmap_response,
            get_events_response,
            get_job_guidance_response,
            get_greeting
        )
    except ImportError:
        # Fallback if module not found or import error
        def get_job_search_response(job_count, role, location, is_resume_search, platforms=None):
            platform_str = ""
            if platforms:
                if len(platforms) == 1:
                    platform_str = f" on {platforms[0].capitalize()}"
                elif len(platforms) > 1:
                    platform_names = [p.capitalize() for p in platforms]
                    platform_str = f" across {', '.join(platform_names[:-1])} and {platform_names[-1]}"
                    
            location_str = f" in {location}" if location else ""
            if job_count > 0:
                if is_resume_search:
                    return f"Based on your resume, I found {job_count} {role} opportunities{location_str}{platform_str} that match your skills!"
                else:
                    return f"I found {job_count} {role} opportunities{location_str}{platform_str}! Here are some matches that might interest you."
            else:
                if is_resume_search:
                    return f"I couldn't find any {role} opportunities{location_str}{platform_str} that match your resume skills at the moment."
                else:
                    return f"I couldn't find any {role} opportunities{location_str}{platform_str} at the moment."
                
        def get_roadmap_response(topic):
            return f"I've created a step-by-step roadmap for learning {topic}. Each stage includes activities and resources to help you progress."
            
        def get_events_response():
            return "I found some upcoming events related to your interests! Click the toggle to view them."
            
        def get_job_guidance_response(topic):
            return f"When it comes to {topic} in your career, there are several approaches to consider."
            
        def get_greeting():
            return "Hello"
    
    if query_type == "job_search":
        # Job search response
        job_params = result
        platforms = job_params.get("platforms", ["herkey", "linkedin", "glassdoor"])
        
        # Get fresh token for job API
        token = get_herkey_token()
        
        # Create query string for job_link (fallback to Herkey if needed)
        query_string = urllib.parse.urlencode({k: v for k, v in job_params.items() if k != "platforms"})
        base_url = "https://api-prod.herkey.com/api/v1/herkey/jobs/es_candidate_jobs"
        job_link = f"{base_url}?{query_string}"
        
        # Actually fetch the job search results here from all platforms
        jobs_data = get_job_search_results(job_params, platforms)
        job_count = len(jobs_data.get("body", []))
        
        # Get parameters for dynamic response
        location = job_params.get("location_name", "")
        role = job_params.get("keyword", "jobs")
        is_resume_search = "@resume" in query
        
        # Customize message to mention which platforms were searched
        platforms_searched = jobs_data.get("platforms_searched", platforms)
        platform_message = ""
        if platforms_searched:
            if len(platforms_searched) == 1:
                platform_message = f" from {platforms_searched[0].capitalize()}"
            else:
                platform_names = [p.capitalize() for p in platforms_searched]
                platform_message = f" from {', '.join(platform_names[:-1])} and {platform_names[-1]}"
        
        # Use template for more varied responses
        response_text = get_job_search_response(
            job_count=job_count, 
            role=role, 
            location=location, 
            is_resume_search=is_resume_search,
            platforms=platforms
        )
        
        # Add platform information to the response text if not already mentioned
        if platform_message and platform_message not in response_text:
            response_text = response_text.replace("!", f"{platform_message}!")
            
        return {
            "text": response_text,
            "canvasType": "job_search",
            "canvasUtils": {
                "param": job_params,
                "job_link": job_link,
                "job_api": token,
                "job_results": jobs_data.get("body", []),
                "platform": platforms[0] if len(platforms) == 1 else None,
                "platforms_searched": platforms_searched
            }
        }
    
    elif query_type == "roadmap":
        # Roadmap response
        roadmap_items = result
        
        # Add calendar_event to each item if not present
        for item in roadmap_items:
            if "calendar_event" not in item:
                item["calendar_event"] = item.get("title", "Learning session")
        
        # Extract topic from query for dynamic response
        topic = query.lower()
        for prefix in ["roadmap for", "roadmap to", "how to", "learn", "learning path", "steps to", "guide to"]:
            if prefix in topic:
                topic = topic.split(prefix, 1)[1].strip()
                break
        
        # If topic is still the full query, just take the important keywords
        if topic == query.lower():
            import re
            # Remove common words and get core topic
            topic = re.sub(r'\b(a|an|the|for|to|of|with|on|at|in|by|about)\b', '', topic).strip()
        
        # Generate dynamic response
        response_text = get_roadmap_response(topic=topic)
        
        return {
            "text": response_text,
            "canvasType": "roadmap",
            "canvasUtils": {
                "roadmap": roadmap_items,
                "enableCalendarIntegration": True  # Flag to enable calendar integration in frontend
            }
        }
    elif query_type == "events":
        # Events response
        session_link, session_api = get_events_links()
        
        # Use template for more varied responses
        response_text = get_events_response()
        
        return {
            "text": response_text,
            "canvasType": "sessions",
            "canvasUtils": {
                "session_link": session_link,
                "session_api": session_api  # Placeholder for events data
            }
        }
    elif query_type =='gibberish':
        # Gibberish response
        return {
            "text": "It seems like your message is not clear. Could you please rephrase or provide more details?",
            "canvasType": "none",
            "canvasUtils": {}
        }  
    else:
        # Normal text response
        return {
            "text": "I'm here to support you with personalized career guidance and professional development. If you have questions about jobs available, skill development, resumes, interviews, leadership growth, or returning to work, I'd be happy to help! For other topics, I recommend consulting a more general-purpose assistant.",
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
        # Handle roadmap with conversation history for context
        roadmap_items = generate_roadmap(prompt, conversation_history)
        return format_response(query_type, prompt, roadmap_items)
    
    elif query_type == "events":
        # Handle events requests
        return format_response(query_type, prompt, None)
    
    elif query_type == "job_guidance":
        # Handle job guidance with specialized response
        # Try to extract topic for better contextual responses
        topic = None
        try:
            from helper_funcs import extract_topic_from_query
            topic = extract_topic_from_query(prompt)
        except ImportError:
            # If extraction fails, use the prompt as topic
            topic = prompt
        
        # Check if this is a resume-context query
        has_resume_context = bool(resume_data and prompt and '@resume' in prompt)
        
        # Generate response with appropriate context
        guidance_response = generate_text_response(prompt, conversation_history, resume_data, query_type="job_guidance")
        
        # Pass topic to format_response
        return format_response("normal_text", prompt, guidance_response, topic=topic)
    elif query_type == "gibberish":
        # Handle gibberish input
        return format_response("gibberish", prompt, None)
    else:
        # Handle normal text with resume context if available
        text_response = generate_text_response(prompt, conversation_history, resume_data)
        return format_response("normal_text", prompt, text_response)

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