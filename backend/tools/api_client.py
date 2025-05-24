# tools/api_client.py
import requests
import json
import os
import random
from datetime import datetime, timedelta

# Try to import Config, but provide fallback if not available
try:
    from config import Config
    HERKEY_API_BASE_URL = Config.HERKEY_API_BASE_URL
except (ImportError, AttributeError):
    HERKEY_API_BASE_URL = "https://api-prod.herkey.com/api/v1/herkey"

class HerkeyAPIClient:
    def __init__(self):
        self.base_url = HERKEY_API_BASE_URL
        self.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    
    def search_jobs(self, query_params):
        """
        Search for jobs on HerKey platform
        
        Args:
            query_params (dict): Parameters for job search
            
        Returns:
            dict: API response with job results including links
        """
        endpoint = f"{self.base_url}/jobs/es_candidate_jobs"
        
        # Get token for authorization
        from ..agent import get_herkey_token
        token = get_herkey_token()
        headers = {
            'Authorization': f'Token {token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        # Filter and limit parameters to avoid overparameterization
        # Only use the most essential parameters to keep search broad
        filtered_params = {}
        
        # Always include pagination
        filtered_params['page_no'] = query_params.get('page_no', 1)
        filtered_params['page_size'] = min(query_params.get('page_size', 15), 25)  # Cap at 25
        
        # Always include global query setting
        filtered_params['is_global_query'] = query_params.get('is_global_query', 'false')
        
        # Include keyword (most important for relevance)
        if query_params.get('keyword'):
            filtered_params['keyword'] = query_params['keyword']
        
        # Include location only if specified (don't make it too restrictive)
        if query_params.get('location_name'):
            filtered_params['location_name'] = query_params['location_name']
        
        # Include work mode only if specified
        if query_params.get('work_mode') and query_params['work_mode'] in ['work_from_home', 'work_from_office', 'hybrid', 'freelance']:
            filtered_params['work_mode'] = query_params['work_mode']
        
        # Include job type only if specified
        if query_params.get('job_types') and query_params['job_types'] in ['full_time', 'part_time', 'freelance', 'returnee_program', 'volunteer']:
            filtered_params['job_types'] = query_params['job_types']
        
        # Include skills but keep it broad (limit to 3-5 main skills)
        if query_params.get('job_skills'):
            skills = query_params['job_skills']
            if isinstance(skills, str):
                # Limit to first 3 skills to avoid being too specific
                skill_list = [s.strip() for s in skills.split(',')][:3]
                filtered_params['job_skills'] = ', '.join(skill_list)
            else:
                filtered_params['job_skills'] = skills
        
        # AVOID these parameters as they make search too niche:
        # - industries (too restrictive)
        # - company_name (too specific)
        # - min_year, max_year (can filter out good matches)
        # - salary_min, salary_max (can be too restrictive)
        
        print(f"HerKey API request with filtered params: {filtered_params}")
        
        try:
            response = requests.get(endpoint, params=filtered_params, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Add platform identifier to each job
                if "body" in data and isinstance(data["body"], list):
                    for job in data["body"]:
                        # Add platform information
                        job["platform"] = "herkey"
                        
                        # Create platform-specific job URL if not provided
                        if "id" in job and "title" in job and job["title"]:
                            formatted_title = job["title"].lower().replace(" ", "-").replace("/", "-")
                            job["platform_job_url"] = f"https://www.herkey.com/jobs/{formatted_title}/{job['id']}"
                
                print(f"HerKey API returned {len(data.get('body', []))} jobs")
                return data
            else:
                error_msg = f"HerKey API request failed with status code: {response.status_code}"
                if response.status_code == 404:
                    error_msg += " - Endpoint not found"
                elif response.status_code == 401:
                    error_msg += " - Authentication failed"
                elif response.status_code == 403:
                    error_msg += " - Access forbidden"
                
                print(f"HerKey API Error: {error_msg}")
                print(f"Response content: {response.text[:500]}")
                
                return {
                    "response_code": 400,
                    "message": error_msg,
                    "body": []
                }
        except requests.exceptions.Timeout:
            return {
                "response_code": 400,
                "message": "HerKey API request timed out",
                "body": []
            }
        except requests.exceptions.RequestException as e:
            return {
                "response_code": 400,
                "message": f"HerKey API request failed: {str(e)}",
                "body": []
            }

class LinkedInJobsClient:
    """Client for searching LinkedIn jobs"""
    
    def __init__(self):
        self.base_url = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
        
    def search_jobs(self, query_params):
        """
        Search for jobs on LinkedIn (simulated for demonstration)
        
        Args:
            query_params (dict): Parameters for job search
            
        Returns:
            dict: Standardized job results in Herkey-compatible format
        """
        # Convert Herkey params to LinkedIn format
        linkedin_params = {
            "keywords": query_params.get("keyword", ""),
            "location": query_params.get("location_name", ""),
            "pageNum": query_params.get("page_no", 0),
            "start": (int(query_params.get("page_no", 1)) - 1) * int(query_params.get("page_size", 15))
        }
        
        # For demonstration, we'll create simulated LinkedIn job results
        # In a real implementation, this would make an API call to LinkedIn
        
        # Create simulated job data with LinkedIn format
        job_count = min(int(query_params.get("page_size", 15)), 10)  # Limit to 10 jobs for demo
        simulated_jobs = []
        
        job_titles = [
            "Software Engineer", "Data Scientist", "Product Manager", 
            "UX Designer", "Marketing Specialist", "Content Writer",
            "Project Manager", "Business Analyst", "Sales Representative",
            "Customer Success Manager"
        ]
        
        companies = [
            "LinkedIn", "Microsoft", "Google", "Amazon", "Facebook",
            "Netflix", "Adobe", "Twitter", "Salesforce", "IBM"
        ]
        
        locations = [
            "San Francisco, CA", "New York, NY", "Seattle, WA",
            "Austin, TX", "Boston, MA", "Chicago, IL",
            "Los Angeles, CA", "Denver, CO", "Atlanta, GA",
            "Remote"
        ]
        
        skills_lists = [
            ["Python", "Java", "JavaScript", "SQL", "AWS"],
            ["Data Analysis", "Machine Learning", "SQL", "Python", "R"],
            ["Product Strategy", "Agile", "User Research", "Roadmapping"],
            ["UI/UX", "Figma", "User Research", "Prototyping"],
            ["Digital Marketing", "SEO", "Social Media", "Content Strategy"],
            ["Content Creation", "Editing", "SEO", "Research"],
            ["Project Management", "Agile", "Scrum", "Jira", "Budgeting"],
            ["Requirements Gathering", "SQL", "Data Analysis", "Reporting"],
            ["Sales", "Negotiation", "CRM", "Prospecting"],
            ["Customer Service", "Retention", "Upselling", "Relationship Management"]
        ]
        
        # Filter by keyword if provided
        keyword = query_params.get("keyword", "").lower()
        filtered_titles = [title for title in job_titles if keyword in title.lower()]
        
        if filtered_titles:
            job_titles = filtered_titles
        
        # Filter by location if provided
        location = query_params.get("location_name", "").lower()
        if location:
            filtered_locations = [loc for loc in locations if location in loc.lower()]
            if filtered_locations:
                locations = filtered_locations
        
        # Generate job listings
        for i in range(job_count):
            title_idx = i % len(job_titles)
            company_idx = i % len(companies)
            location_idx = i % len(locations)
            skills_idx = i % len(skills_lists)
            
            # Create simulated LinkedIn job ID
            job_id = f"linkedin-{random.randint(1000000, 9999999)}"
            
            # Create job posting date (within last 30 days)
            days_ago = random.randint(0, 30)
            post_date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
            
            job = {
                "id": job_id,
                "title": job_titles[title_idx],
                "company_name": companies[company_idx],
                "location_name": locations[location_idx],
                "skills": skills_lists[skills_idx],
                "status": "Active",
                "platform": "linkedin",
                "platform_job_url": f"https://www.linkedin.com/jobs/view/{job_id}",
                "min_year": random.randint(1, 5),
                "max_year": random.randint(5, 10),
                "work_mode": random.choice(["remote", "onsite", "hybrid"]),
                "job_types": random.choice(["full_time", "part_time", "contract"]),
                "posted_on": post_date
            }
            
            simulated_jobs.append(job)
        
        # Return in Herkey-compatible format
        return {
            "response_code": 10100,
            "message": "Success",
            "body": simulated_jobs
        }

class GlassdoorJobsClient:
    """Client for searching Glassdoor jobs"""
    
    def __init__(self):
        self.base_url = "https://www.glassdoor.com/Job/jobs.htm"
        
    def search_jobs(self, query_params):
        """
        Search for jobs on Glassdoor (simulated for demonstration)
        
        Args:
            query_params (dict): Parameters for job search
            
        Returns:
            dict: Standardized job results in Herkey-compatible format
        """
        # Convert Herkey params to Glassdoor format
        glassdoor_params = {
            "sc.keyword": query_params.get("keyword", ""),
            "locT": "C",
            "locId": 0,
            "locKeyword": query_params.get("location_name", ""),
            "jobType": "",
            "fromAge": -1
        }
        
        # For demonstration, we'll create simulated Glassdoor job results
        # In a real implementation, this would make an API call to Glassdoor
        
        # Create simulated job data with Glassdoor format
        job_count = min(int(query_params.get("page_size", 15)), 10)  # Limit to 10 jobs for demo
        simulated_jobs = []
        
        job_titles = [
            "Frontend Developer", "Backend Engineer", "Full Stack Developer", 
            "DevOps Engineer", "Data Engineer", "Machine Learning Engineer",
            "Technical Writer", "QA Engineer", "Security Engineer",
            "Mobile Developer"
        ]
        
        companies = [
            "Glassdoor", "Apple", "Intel", "Nvidia", "Oracle",
            "Airbnb", "Uber", "Lyft", "Dropbox", "Slack"
        ]
        
        locations = [
            "Mountain View, CA", "Cupertino, CA", "Palo Alto, CA",
            "Menlo Park, CA", "Redmond, WA", "Cambridge, MA",
            "Remote", "Hybrid - San Francisco", "Dallas, TX",
            "Miami, FL"
        ]
        
        skills_lists = [
            ["React", "JavaScript", "CSS", "HTML", "TypeScript"],
            ["Node.js", "Python", "Java", "Go", "Microservices"],
            ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB"],
            ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD"],
            ["SQL", "Python", "Spark", "Hadoop", "ETL"],
            ["TensorFlow", "PyTorch", "Python", "Statistics", "NLP"],
            ["Documentation", "API", "Technical Writing", "Markdown"],
            ["Selenium", "Testing", "JIRA", "Test Automation"],
            ["Cybersecurity", "Network Security", "Ethical Hacking"],
            ["React Native", "Swift", "Kotlin", "Flutter", "Mobile Design"]
        ]
        
        # Filter by keyword if provided
        keyword = query_params.get("keyword", "").lower()
        filtered_titles = [title for title in job_titles if keyword in title.lower()]
        
        if filtered_titles:
            job_titles = filtered_titles
        
        # Filter by location if provided
        location = query_params.get("location_name", "").lower()
        if location:
            filtered_locations = [loc for loc in locations if location in loc.lower()]
            if filtered_locations:
                locations = filtered_locations
        
        # Generate job listings
        for i in range(job_count):
            title_idx = i % len(job_titles)
            company_idx = i % len(companies)
            location_idx = i % len(locations)
            skills_idx = i % len(skills_lists)
            
            # Create simulated Glassdoor job ID
            job_id = random.randint(1000000, 9999999)
            
            # Generate some random details
            salary_min = random.randint(70, 150) * 1000
            salary_max = salary_min + random.randint(10, 50) * 1000
            
            # Create job posting date (within last 30 days)
            days_ago = random.randint(0, 30)
            post_date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
            
            # Create company ratings
            rating = round(3.0 + random.random() * 2.0, 1)  # Between 3.0 and 5.0
            
            job = {
                "id": job_id,
                "title": job_titles[title_idx],
                "company_name": companies[company_idx],
                "location_name": locations[location_idx],
                "skills": skills_lists[skills_idx],
                "status": "Active",
                "platform": "glassdoor",
                "platform_job_url": f"https://www.glassdoor.com/job-listing/job.htm?jobListingId={job_id}",
                "min_year": random.randint(1, 3),
                "max_year": random.randint(3, 7),
                "work_mode": random.choice(["remote", "onsite", "hybrid"]),
                "job_types": random.choice(["full_time", "part_time", "contract"]),
                "salary_min": salary_min,
                "salary_max": salary_max,
                "company_rating": rating,
                "posted_on": post_date
            }
            
            simulated_jobs.append(job)
        
        # Return in Herkey-compatible format
        return {
            "response_code": 10100,
            "message": "Success",
            "body": simulated_jobs
        }

# Factory to get the appropriate job client based on platform
def get_job_client(platform="herkey"):
    """
    Factory function to get the appropriate job search client
    
    Args:
        platform (str): The job platform to use (herkey, linkedin, glassdoor)
        
    Returns:
        object: The appropriate job search client
    """
    platform = platform.lower()
    
    if platform == "linkedin":
        return LinkedInJobsClient()
    elif platform == "glassdoor":
        return GlassdoorJobsClient()
    else:
        return HerkeyAPIClient()
