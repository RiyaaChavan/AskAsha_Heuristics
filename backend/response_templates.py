"""
Response templates for different types of user queries.
These templates help create more dynamic and varied responses.
"""

import random
from datetime import datetime
ABBREVIATION_MAP = {
    # Degrees & Education
    "BE": "Bachelor of Engineering",
    "BTECH": "Bachelor of Technology",
    "ME": "Master of Engineering",
    "MTECH": "Master of Technology",
    "MBA": "Master of Business Administration",
    "BA": "Bachelor of Arts",
    "MA": "Master of Arts",
    "BSC": "Bachelor of Science",
    "MSC": "Master of Science",
    "BS": "Bachelor of Science",
    "MS": "Master of Science",
    "PhD": "Doctor of Philosophy",
    "UG": "Undergraduate",
    "PG": "Postgraduate",
    "HSC": "Higher Secondary Certificate",
    "SSC": "Secondary School Certificate",
    "CGPA": "Cumulative Grade Point Average",
    "GPA": "Grade Point Average",
    "GRE": "Graduate Record Examination",
    "IELTS": "International English Language Testing System",
    "TOEFL": "Test of English as a Foreign Language",

    # Fields of Study
    "CSE": "Computer Science and Engineering",
    "IT": "Information Technology",
    "CS": "Computer Science",
    "ECE": "Electronics and Communication Engineering",
    "EEE": "Electrical and Electronics Engineering",
    "MECH": "Mechanical Engineering",
    "CIVIL": "Civil Engineering",
    "BIO": "Biotechnology",
    "AI": "Artificial Intelligence",
    "ML": "Machine Learning",
    "DS": "Data Science",
    "CV": "Computer Vision",
    "NLP": "Natural Language Processing",
    "UX": "User Experience",
    "UI": "User Interface",
    "SE": "Software Engineering",
    "IS": "Information Systems",
    "QA": "Quality Assurance",

    # Job Titles & Roles
    "PM": "Product Manager",
    "TPM": "Technical Program Manager",
    "SDE": "Software Development Engineer",
    "HR": "Human Resources",
    "SD": "Software Developer",
    "BA": "Business Analyst",
    "DA": "Data Analyst",
    "DS": "Data Scientist",
    "DE": "Data Engineer",
    "PO": "Product Owner",
    "QA": "Quality Analyst",
    "SM": "Scrum Master",

    # Companies & Recruitment
    "FAANG": "Facebook Amazon Apple Netflix Google",
    "ATS": "Applicant Tracking System",
    "JD": "Job Description",
    "CV": "Curriculum Vitae",
    "CTC": "Cost to Company",
    "LPA": "Lakhs Per Annum",
    "YOE": "Years of Experience",
    "FTE": "Full Time Equivalent",
    "WFH": "Work From Home",
    "WFO": "Work From Office",
    "RTO": "Return To Office",
    "DOE": "Depends on Experience",
    "NOC": "No Objection Certificate",
    "PAN": "Permanent Account Number",
    "ID": "Identification Document",

    # Certifications
    "AWS": "Amazon Web Services",
    "AZURE": "Microsoft Azure",
    "GCP": "Google Cloud Platform",
    "PMP": "Project Management Professional",
    "CFA": "Chartered Financial Analyst",
    "CPA": "Certified Public Accountant",
    "CISSP": "Certified Information Systems Security Professional",
    "CEH": "Certified Ethical Hacker",
    "ITIL": "Information Technology Infrastructure Library",
    "CSPO": "Certified Scrum Product Owner",
    "PSM": "Professional Scrum Master",
    "CBAP": "Certified Business Analysis Professional",

    # Work & Process
    "KPI": "Key Performance Indicator",
    "OKR": "Objectives and Key Results",
    "RACI": "Responsible Accountable Consulted Informed",
    "SLA": "Service Level Agreement",
    "TAT": "Turnaround Time",
    "PIP": "Performance Improvement Plan",
    "SOW": "Statement of Work",
    "RFP": "Request for Proposal",
    "RFI": "Request for Information",
    "JIRA": "JIRA Software (issue tracking tool)",

    # Technical Terms
    "API": "Application Programming Interface",
    "DBMS": "Database Management System",
    "OOP": "Object Oriented Programming",
    "CI": "Continuous Integration",
    "CD": "Continuous Deployment",
    "IDE": "Integrated Development Environment",
    "OS": "Operating System",
    "DB": "Database",
    "SDK": "Software Development Kit",
    "UI": "User Interface",
    "UX": "User Experience",

    # Communication & Tools
    "MS": "Microsoft",
    "MSWORD": "Microsoft Word",
    "PPT": "PowerPoint Presentation",
    "PDF": "Portable Document Format",
    "VC": "Video Conference",
    "GD": "Group Discussion",
    "PI": "Personal Interview",
    "HRR": "HR Round",
}


