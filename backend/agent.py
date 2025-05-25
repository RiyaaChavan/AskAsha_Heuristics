import requests
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from response_templates import get_greeting, get_job_guidance_response,get_job_search_response
from dotenv import load_dotenv
from tools.jobs import extract_job_search_params, get_job_search_results
import os
import json
import re
import urllib.parse
from datetime import datetime
from assets.system_prompt import JOB_SEARCH_SYSTEM_PROMPT,GENERATE_ROADMAP_SYSTEM_PROMPT, ROADMAP_SUBPROMPTS
load_dotenv()
# Initialize your chat LLM
chat_model = ChatOpenAI(model="gpt-4.1-nano", temperature=0.3)

from response_templates import ABBREVIATION_MAP

def expand_abbreviations(text, abbreviation_map):
    pattern = re.compile(r'\b(' + '|'.join(re.escape(k) for k in abbreviation_map.keys()) + r')\b', re.IGNORECASE)
    return pattern.sub(lambda x: abbreviation_map[x.group().upper()], text)


def check_gibberish(text, threshold=0.8):
    try:
        # Expand known career-related abbreviations
        expanded_text = expand_abbreviations(text, ABBREVIATION_MAP)
        print(f"Expanded text: {expanded_text}")

        # Use OpenAI to check for gibberish
        system_prompt = "Your task is to determine if the provided text is gibberish (nonsensical, random characters, or incomprehensible text). Respond with 'true' if it's gibberish or 'false' if it's valid text in any language. Only respond with 'true' or 'false'."
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=expanded_text)
        ]
        
        response = chat_model.invoke(messages).content.strip().lower()
        print(f"Gibberish detection result: {response}")
        return response == 'true'
    except Exception as e:
        print(f"Gibberish detection error: {str(e)}")
        return False

    except Exception as e:
        print(f"Gibberish detection error: {str(e)}")
        return False

# Helper to get a JWT session token from Herkey
def get_herkey_token() -> str:
    """Get a JWT session token from Herkey API."""
    resp = requests.get(
        "https://api-prod.herkey.com/api/v1/herkey/generate-session"
    )
    resp.raise_for_status()
    return resp.json()["body"]["session_id"]





# Job search function - extracts parameters from a query
# def extract_job_search_params(query: str, conversation_history=None, resume_data=None) -> dict:
#     """
#     Extract job search parameters from a natural language query.
#     Returns a dictionary of parameters for the Herkey API.
    
#     Args:
#         query (str): The user's current query/message
#         conversation_history (list, optional): Previous conversations in chronological order
#         resume_data (dict, optional): User's resume data including skills and work experience
#     """
#     system_prompt = JOB_SEARCH_SYSTEM_PROMPT
    
#     messages = [
#         SystemMessage(content=system_prompt),
#     ]
    
#     # Prepare context with conversation history and resume data if available
#     context = ""
    
#     # Add resume data if available (when @resume tag is used)
#     if resume_data:
#         resume_context = "User's resume information(This is the information the user is requesting when they say @resume):\n"
        
#         # Add skills from resume
#         skills = resume_data.get('skills', [])
#         if skills:
#             resume_context += "Skills: " + ", ".join(skills) + "\n"
            
#         # Add work experience from resume
#         work_experience = resume_data.get('workExperience', [])
#         if work_experience:
#             resume_context += "Work Experience:\n"
#             for exp in work_experience:
#                 company = exp.get('company', '')
#                 role = exp.get('role', '')
#                 description = exp.get('description', '')
#                 if company and role:
#                     resume_context += f"- {role} at {company}\n"
#                     if description:
#                         resume_context += f"  Description: {description}\n"
        
#         # Add education if available
#         education = resume_data.get('education', [])
#         if education:
#             resume_context += "Education:\n"
#             resume_context += education
#         context += resume_context + "\n"
        
#     # Add conversation history context if available
#     if conversation_history and len(conversation_history) > 0:
#         context += "Previous messages (in chronological order):\n"
#         # The history is already in chronological order from oldest to newest
#         # Include the last 3 messages for context
#         recent_history = conversation_history[-3:] if len(conversation_history) > 3 else conversation_history
        
#         for convo in recent_history:
#             user_message = convo.get("message", "")
#             bot_response = convo.get("response", {}).get("text", "")
#             if user_message:
#                 context += f"User: {user_message}\n"
#             if bot_response:
#                 context += f"Assistant: {bot_response}\n"
    
