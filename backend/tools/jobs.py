import requests
from bs4 import BeautifulSoup
import re
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from urllib.parse import urlencode
from datetime import datetime, timedelta
from assets.system_prompt import JOB_SEARCH_SYSTEM_PROMPT,GENERATE_ROADMAP_SYSTEM_PROMPT, ROADMAP_SUBPROMPTS
from dotenv import load_dotenv
import json
import os

load_dotenv()
# Initialize your chat LLM
chat_model = ChatOpenAI(model="gpt-4.1-nano", temperature=0.3)
def get_linkedin_jobs(params):
    """
    Fetch and parse LinkedIn job listings into specified JSON format
    
    Args:
        params (dict): Search parameters for LinkedIn job search
        
    Returns:
        list: List of job dictionaries in the specified format
    """
    
    # Base URL for LinkedIn jobs API
    base_url = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
    
    # Default headers to mimic browser request
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
    }
    
    try:
        # Build URL with parameters
        linkedin_params = {
            "keywords": params.get("keyword", ""),
        }
        if "location" in params:
            linkedin_params["location"] = params["location"]
        if "location_name" in params:
            linkedin_params["location"] = params["location_name"]
        print(params,linkedin_params,"punji")
        url = f"{base_url}?{urlencode(linkedin_params)}"
        
        # Make request
        print(f"Fetching LinkedIn jobs with URL: {url}")
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse HTML response
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract job listings
        job_cards = soup.find_all('li')
        jobs = []
        
        for card in job_cards:
            job_data = parse_linkedin_job_card(card)
            if job_data:
                jobs.append(job_data)
        
        return jobs
        
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {str(e)}")
        return []
    except Exception as e:
        print(f"Parsing failed: {str(e)}")
        return []

def parse_linkedin_job_card(card):
    """
    Parse individual LinkedIn job card into specified JSON format
    
    Args:
        card: BeautifulSoup element containing job card
        
    Returns:
        dict: Parsed job data in specified format or None if parsing fails
    """
    try:
        # Find the base card div
        base_card = card.find('div', class_='base-card')
        if not base_card:
            return None
            
        # Extract job ID from data-entity-urn
        job_urn = base_card.get('data-entity-urn', '')
        job_id = job_urn.split(':')[-1] if job_urn else None
        
        # Extract job title
        title_element = card.find('h3', class_='base-search-card__title')
        title = title_element.get_text(strip=True) if title_element else ""
        
        # Extract company name and details
        company_element = card.find('h4', class_='base-search-card__subtitle')
        company_name = ""
        if company_element:
            company_link = company_element.find('a')
            company_name = company_link.get_text(strip=True) if company_link else company_element.get_text(strip=True)
        
        # Extract location
        location_element = card.find('span', class_='job-search-card__location')
        location_name = location_element.get_text(strip=True) if location_element else ""
        
        # Extract posting date and convert to creation timestamp
        date_element = card.find('time', class_='job-search-card__listdate')
        created_on = ""
        if date_element:
            datetime_attr = date_element.get('datetime')
            if datetime_attr:
                # Convert ISO date to required format
                date_obj = datetime.fromisoformat(datetime_attr.replace('Z', '+00:00'))
                created_on = date_obj.strftime('%Y-%m-%d %H:%M:%S')
        
        # Extract job URL
        job_url = ""
        link_element = card.find('a', class_='base-card__full-link')
        if link_element:
            job_url = link_element.get('href')
        
        # Extract company logo
        logo_element = card.find('img', class_='artdeco-entity-image')
        company_logo = ""
        if logo_element:
            company_logo = logo_element.get('data-delayed-url', '')
        
        # Extract benefits/hiring status
        benefits_element = card.find('div', class_='job-posting-benefits')
        company_benefits = ""
        boosted = False
        if benefits_element:
            benefit_text_element = benefits_element.find('span', class_='job-posting-benefits__text')
            if benefit_text_element:
                benefit_text = benefit_text_element.get_text(strip=True)
                company_benefits = benefit_text
                # Check if it's actively hiring or early applicant (indicates boosted)
                if "actively hiring" in benefit_text.lower() or "early applicant" in benefit_text.lower():
                    boosted = True
        
        # Determine job types based on title and other indicators
        job_types = []
        title_lower = title.lower()
        if "intern" in title_lower:
            job_types.append("internship")
        elif "manager" in title_lower or "senior" in title_lower:
            job_types.append("full_time")
        else:
            job_types.append("full_time")  # Default assumption
        
        # Extract tracking information for unique identification
        tracking_id = base_card.get('data-tracking-id', '')
        reference_id = base_card.get('data-reference-id', '')
        
        return {
            "application_count": 0,  # Not available in LinkedIn search results
            "boosted": boosted,
            "company_benefits": company_benefits,
            "company_id": hash(company_name) % 100000 if company_name else None,  # Generate pseudo ID
            "company_logo": company_logo,
            "company_name": company_name,
            "created_on": created_on,
            "employer_id": None,  # Not available in search results
            "employer_name": "",  # Not available in search results
            "id": int(job_id) if job_id and job_id.isdigit() else hash(job_url) % 1000000,
            "job_posting_type": "",  # Not explicitly available
            "job_types": job_types,
            "location_id": None,  # Not available
            "location_name": location_name,
            "max_year": None,  # Would need job description parsing
            "min_year": None,  # Would need job description parsing
            "modified_on": created_on,  # Use same as created_on
            "new_application_count": 0,  # Not available
            "redirect_url": job_url,
            "requirements": "",  # Would need full job description
            "responsibilities": "",  # Would need full job description
            "resume_required": True,  # Default assumption
            "skills": [],  # Would need job description parsing
            "title": title,  # Added for clarity
            "linkedin_job_id": job_id,  # Original LinkedIn ID
            "tracking_id": tracking_id,
            "reference_id": reference_id
        }
        
    except Exception as e:
        print(f"Error parsing job card: {str(e)}")
        return None