# Job search response templates
JOB_SEARCH_SUCCESS = [
    "Great news! I found {job_count} relevant {role} opportunities{location_str}{platform_str}! Here are some positions that might interest you.",
    "I've discovered {job_count} {role} positions{location_str}{platform_str} that match your criteria. Take a look!",
    "There are {job_count} {role} openings{location_str}{platform_str} available right now. Check these out!",
    "Success! Found {job_count} {role} jobs{location_str}{platform_str} that you might be interested in.",
    "Good timing! {job_count} {role} positions{location_str}{platform_str} are currently open for applications."
]

JOB_SEARCH_SUCCESS_RESUME = [
    "Based on your resume, I found {job_count} {role} opportunities{location_str}{platform_str} that match your skills!",
    "Using your profile details, I've discovered {job_count} {role} positions{location_str}{platform_str} that align with your experience.",
    "Great news! Your resume qualifications match {job_count} open {role} positions{location_str}{platform_str}.",
    "Your skills and experience match {job_count} current {role} openings{location_str}{platform_str}!",
    "Perfect! Found {job_count} {role} jobs{location_str}{platform_str} that align with your professional background."
]

JOB_SEARCH_EMPTY = [
    "I couldn't find any {role} opportunities{location_str}{platform_str} at the moment. Maybe try broadening your search?",
    "No matches found for {role}{location_str}{platform_str} right now. Consider trying related keywords or expanding your search area.",
    "It appears there aren't any {role} positions{location_str}{platform_str} currently available. How about trying a different role or location?",
    "I don't see any {role} openings{location_str}{platform_str} at this time. Would you like to search for something similar?",
    "No {role} jobs{location_str}{platform_str} available right now. Let me know if you'd like suggestions for related positions."
]

JOB_SEARCH_EMPTY_RESUME = [
    "I couldn't find exact matches for '{role}'{location_str}{platform_str} based on your resume. Try broadening your search or adding more skills to your profile.",
    "Your resume skills don't have exact matches with current {role} openings{location_str}{platform_str}. Consider exploring related roles.",
    "No perfect matches between your resume and {role} positions{location_str}{platform_str} at the moment. Would you like suggestions for related roles?",
    "I don't see any {role} opportunities{location_str}{platform_str} that align with your profile right now. Perhaps try a broader search?",
    "Your qualifications don't have current matches in {role}{location_str}{platform_str}. Would you like to explore adjacent career paths?"
]

# Add templates highlighting platform capabilities
PLATFORM_HIGHLIGHT_TEMPLATES = [
    "I've searched across multiple job platforms including Herkey for the best matches. Herkey jobs are displayed first.",
    "Results include jobs from multiple sources, with Herkey positions prioritized at the top.",
    "You're seeing jobs from Herkey and other platforms, with the ability to filter by platform.",
    "I've gathered opportunities from multiple job platforms, with Herkey jobs shown first for your convenience.",
    "Jobs from Herkey and other platforms are displayed, prioritizing the most relevant matches."
]

# Roadmap response templates
ROADMAP_RESPONSES = [
    "## Your Path to Mastering {topic}\n\nI've created a detailed, **phase-by-phase roadmap** for mastering {topic}. Each stage includes specific activities, practical exercises, and verified online resources from trusted platforms to help you progress effectively. Please explore each phase below to see what skills you'll develop and which industry-recognized resources will support your journey.\n\n> This personalized roadmap will guide you from beginner to advanced level with carefully curated resources.",
    
    "# {topic} Learning Journey\n\nHere's your personalized learning path for {topic}, with comprehensive phases that build progressively. Each phase includes detailed instructions, skill-building activities, and links to high-quality resources from established educational platforms relevant to your journey.\n\n**This roadmap is designed to systematically build your expertise** from foundational concepts to advanced applications.",
    
    "## Master {topic}: Your Complete Roadmap\n\nReady to master {topic}? I've mapped out a comprehensive learning journey with detailed guidance at each phase and carefully selected resources from reputable websites to support your development.\n\n* Each phase introduces specific concepts and skills\n* Progressive learning path ensures logical skill development\n* Resources are carefully selected from trusted platforms\n\nLet's begin your journey to {topic} mastery!",
    
    "# Your {topic} Proficiency Roadmap\n\nYour roadmap to {topic} proficiency is ready! This structured plan includes **detailed instructions** for each phase and **links to verified, relevant resources** to help you develop your skills systematically.\n\nI've focused on resources from industry-leading platforms that will provide you with both theoretical knowledge and practical skills needed for real-world application.",
    
    "## Structured Learning Path: {topic}\n\nHere's a structured learning path for {topic}, with detailed phase-wise instructions and carefully selected online resources from trusted websites. Each phase builds on the previous one to ensure steady progress.\n\n> I've designed this roadmap to include a mix of learning approaches: conceptual understanding, practical application, and opportunities to demonstrate your new skills through projects."
]

# Events response templates
EVENTS_RESPONSES = [
    "I found some upcoming events related to your interests! Click the toggle to view them.",
    "There are several workshops and meetups coming up that might interest you. Check them out!",
    "Looking to network or learn something new? I've found relevant events for you.",
    "Expand your horizons with these upcoming events related to your query.",
    "Connect with like-minded professionals at these upcoming events and workshops."
]