#     context += "\nCurrent query:\n"
#     messages.append(HumanMessage(content=f"{context}{query}"))
    
#     response = chat_model(messages)
#     content = response.content.strip()
    
#     # Extract JSON from the response if it's wrapped in code fences
#     if content.startswith("```") and content.endswith("```"):
#         content = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", content).group(1)
    
#     try:
#         params = json.loads(content)
#         return params
#     except json.JSONDecodeError:
#         # If JSON parsing fails, return very basic parameters
#         basic_keyword = "jobs"
        
#         # Try to extract a simple keyword from the query
#         query_lower = query.lower()
#         if any(word in query_lower for word in ['data', 'analyst', 'science']):
#             basic_keyword = "data"
#         elif any(word in query_lower for word in ['software', 'developer', 'engineer']):
#             basic_keyword = "software"
#         elif any(word in query_lower for word in ['marketing', 'digital']):
#             basic_keyword = "marketing"
#         elif any(word in query_lower for word in ['design', 'ui', 'ux']):
#             basic_keyword = "design"
        
#         return {
          
#             "keyword": basic_keyword,
#             "is_global_query": "false",
#             "platforms": ["herkey", "linkedin", "glassdoor"]
#         }

# # Get job search results from the Herkey API
# def get_job_search_results(params: dict, platforms=None) -> dict:
#     """
#     Search for jobs across multiple platforms with the given parameters.
    
#     Args:
#         params (dict): Job search parameters
#         platforms (list): List of platforms to search on. If None, searches on all platforms.
    
#     Returns:
#         dict: Dictionary with combined search results from all platforms.
#     """
#     # Default to all platforms if none specified
    
#     linkedin_jobs=[]
    
    
    
    
        
#     herkey_jobs=get_herkey_jobs.get('body', [])
#     sorted_jobs=herkey_jobs
    
    
    
    
#     if len(sorted_jobs)>0:
#         return {
#             "response_code": 10100,
#             "message": "Success",
#             "body": sorted_jobs,
#             "platforms_searched": platforms
#         }
#     else:
#         # If no results, return error
#         return {
#             "response_code": 400,
#             # "message": " | ".join(error_messages) if error_messages else "No job results found",
#             "body": [],
#             "platforms_searched": platforms
#         }