def get_herkey_token() -> str:
    """Get a JWT session token from Herkey API."""
    resp = requests.get(
        "https://api-prod.herkey.com/api/v1/herkey/generate-session"
    )
    resp.raise_for_status()
    return resp.json()["body"]["session_id"]

def extract_skills_from_description(job_url):
    """
    Optional: Fetch full job description to extract skills and requirements
    This would require an additional API call to get detailed job information
    """
    # This would need implementation to fetch individual job details
    # from LinkedIn's job posting API endpoint
    pass
# Define allowed locations for Herkey search (labels as shown to user)
ALLOWED_HERKEY_LOCATIONS = json.load(open(os.path.join(os.path.dirname(__file__), '../assets/locs.json'), encoding='utf-8'))

# Lowercase set for fast comparison
ALLOWED_HERKEY_LOCATIONS_SET = set(label.lower() for label in ALLOWED_HERKEY_LOCATIONS)

# Load allowed locations from locs.json
LOCATIONS_PATH = os.path.join(os.path.dirname(__file__), '../assets/locs.json')
with open(LOCATIONS_PATH, encoding='utf-8') as f:
    locs_data = json.load(f)
ALLOWED_HERKEY_LABELS = set()


def is_location_allowed(location_name):
    if not location_name:
        return False
    location_name_clean = location_name.strip().lower()
    # Exact match
    if location_name_clean in ALLOWED_HERKEY_LABELS:
        return True
    # Fuzzy match: allow if location is close to any allowed label
    from difflib import get_close_matches
    matches = get_close_matches(location_name_clean, ALLOWED_HERKEY_LABELS, n=1, cutoff=0.7)
    if matches:
        return matches[0]
    return False

def get_herkey_jobs(params: dict) -> dict:
    herkey_session = get_herkey_token()
    if 'location_name' in params:
        location_name = params['location_name'].strip().lower()
        if not is_location_allowed(location_name):
            del params['location_name']  # Remove if not allowed
        else:
            params['location_name'] = is_location_allowed(location_name)
        
    query_string = urlencode(params)
    job_url = f"https://api-prod.herkey.com/api/v1/herkey/jobs/es_candidate_jobs?{query_string}"
    try:
        headers = {'Content-Type': 'application/json', 'Authorization': f'Token {herkey_session}'}
        job_response = requests.get(job_url, headers=headers)
        jobs_data = job_response.json()
       
        return jobs_data
    except requests.HTTPError as http_err:
        return {
            "response_code": 500,
            "message": f"HTTP error occurred: {str(http_err)}",
            "body": [],
            "platforms_searched": []
        }
    except requests.RequestException as e:
        return {
            "response_code": 500,
            "message": f"Error fetching jobs from Herkey: {str(e)}",
            "body": [],
            "platforms_searched": []
        }
        
    
    


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
    system_prompt = JOB_SEARCH_SYSTEM_PROMPT
    
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
    
    linkedin_jobs= get_linkedin_jobs(params)
    
    
    
    
        
    herkey_jobs=get_herkey_jobs(params).get('body', [])
    # Combine results from all platforms
    sorted_jobs = []
    print(params,"gunji")
    platforms = platforms or ["herkey", "linkedin", "glassdoor"]
    error_messages = []
    if "herkey" in platforms:
        herkey_jobs = get_herkey_jobs(params)
        if herkey_jobs.get("response_code") == 10100:
            sorted_jobs.extend(herkey_jobs.get("body", []))
        else:
            error_messages.append(f"Herkey: {herkey_jobs.get('message', 'Unknown error')}")
    if "linkedin" in platforms:
        linkedin_jobs = get_linkedin_jobs(params)
        if linkedin_jobs:
            sorted_jobs.extend(linkedin_jobs)
        else:
            error_messages.append("LinkedIn: No job results found or an error occurred")
    if "glassdoor" in platforms:
        # Placeholder for Glassdoor API call
        # glassdoor_jobs = get_glassdoor_jobs(params)
        # if glassdoor_jobs.get("response_code") == 10100:
        #     sorted_jobs.extend(glassdoor_jobs.get("body", []))
        # else:
        #     error_messages.append(f"Glassdoor: {glassdoor_jobs.get('message', 'Unknown error')}")
        pass
    
    
    
    
    
    if len(sorted_jobs)>0:
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
            # "message": " | ".join(error_messages) if error_messages else "No job results found",
            "body": [],
            "platforms_searched": platforms
        }



# Example usage with the provided HTML structure
if __name__ == "__main__":
    # Test with sample parameters
    search_params = {
        "keywords": "data science",
        "location": "remote",
        "start": 0
    }
    
    results = get_job_search_results(search_params, platforms=["herkey", "linkedin"])
    print(json.dumps(results, indent=2, ensure_ascii=False))