# General response templates for job guidance (not job search)
JOB_GUIDANCE_RESPONSES = [
    "I'd be happy to provide guidance on your career path. Here are some thoughts on {topic}.",
    "When it comes to {topic} in your career, there are several approaches to consider.",
    "Career development in {topic} requires strategic planning. Here's my advice.",
    "Looking to advance in {topic}? Let me share some professional insights.",
    "For your {topic} career questions, I'd suggest focusing on these key areas.",
    "Based on current industry trends, here's what you should know about {topic} in your career journey.",
    "Many professionals wonder about {topic}. Here's what my research indicates would be most helpful.",
    "I understand navigating {topic} can be challenging. Let me offer some practical guidance.",
    "To excel in {topic}, consider these professional development strategies.",
    "Your interest in {topic} shows great initiative. Here are some targeted suggestions."
]

# Resume-focused job guidance responses
RESUME_JOB_GUIDANCE_RESPONSES = [
    "Looking at your resume, I can offer these specific insights about {topic} for your career path.",
    "Your experience in {skills} provides a great foundation for addressing {topic} in your career.",
    "Based on your professional background, here's my personalized guidance on {topic}.",
    "With your skills in {skills}, my advice for {topic} would be tailored this way.",
    "Your resume shows valuable experience that relates to {topic}. Here's what I suggest."
]

# Greeting variations for different times of day
MORNING_GREETINGS = [
    "Good morning",
    "Morning",
    "Hello, hope you're having a good morning",
    "Hi there, ready for a productive day?",
    "Hello! It's a fresh new day"
]

AFTERNOON_GREETINGS = [
    "Good afternoon", 
    "Hello",
    "Hi there", 
    "Hope your day is going well",
    "Hello! How can I help this afternoon?"
]

EVENING_GREETINGS = [
    "Good evening", 
    "Hello", 
    "Hi there",
    "Evening! How can I assist you?",
    "Hello! Hope you've had a good day"
]

def get_greeting():
    """Return a time-appropriate greeting"""
    hour = datetime.now().hour
    if 5 <= hour < 12:
        return random.choice(MORNING_GREETINGS)
    elif 12 <= hour < 18:
        return random.choice(AFTERNOON_GREETINGS)
    else:
        return random.choice(EVENING_GREETINGS)

def get_job_search_response(job_count, role, location, is_resume_search, platforms=None):
    """
    Generate a dynamic job search response
    
    Args:
        job_count (int): Number of jobs found
        role (str): Job role/title being searched
        location (str): Location being searched
        is_resume_search (bool): Whether the search is based on resume
        platforms (list, optional): List of platforms searched
    """
    location_str = f" in {location}" if location else ""
    platform_str = ""
    
    if platforms:
        if len(platforms) == 1:
            platform_str = f" on {platforms[0].capitalize()}"
        elif len(platforms) > 1:
            platform_names = [p.capitalize() for p in platforms]
            platform_str = f" across {', '.join(platform_names[:-1])} and {platform_names[-1]}"
    
    # Select basic response based on results and search type
    if job_count > 0:
        if is_resume_search:
            response = random.choice(JOB_SEARCH_SUCCESS_RESUME).format(
                job_count=job_count, role=role, location_str=location_str, platform_str=platform_str
            )
        else:
            response = random.choice(JOB_SEARCH_SUCCESS).format(
                job_count=job_count, role=role, location_str=location_str, platform_str=platform_str
            )
            
        # Add platform highlight for multi-platform searches
        if platforms and len(platforms) > 1 and 'herkey' in [p.lower() for p in platforms]:
            response += f" {random.choice(PLATFORM_HIGHLIGHT_TEMPLATES)}"
            
        return response
    else:
        if is_resume_search:
            return random.choice(JOB_SEARCH_EMPTY_RESUME).format(
                role=role, location_str=location_str, platform_str=platform_str
            )
        else:
            return random.choice(JOB_SEARCH_EMPTY).format(
                role=role, location_str=location_str, platform_str=platform_str
            )

def get_roadmap_response(topic):
    """Generate a dynamic roadmap response"""
    return random.choice(ROADMAP_RESPONSES).format(topic=topic)

def get_events_response():
    """Generate a dynamic events response"""
    return random.choice(EVENTS_RESPONSES)

def get_job_guidance_response(topic, skills=None, resume_context=False):
    """
    Generate a dynamic job guidance response
    
    Args:
        topic (str): The main topic of the guidance
        skills (list, optional): List of user's skills from resume
        resume_context (bool): Whether this is a resume-context query
    """
    if resume_context and skills:
        # Use random skills (up to 3) for personalization
        if isinstance(skills, list) and skills:
            sample_size = min(3, len(skills))
            selected_skills = ", ".join(random.sample(skills, sample_size))
            return random.choice(RESUME_JOB_GUIDANCE_RESPONSES).format(
                topic=topic, skills=selected_skills
            )
    
    return random.choice(JOB_GUIDANCE_RESPONSES).format(topic=topic)