# Generate a roadmap for a given topic
def generate_roadmap(topic: str, conversation_history=None) -> list:
    """
Generate a structured learning roadmap for the given topic. The topic must be related to career development or professional growth or skill enhancement. For any non career development topics, politely inform the user that the feature is only available for career development topics.
    Returns a list of roadmap items.
    """
    # Import utility functions for roadmap generation
    try:
        from roadmap_utils import detect_roadmap_domain, verify_and_enhance_roadmap_links, adjust_roadmap_for_timeframe
    except ImportError:
        # Define simple versions if the imports fail
        def detect_roadmap_domain(topic: str) -> str:
            return "general"
            
        def verify_and_enhance_roadmap_links(roadmap_items: list) -> list:
            return roadmap_items
            
        def adjust_roadmap_for_timeframe(roadmap_items: list, timeframe=None) -> list:
            return roadmap_items
    
    # Detect domain type to select specialized template
    domain = detect_roadmap_domain(topic)
    # Detect domain type to select specialized template
    domain = detect_roadmap_domain(topic)
    
    system_prompt = GENERATE_ROADMAP_SYSTEM_PROMPT

    # Add domain-specific instructions based on detected domain
    system_prompt += ROADMAP_SUBPROMPTS[domain]

    # Extract any timeframe from the user's query
    timeframe_patterns = [
        r'(\d+)\s*(day|days|week|weeks|month|months|year|years)',  # numeric: "2 weeks", "1 month", "6 months"
        r'(one|two|three|four|five|six|seven|eight|nine|ten)\s+(day|days|week|weeks|month|months|year|years)',  # text: "one week"
        r'(a|an)\s+(day|week|month|year)'  # "a week", "a month"
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
            elif 'year' in unit:
                timeframe = f"{number} year{'s' if number > 1 else ''}"
            break
    
    # Also check for words that imply timeframes without explicit numbers
    if not timeframe:
        if any(word in topic.lower() for word in ['quick', 'fast', 'rapid', 'short', 'brief', 'crash course']):
            timeframe = "short-term (1-2 weeks)"
        elif any(word in topic.lower() for word in ['thorough', 'comprehensive', 'complete', 'in-depth', 'detailed']):
            timeframe = "comprehensive (1-2 months)"
    
    # Extract experience level
    experience_level = None
    if any(word in topic.lower() for word in ['beginner', 'basic', 'fundamentals', 'introduction', 'starting', 'start']):
        experience_level = "beginner"
    elif any(word in topic.lower() for word in ['intermediate', 'advanced beginner', 'some experience']):
        experience_level = "intermediate"
    elif any(word in topic.lower() for word in ['advanced', 'expert', 'professional', 'experienced', 'mastery']):
        experience_level = "advanced"
    
    # Extract industry or field context
    industry_contexts = {
        'tech': ['technology', 'software', 'programming', 'development', 'coding', 'IT', 'computer'],
        'healthcare': ['health', 'medical', 'nursing', 'clinical', 'patient', 'hospital', 'doctor'],
        'finance': ['financial', 'banking', 'accounting', 'investment', 'finance', 'trading', 'stocks'],
        'marketing': ['marketing', 'advertising', 'branding', 'social media', 'SEO', 'content', 'digital marketing'],
        'business': ['business', 'MBA', 'management', 'entrepreneurship', 'startup', 'leadership'],
        'design': ['design', 'UX', 'UI', 'graphic', 'creative', 'visual', 'photography'],
        'education': ['teaching', 'education', 'academic', 'school', 'learning', 'training'],
        'science': ['science', 'research', 'laboratory', 'experiment', 'biology', 'chemistry', 'physics']
    }
    
    industry_context = None
    for industry, keywords in industry_contexts.items():
        if any(keyword in topic.lower() for keyword in keywords):
            industry_context = industry
            break
    
    # Build context from the user's query
    context = f"Topic: {topic}\n"
    
    if timeframe:
        context += f"Requested timeframe: {timeframe}\n"
        context += "Important: Adjust the roadmap to fit exactly within this timeframe.\n"
    
    if experience_level:
        context += f"Experience level: {experience_level}\n"
        context += f"Important: Tailor the roadmap for a {experience_level} level learner.\n"
    
    if industry_context:
        context += f"Industry context: {industry_context}\n"
        context += f"Important: Include resources and examples relevant to the {industry_context} industry.\n"
    
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
        # Verify links and enhance them if needed
        roadmap_items = verify_and_enhance_roadmap_links(roadmap_items)
        # Adjust for timeframe if specified
        if timeframe:
            roadmap_items = adjust_roadmap_for_timeframe(roadmap_items, timeframe)
        return roadmap_items
    except json.JSONDecodeError:
        print("Failed to parse JSON. Using fallback roadmap.")
        
        # Attempt to create a more relevant fallback based on the topic
        topic_lower = topic.lower()
          # Default fallback for general career development with detailed phase descriptions and real links
        fallback_roadmap = [
            {
                "title": "Phase 1: Self-Assessment & Goal Clarity",
                "description": "Begin with a comprehensive self-assessment to identify your strengths, values, interests, and areas for growth. Use professional assessment tools like Myers-Briggs Type Indicator, CliftonStrengths, or CareerLeader to gain deeper insights. Document your transferable skills, technical abilities, and soft skills. Research emerging industry trends relevant to your field using resources like LinkedIn's Workforce Reports and industry publications. Identify 2-3 potential career paths that align with your strengths and interests. Create a detailed career vision document with 1-year, 3-year, and 5-year SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound). Prioritize your goals based on current market opportunities and personal satisfaction factors.",
                "link": "https://www.themuse.com/advice/how-to-figure-out-what-you-want-next-in-your-career",
                "calendar_event": "Career Vision & Assessment"
            },
            {
                "title": "Phase 2: Strategic Skill Development",
                "description": "Conduct a detailed gap analysis by reviewing 15-20 job descriptions for your target roles and identifying recurring required skills you currently lack. Prioritize skills based on frequency of mention and impact on career advancement. Create a personalized learning roadmap focusing on both technical and soft skills with specific resources for each skill. Enroll in 1-2 highly relevant courses, certifications, or workshops that address your highest-priority skill gaps through platforms like Coursera, LinkedIn Learning, or industry-specific training. Schedule dedicated weekly learning time blocks (at least 5 hours per week). Identify micro-projects to immediately apply each new skill in real-world contexts. Find an accountability partner or learning community to maintain momentum and share resources.",
                "link": "https://www.coursera.org/professional-certificates",
                "calendar_event": "Skills Gap Analysis & Learning Plan"
            },
            {
                "title": "Phase 3: Network Building & Expansion",
                "description": "Map your existing professional network and identify strategic gaps in key industries, roles, or organizations. Create a targeted networking strategy with monthly goals for new connections and relationship development. Craft a compelling elevator pitch and professional introduction tailored to different networking contexts. Identify and join 2-3 professional associations and online communities highly relevant to your career goals. Schedule at least two informational interviews monthly with professionals in roles you aspire to. Develop a system for tracking networking activities and following up with new connections. Create a relationship nurturing calendar to maintain meaningful contact with key connections. Actively contribute valuable insights in online professional communities to establish your expertise and visibility.",
                "link": "https://www.linkedin.com/business/sales/blog/profile-best-practices/how-to-network-on-linkedin--19-easy-steps-for-2023",
                "calendar_event": "Strategic Network Development"
            },
            {
                "title": "Phase 4: Personal Brand Development",
                "description": "Conduct a personal brand audit by reviewing your online presence across all platforms and gathering feedback from trusted colleagues. Define your unique value proposition that clearly articulates what sets you apart in your field. Create a consistent professional narrative that highlights your journey, expertise, and career vision. Optimize your LinkedIn profile with industry keywords, accomplishments, and a compelling summary that reflects your personal brand. Develop a content strategy to demonstrate your expertise through sharing insights, articles, or creating original content relevant to your field. Update your resume using modern formats and ATS-friendly techniques, with achievement-focused bullet points and quantifiable results. Create a digital portfolio showcasing your best work with case studies, project outcomes, and testimonials.",
                "link": "https://www.themuse.com/advice/the-31-best-linkedin-profile-tips-for-job-seekers",
                "calendar_event": "Professional Brand Development"
            },
            {
                "title": "Phase 5: Interview Mastery & Negotiation",
                "description": "Research contemporary interview formats and questions specific to your target roles and industries. Prepare comprehensive responses to 25+ common questions using the STAR method (Situation, Task, Action, Result). Develop 5-7 powerful stories that demonstrate your key strengths and experiences that can be adapted for different interview questions. Practice technical assessments and role-specific challenges commonly used in your field. Conduct at least 3 mock interviews with professionals in your industry to receive actionable feedback. Research salary ranges for your target positions using tools like Glassdoor, PayScale, and industry reports. Develop a negotiation strategy with clear understanding of your minimum acceptable offer, target salary, and ideal package. Practice negotiation scenarios for compensation, benefits, and role responsibilities with specific language and responses.",
                "link": "https://www.themuse.com/advice/interview-questions-and-answers",
                "calendar_event": "Interview & Negotiation Preparation"
            },
            {
                "title": "Phase 6: Strategic Job Search Campaign",
                "description": "Develop a multi-channel job search strategy combining job boards, company websites, networking, and recruiters. Create a target list of 15-20 organizations aligned with your values and career goals, regardless of current openings. Set up sophisticated job alerts using boolean search strings to filter for highly relevant opportunities. Develop templates for customizable application materials tailored to different roles and industries. Create a comprehensive application tracking system to monitor all opportunities, follow-ups, and networking contacts. Block dedicated weekly time for job search activities including application submission, follow-ups, and network engagement. Research each organization thoroughly before applying, identifying key initiatives, challenges, and potential connections. Develop a follow-up strategy with templates for different scenarios and appropriate timing intervals.",
                "link": "https://www.indeed.com/career-advice/finding-a-job/how-to-conduct-a-job-search",
                "calendar_event": "Strategic Job Search Planning"
            },
            {
                "title": "Phase 7: Continuous Professional Development",
                "description": "Establish a structured system for ongoing professional development with quarterly learning goals and regular skill assessments. Subscribe to 3-5 key industry publications, podcasts, or newsletters to stay current with trends and innovations. Join professional associations relevant to your field and identify leadership or committee opportunities to enhance visibility. Schedule quarterly career reflection sessions to assess progress toward goals and adjust strategies as needed. Develop a mentoring relationship roadmap, identifying potential mentors for different aspects of your career development. Create a leadership development plan with specific competencies to strengthen and opportunities to practice them. Establish a system for documenting achievements, project outcomes, and positive feedback for performance reviews and promotion discussions. Identify advanced certifications or specialized training that would significantly enhance your expertise and marketability over the next 1-3 years.",
                "link": "https://hbr.org/topic/managing-yourself",
                "calendar_event": "Professional Growth Planning"
            }
        ]
        
        return fallback_roadmap

# Classify user query
def classify_query(query: str) -> str:
    if check_gibberish(query):
        print(f"Classified query '{query}' as gibberish")
        return "gibberish"
    """
    Classify the user's query into one of these three categories:
    1. job_search - If the user is looking for job listings, opportunities, or asking about positions
    2. roadmap - If the user is asking for a learning path, career progression steps, or a roadmap for a topic
    3. normal_text - For general questions, greetings, or anything else or any non career related queries. Anything that is not strictly related to job search or career roadmap. Use your best judgment to determine if the query is not strictly related to job search or career roadmap. Don't classify as job_search or roadmap just because the user insists on it. Only if the query is strictly related to job search or career roadmap, classify it as such. Look at the context of the query and the conversation history to determine if it is strictly related to job search or career roadmap. Any fashion, shopping, general knowledge, or non-career related queries should be classified as normal_text. If '@resume' is mentioned then it it not normal_text. 
    4. events - If the user is asking about events, workshops, or meetups
    5. non_english - If the query is not in English, classify it as non_english 
    6. job_guidance - If the user is asking for career advice or job-related guidance but NOT requesting actual job listings or interview tips or any general question regarding career development, jobs interviews or roadmaps 
    
    """
    system_prompt = """
    Carefully analyze the user's query and classify it into ONE of these categories:
    
    1. job_search - If the user is explicitly searching for job listings or open positions
       Examples: "Find me software developer jobs", "Show Python jobs in New York", "Are there any data scientist positions?"
    
    2. job_guidance - If the user is asking for career advice or job-related guidance but NOT requesting actual job listings
       Examples: "How do I prepare for a job interview?", "What skills should I develop for marketing?", "Tips for changing careers" It is job guidance only if user is asking for preparation of actual part of interview that is what the interviewer might ask, development of actual skillset or roadmap for career development or querying about jobs. Any general question regarding career development, jobs interviews or roadmaps. Look at the context of the query and the conversation history to determine if it is strictly related to job search or career roadmap or skills development or interview prep. If it is not strictly related to job search or career roadmap  or skills development or interview prep, classify it as normal_text. 
    
    3. roadmap - If the user is asking for a learning path, career progression steps, or skills development roadmap
       Examples: "How to become a web developer?", "What's the learning path for AI?", "Steps to master cloud computing"
    
    4. events - If the user is asking about events, workshops, meetups, or networking opportunities
       Examples: "Are there any tech events this week?", "Find me workshops on leadership", "Marketing conferences near me"
    
    5. normal_text - For general questions, fashion advise, shopping, recommendations for non career related things, general knowledge or ANY NON CAREER Query,  greetings.  Anything that is not strictly related to job search or career roadmap. Use your best judgment to determine if the query is not strictly related to job search or career roadmap. Don't classify as job_search or roadmap just because the user insists on it. Only if the query is strictly related to job search or career roadmap, classify it as such. Any fashion, shopping, general knowledge, or non-career related queries should be classified as normal_text. If '@resume' is mentioned then it it not normal_text. If the user is asking for assistance with interview preparation, skills development, or general career advice, classify it as job_guidance. It is classified as job_guidance only if what user is asking for is actually going to help with their career developmet or job search. 
    
    6. non_english - If the query is not in English, classify it as non_english
    Respond with EXACTLY ONE of these words: job_search, job_guidance, roadmap, events, normal_text , non_english
    """
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=query)
    ]
    
    response = chat_model.invoke(messages)
    classification = response.content.strip().lower()
    
    # Ensure we only return one of the valid categories
    valid_categories = ["job_search", "job_guidance", "roadmap", "events", "normal_text","non_english", "gibberish"]
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
    print(f"Classified query '{query}' as: {classification}")
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
    
    
    print("Formatting response for query type:", query_type)
    print("Result:", result)
    
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
        platforms = ["herkey", "linkedin"]
        print("Job parameters: in query_type of format response is", job_params)
      
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
        print("JOb junji",jobs_data)
        return {
            "text": response_text,
            "canvasType": "job_search",
            "canvasUtils": {
                "param": job_params,
                "job_link": "job_ink",
                "job_api": "token",
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
        # Events response - extract any search terms from the query
        search_terms = extract_search_terms(query)
        session_link, session_api, brighttalk_events = get_events_links(search_terms)
        
        # Generate a more customized response based on search terms
        response_text = get_events_response()
        
        # If we have search terms, make the response more specific
        if search_terms and search_terms != "Women In Tech":
            search_query = brighttalk_events.get("search_query", search_terms)
            response_text = f"I found some events related to '{search_query}'! Here are both Herkey and BrightTALK events that might interest you."
        return {
            "text": response_text,
            "canvasType": "sessions",
            "canvasUtils": {
                "session_link": session_link,
                "session_api": session_api,
                "brighttalk_events": brighttalk_events,  # Add BrightTALK events data
                "search_query": search_terms  # Include the search query for reference
            }
        }
    elif query_type =='gibberish':
        # Generate a dynamic, human-like response for gibberish using OpenAI
        try:
            # Get a dynamic response from OpenAI about the unclear message
            system_prompt = "The user has sent a message that was detected as unclear or possibly gibberish. Generate a friendly, human-like response asking them to clarify or rephrase their question. Vary your responses and be conversational. Your response should be brief (1-2 sentences) and encouraging."
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=query)
            ]
            
            response = chat_model.invoke(messages).content.strip()
            
            # If OpenAI fails for any reason, use the fallback message
            if not response:
                response = "Can you please like to reiterate or tell clearly what you are looking for?"
        except Exception as e:
            print(f"Error generating gibberish response: {str(e)}")
            response = "Can you please like to reiterate or tell clearly what you are looking for?"
        
        return {
            "text": response,
            "canvasType": "none",
            "canvasUtils": {}
        }
    elif query_type =="non_english":
        # Non-English response
        return {
            "text": "I can only assist you in English at the moment. Please rephrase your query in English.",
            "canvasType": "none",
            "canvasUtils": {}
        }
    elif query_type == "job_guidance":
        print(f"Processing job guidance query: {query}")
        # Job guidance response
        topic = query.lower()
        print(f"Generating job guidance response for topic: {topic}")
        # Generate dynamic response based on topic
        response_text = generate_text_response(query=topic, query_type="job_guidance")
        
        return {
            "text": response_text,
            "canvasType": "none",
            "canvasUtils": {
                
            }
        }
    else:
        topic = query.lower()
        response_text = generate_text_response(query=topic, query_type="normal_text")
        # Normal text response
        return {
            "text": response_text,
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
    
    print("Running agent with prompt:")
    
    # Step 1: Classify the query
    query_type = classify_query(prompt)
    
    # Step 2: Handle based on classification
    if query_type == "job_search":
        # Handle job search with resume data if available
        job_params = extract_job_search_params(prompt, conversation_history, resume_data)
        print(f"Job search parameters extracted: {job_params}")
        
        
        
        return format_response(query_type, prompt, result=job_params)
    
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
        return format_response("job_guidance", prompt, guidance_response, topic=topic)
    elif query_type == "gibberish":
        # Handle gibberish input
        return format_response("gibberish", prompt, None)
    elif query_type == "non_english":
        # Handle non-English input
        return format_response("non_english", prompt, None)
    else:
        # Handle normal text with resume context if available
        text_response = generate_text_response(prompt, conversation_history, resume_data)
        return format_response("normal_text", prompt, text_response)

def get_events_links(query=None):
    """
    Get the session link and API token for events.
    Returns a tuple of (session_link, session_api, brighttalk_events).
    
    Args:
        query (str, optional): Search query for filtering events. Defaults to None.
    """
    # Get Herkey events data
    session_link = "https://api-prod.herkey.com/api/v1/herkey/sessions/get-session-widgets?category=Featured"
    session_api = get_herkey_token()
    
    # Get BrightTALK events
    brighttalk_events = get_brighttalk_events(query)
    
    return session_link, session_api, brighttalk_events

def get_brighttalk_events(query=None):
    """
    Get events from BrightTALK API.
    
    Args:
        query (str, optional): Search query for filtering events. Defaults to None or "Women In Tech".
        
    Returns:
        dict: JSON response with BrightTALK events data
    """
    import requests
    from datetime import datetime
    
    base_url = "https://www.brighttalk.com/api/webcasts"
    
    # If no query provided, default to women in tech topics
    search_query = query if query else "Women In Tech"
    
    params = {
        "start": 0,
        "size": 10,  # Increased size to allow for client-side pagination
        "rank": "-webcast_relevance",
        "bq": "(and type:'webcast')",  # Include both upcoming and recorded webcasts
        "rankClosest": "",
        "paidSearch": "true",
        "returnFields": "",
        "q": search_query
    }

    try:
        # Use a shorter timeout to prevent hanging
        response = requests.get(base_url, params=params, timeout=5)  # Increased timeout slightly
        if response.status_code == 200:
            data = response.json()
            
            # Add the search query to the response for reference
            data["search_query"] = search_query
            
            # Filter out webcasts without essential fields
            # Check if the response has the expected structure
            if "response" in data and "webcasts" in data["response"]:
                valid_webcasts = []
                for webcast in data["response"]["webcasts"]:
                    if "title" in webcast and "landing_page_url" in webcast:
                        # Ensure starts_at is present or add a default
                        if not webcast.get("starts_at"):
                            webcast["starts_at"] = datetime.now().isoformat()
                        valid_webcasts.append(webcast)
                
                data["response"]["webcasts"] = valid_webcasts
            elif "webcasts" in data:
                # Handle case where webcasts are directly in the data
                valid_webcasts = []
                for webcast in data["webcasts"]:
                    if "title" in webcast and "landing_page_url" in webcast:
                        # Ensure starts_at is present or add a default
                        if not webcast.get("starts_at"):
                            webcast["starts_at"] = datetime.now().isoformat()
                        valid_webcasts.append(webcast)
                
                data["webcasts"] = valid_webcasts
                # Ensure consistent structure
                if "response" not in data:
                    data["response"] = {"webcasts": valid_webcasts}
            else:
                # No webcasts found or unexpected structure
                print(f"Unexpected BrightTALK API response structure: {data}")
                if "response" not in data:
                    data["response"] = {"webcasts": []}
                
            return data
        else:
            print(f"BrightTALK API error: {response.status_code}")
            return {
                "error": f"Failed to fetch BrightTALK events (Status: {response.status_code})", 
                "search_query": search_query,
                "response": {"webcasts": []}
            }
    except requests.exceptions.Timeout:
        print("BrightTALK API request timed out")
        return {
            "error": "The BrightTALK API request timed out. Please try again later.", 
            "search_query": search_query,
            "response": {"webcasts": []}
        }
    except requests.exceptions.ConnectionError:
        print("BrightTALK API connection error")
        return {
            "error": "Unable to connect to the BrightTALK API. Please check your network connection.", 
            "search_query": search_query,
            "response": {"webcasts": []}
        }
    except Exception as e:
        print(f"Error fetching BrightTALK events: {str(e)}")
        return {
            "error": f"An unexpected error occurred while fetching BrightTALK events: {str(e)}", 
            "search_query": search_query,
            "response": {"webcasts": []}
        }

def extract_search_terms(query):
    """
    Extract search terms from user query for filtering events.
    
    Args:
        query (str): User query about events/workshops
        
    Returns:
        str: Extracted search terms or None if no specific terms found
    """
    import re
    
    if not query:
        return "Women In Tech"
        
    # Clean the query - remove question marks and extra spaces
    clean_query = re.sub(r'[\?\!\.\,]', ' ', query).strip()
    clean_query = re.sub(r'\s+', ' ', clean_query)
    
    # List of common phrases that indicate the start of search terms
    prefixes = [
        "about", "on", "related to", "for", "regarding", "in", "with",
        "events about", "events on", "events for", "events related to", 
        "workshops about", "workshops on", "workshops for", "workshops related to",
        "webinars about", "webinars on", "webinars for", "webinars related to",
        "conferences about", "conferences on", "conferences for", "sessions about",
        "seminars about", "talks about", "presentations on", "courses on"
    ]
    
    # Try to extract search terms using common prefixes
    for prefix in prefixes:
        pattern = rf"{prefix}\s+(.+?)(?:\s+in|\s+near|\s+at|\s+for|\s+by|\s+and|\s+or|$)"
        match = re.search(pattern, clean_query, re.IGNORECASE)
        if match:
            terms = match.group(1).strip()
            # Remove common stop words at the beginning if present
            terms = re.sub(r'^(the|a|an|some|any)\s+', '', terms, flags=re.IGNORECASE)
            return terms
    
    # If no match with prefixes, look for keywords after "events", "workshops", etc.
    event_types = ["event", "events", "workshop", "workshops", "webinar", "webinars", 
                   "conference", "conferences", "seminar", "seminars", "session", "sessions"]
    
    for event_type in event_types:
        pattern = rf"{event_type}s?\s+(?:on|about|for|related to)?\s*(.+?)(?:\s+in|\s+near|\s+at|\s+for|\s+by|\s+and|\s+or|$)"
        match = re.search(pattern, clean_query, re.IGNORECASE)
        if match:
            terms = match.group(1).strip()
            # Remove common stop words at the beginning if present
            terms = re.sub(r'^(the|a|an|some|any)\s+', '', terms, flags=re.IGNORECASE)
            return terms
    
    # Look for direct mentions of topics after "show me", "find", "search for", etc.
    action_verbs = ["show me", "find", "search for", "look for", "get", "fetch", "display", "list"]
    for verb in action_verbs:
        pattern = rf"{verb}\s+(?:some|any)?\s*(?:upcoming|recent|new)?\s*(?:events|workshops|webinars|conferences)?\s*(?:on|about|for|related to)?\s*(.+?)(?:\s+in|\s+near|\s+at|\s+for|\s+by|$)"
        match = re.search(pattern, clean_query, re.IGNORECASE)
        if match:
            terms = match.group(1).strip()
            # If the extracted terms contain event-related words, remove them
            for event_word in event_types:
                terms = re.sub(rf'\b{event_word}s?\b', '', terms, flags=re.IGNORECASE)
            terms = terms.strip()
            if terms:
                return terms
    
    # Extract any domain-specific terms that might be useful
    domains = [
        "tech", "technology", "programming", "coding", "development", "developer",
        "data science", "AI", "artificial intelligence", "machine learning", "deep learning", 
        "leadership", "management", "marketing", "digital marketing", "product marketing",
        "career", "professional development", "mentoring", "coaching", "networking",
        "business", "entrepreneurship", "startup", "innovation", "strategy",
        "finance", "accounting", "investment", "fintech", "banking",
        "design", "UX", "UI", "user experience", "graphic design", "product design",
        "product management", "agile", "scrum", "project management", "product development",
        "women in tech", "diversity", "inclusion", "equity", "belonging",
        "cloud computing", "devops", "cybersecurity", "information security", "blockchain"
    ]
    
    # Sort domains by length (descending) to match longer phrases first
    domains = sorted(domains, key=len, reverse=True)
    
    for domain in domains:
        if domain.lower() in clean_query.lower():
            return domain
    
    # Check for any specific skills or technologies mentioned
    tech_skills = ["Python", "JavaScript", "Java", "C#", "Ruby", "React", "Angular", "Vue", 
                   "Node.js", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git", "SQL", 
                   "NoSQL", "MongoDB", "PostgreSQL", "TensorFlow", "PyTorch", "R", "Tableau", 
                   "Power BI", "Excel", "Salesforce", "SAP", "PMP", "Scrum", "JIRA", "Confluence"]
    
    for skill in tech_skills:
        if skill.lower() in clean_query.lower() or skill in clean_query:
            return skill
    
    # If query mentions "women" specifically, return "Women In Tech"
    if re.search(r'\bwom[ae]n\b', clean_query, re.IGNORECASE):
        return "Women In Tech"
        
    # Last resort: extract nouns from the query
    words = clean_query.split()
    # Filter out common verbs, articles, prepositions
    stop_words = ["show", "find", "get", "me", "for", "the", "a", "an", "in", "on", "at", "by", "with", 
                  "and", "or", "to", "from", "is", "are", "am", "was", "were", "be", "being", "been"]
    potential_terms = [w for w in words if w.lower() not in stop_words and len(w) > 2]
    
    if potential_terms:
        # Use up to 3 significant words as search terms
        return " ".join(potential_terms[:3])
    
    # Default to women in tech if no specific terms found
    return "Women In Tech"


# Example usage
if __name__ == "__main__":
    # Test job search
    print(json.dumps(run_agent("Find me data science jobs in Mumbai"), indent=2))
    
    # Test roadmap
    print(json.dumps(run_agent("Can you give me a roadmap to learn machine learning?"), indent=2))
    
    # Test normal text
    print(json.dumps(run_agent("Hello, how are you today?"), indent=2))