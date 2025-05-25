"""
Utility functions for roadmap generation including domain detection,
link verification, and specialized template selection.
"""

import re
import requests
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse

def detect_roadmap_domain(topic: str) -> str:
    """
    Detect the domain category of a roadmap topic request.
    
    Args:
        topic (str): The user's roadmap request
        
    Returns:
        str: The detected domain category (technical, leadership, creative, business, job_search, return_to_work)
    """
    topic_lower = topic.lower()
    
    # Technical domain keywords
    technical_keywords = [
        'programming', 'coding', 'developer', 'software', 'web development', 'data science', 
        'machine learning', 'python', 'javascript', 'java', 'c#', 'c++', 'ruby', 'php',
        'html', 'css', 'frontend', 'backend', 'fullstack', 'devops', 'cloud', 'aws',
        'azure', 'database', 'sql', 'nosql', 'api', 'git', 'github', 'cybersecurity',
        'networking', 'system admin', 'it', 'information technology', 'tech', 'computer science'
    ]
    
    # Leadership domain keywords
    leadership_keywords = [
        'leadership', 'management', 'team lead', 'manager', 'executive', 'director',
        'ceo', 'cto', 'cio', 'coo', 'project management', 'team management', 'supervision',
        'coaching', 'mentoring', 'leading', 'strategy', 'vision', 'delegation',
        'organizational development', 'change management', 'conflict resolution',
        'executive presence', 'board management', 'corporate governance'
    ]
    
    # Creative domain keywords
    creative_keywords = [
        'design', 'graphic design', 'ux', 'ui', 'user experience', 'user interface',
        'creative', 'art', 'illustration', 'photography', 'video editing', 'animation',
        'motion graphics', 'game design', '3d modeling', 'visual design', 'branding',
        'fashion design', 'interior design', 'architecture', 'content creation',
        'writing', 'copywriting', 'creative writing', 'journalism', 'editing'
    ]
    
    # Business domain keywords
    business_keywords = [
        'business', 'entrepreneurship', 'startup', 'small business', 'marketing',
        'digital marketing', 'sales', 'finance', 'accounting', 'economics', 'banking',
        'investment', 'real estate', 'market research', 'supply chain', 'logistics',
        'operations', 'human resources', 'hr', 'recruiter', 'talent acquisition',
        'business analysis', 'consulting', 'business strategy', 'mba'
    ]
    
    # Job search keywords
    job_search_keywords = [
        'job search', 'find job', 'find work', 'job hunting', 'job application',
        'resume', 'cv', 'cover letter', 'interview', 'job offer', 'salary negotiation',
        'career change', 'career transition', 'linkedin profile', 'networking for job',
        'job fair', 'getting hired', 'job hunting', 'job market', 'employment',
        'applying for jobs', 'job boards', 'ats', 'applicant tracking system'
    ]
    
    # Return to work keywords
    return_to_work_keywords = [
        'return to work', 'returning to workplace', 'career gap', 'career break',
        'maternity leave', 'parental leave', 'sabbatical', 'comeback', 'reentering workforce',
        'resume after break', 'career relaunch', 'returnship', 'return to career',
        'restart career', 'rejoin workforce', 'career reentry', 'coming back to work'
    ]
    
    # Check each domain by counting keyword matches
    domain_scores = {
        'technical': sum(1 for kw in technical_keywords if kw in topic_lower),
        'leadership': sum(1 for kw in leadership_keywords if kw in topic_lower),
        'creative': sum(1 for kw in creative_keywords if kw in topic_lower),
        'business': sum(1 for kw in business_keywords if kw in topic_lower),
        'job_search': sum(1 for kw in job_search_keywords if kw in topic_lower),
        'return_to_work': sum(1 for kw in return_to_work_keywords if kw in topic_lower)
    }
    
    # Return the domain with the highest score
    max_score = max(domain_scores.values())
    if max_score > 0:
        for domain, score in domain_scores.items():
            if score == max_score:
                return domain
    
    # Default to general if no clear match
    return "general"


def verify_and_enhance_roadmap_links(roadmap_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Verify that links in the roadmap exist and point to legitimate resources.
    Enhance links by replacing generic URLs with more specific resource URLs when possible.
    
    Args:
        roadmap_items (list): The roadmap items to verify and enhance
        
    Returns:
        list: The enhanced roadmap items with verified links
    """
    enhanced_roadmap = []
    
    # Trusted domains where we can enhance URLs to specific subpages
    trusted_domains = [
        'linkedin.com', 'coursera.org', 'edx.org', 'indeed.com', 
        'themuse.com', 'hbr.org', 'glassdoor.com', 'udemy.com', 
        'khanacademy.org', 'freecodecamp.org', 'developer.mozilla.org',
        'w3schools.com', 'codecademy.com', 'lab.github.com', 'docs.microsoft.com',
        'learndigital.withgoogle.com', 'datacamp.com', 'hackerrank.com',
        'womenwhocode.com', 'ellevatenetwork.com', 'leanin.org', 
        'girlswhocode.com', 'powertofly.com', 'witi.com', 'fairygodboss.com',
        'jobsforher.com', 'womenreturners.com', 'interviewcake.com',
        'biginterview.com', 'leetcode.com', 'pramp.com', 'careeronestop.org',
        'thebalancecareers.com'
    ]
    
    # Map of common keywords to specific sections within platforms
    specific_paths = {
        # LinkedIn Learning paths
        'programming': '/learning/topics/software-development',
        'python': '/learning/search?keywords=python',
        'javascript': '/learning/search?keywords=javascript',
        'leadership': '/learning/topics/leadership',
        'management': '/learning/topics/management',
        'design': '/learning/topics/design',
        'marketing': '/learning/topics/marketing',
        'data science': '/learning/topics/data-science',
        'interview': '/learning/topics/job-interviews',
        'resume': '/learning/topics/resume-writing',
        
        # Coursera paths
        'data science coursera': '/professional-certificates/ibm-data-science',
        'python coursera': '/specializations/python',
        'machine learning coursera': '/specializations/machine-learning-introduction',
        'business coursera': '/specializations/business-foundations',
        'leadership coursera': '/specializations/leadership-development',
        'project management coursera': '/professional-certificates/google-project-management',
        
        # EdX paths
        'computer science edx': '/course/subject/computer-science',
        'business edx': '/course/subject/business-management',
        'data science edx': '/course/subject/data-analysis-statistics',
        
        # freeCodeCamp paths
        'web development': '/learn/responsive-web-design/',
        'javascript freecodecamp': '/learn/javascript-algorithms-and-data-structures/',
        'front end': '/learn/front-end-development-libraries/',
        'data visualization': '/learn/data-visualization/',
        'api backend': '/learn/back-end-development-and-apis/',
        'python freecodecamp': '/learn/scientific-computing-with-python/',
        
        # MDN paths
        'html': '/en-US/docs/Learn/HTML',
        'css': '/en-US/docs/Learn/CSS',
        'javascript mdn': '/en-US/docs/Learn/JavaScript',
        
        # Interview resources
        'technical interview': '/learn/interview-prep',
        'coding interview': '/explore/interview/preparation',
    }
    
    for item in roadmap_items:
        link = item.get('link', '')
        
        # Skip empty links
        if not link:
            enhanced_roadmap.append(item)
            continue
        
        # Parse the URL to get the domain
        try:
            parsed_url = urlparse(link)
            domain = parsed_url.netloc
            
            # Check if this is a domain we can enhance
            if any(trusted_domain in domain for trusted_domain in trusted_domains):
                # Try to enhance the link based on the title or content
                title_lower = item.get('title', '').lower()
                description_lower = item.get('description', '').lower()[:100]  # Just check the beginning
                
                # Check if we can make the link more specific
                for keyword, specific_path in specific_paths.items():
                    if keyword in title_lower or keyword in description_lower:
                        # Check which domain this specific path applies to
                        if keyword.endswith('coursera') and 'coursera.org' in domain:
                            new_link = f"https://www.coursera.org{specific_path}"
                            item['link'] = new_link
                            break
                        elif keyword.endswith('edx') and 'edx.org' in domain:
                            new_link = f"https://www.edx.org{specific_path}"
                            item['link'] = new_link
                            break
                        elif keyword.endswith('freecodecamp') and 'freecodecamp.org' in domain:
                            new_link = f"https://www.freecodecamp.org{specific_path}"
                            item['link'] = new_link
                            break
                        elif keyword.endswith('mdn') and 'developer.mozilla.org' in domain:
                            new_link = f"https://developer.mozilla.org{specific_path}"
                            item['link'] = new_link
                            break
                        # Generic matching for any domain
                        elif not keyword.endswith(('coursera', 'edx', 'freecodecamp', 'mdn')):
                            # Check if this domain matches the path
                            domain_match = False
                            for trusted_domain in trusted_domains:
                                if trusted_domain in domain:
                                    if trusted_domain == 'linkedin.com' and specific_path.startswith('/learning'):
                                        new_link = f"https://www.linkedin.com{specific_path}"
                                        item['link'] = new_link
                                        domain_match = True
                                        break
                                    elif trusted_domain == 'freecodecamp.org' and specific_path.startswith('/learn'):
                                        new_link = f"https://www.freecodecamp.org{specific_path}"
                                        item['link'] = new_link
                                        domain_match = True
                                        break
                                    elif trusted_domain == 'leetcode.com' and specific_path.startswith('/explore'):
                                        new_link = f"https://leetcode.com{specific_path}"
                                        item['link'] = new_link
                                        domain_match = True
                                        break
                            if domain_match:
                                break
            
            # Verify the link actually exists
            try:
                # Set a short timeout and use a HEAD request to be efficient
                headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
                response = requests.head(link, timeout=3, headers=headers, allow_redirects=True)
                
                # If the link is not accessible, try common alternatives
                if response.status_code >= 400:
                    # Domain root fallback for most sites
                    domain_root = f"{parsed_url.scheme}://{domain}"
                    item['link'] = domain_root
                    
                    # Special cases for specific domains
                    if 'linkedin.com' in domain:
                        item['link'] = "https://www.linkedin.com/learning"
                    elif 'coursera.org' in domain:
                        item['link'] = "https://www.coursera.org"
                    # Add more specific domain fallbacks as needed
            
            except (requests.RequestException, ConnectionError):
                # If verification fails, fall back to domain homepage
                domain_root = f"{parsed_url.scheme}://{domain}"
                item['link'] = domain_root
        
        except Exception as e:
            print(f"Error processing link {link}: {str(e)}")
        
        enhanced_roadmap.append(item)
    
    return enhanced_roadmap


def adjust_roadmap_for_timeframe(roadmap_items: List[Dict[str, Any]], timeframe: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Adjust the roadmap based on the specified timeframe.
    
    Args:
        roadmap_items (list): The roadmap items to adjust
        timeframe (str, optional): The timeframe specification (e.g. "2 weeks", "3 months")
        
    Returns:
        list: The adjusted roadmap items
    """
    if not timeframe:
        return roadmap_items
        
    # Extract numeric value and unit
    match = re.search(r'(\d+)\s*(day|days|week|weeks|month|months|year|years)', timeframe)
    if not match:
        return roadmap_items
        
    number = int(match.group(1))
    unit = match.group(2).lower()
    
    # Convert to approximate days
    days = 0
    if 'day' in unit:
        days = number
    elif 'week' in unit:
        days = number * 7
    elif 'month' in unit:
        days = number * 30
    elif 'year' in unit:
        days = number * 365
    
    adjusted_roadmap = []
    
    # For very short timeframes (less than 2 weeks), reduce the number of steps
    if days < 14:
        # Take only 3-4 most important steps
        important_steps = min(4, len(roadmap_items))
        adjusted_roadmap = roadmap_items[:important_steps]
        
        # Add timeframe-specific guidance to each description
        for item in adjusted_roadmap:
            description = item.get('description', '')
            if description:
                # Add time allocation suggestion
                time_per_step = days / len(adjusted_roadmap)
                days_text = f"{int(time_per_step)} days" if time_per_step >= 1 else "1 day"
                time_guidance = f"\n\nTimeframe Guidance: Allocate approximately {days_text} to this phase of your learning journey. Focus on the most essential aspects mentioned above."
                item['description'] = description + time_guidance
    
    # For medium timeframes (2 weeks to 2 months), keep most steps but add time guidance
    elif 14 <= days <= 60:
        adjusted_roadmap = roadmap_items
        
        # Add timeframe-specific guidance to each description
        total_phases = len(roadmap_items)
        for i, item in enumerate(adjusted_roadmap):
            description = item.get('description', '')
            if description:
                # Calculate approximate time allocation
                time_per_step = days / total_phases
                days_text = f"{int(time_per_step)} days" if time_per_step >= 1 else "1 day"
                
                # Add personalized guidance based on phase position
                if i == 0:
                    guidance = f"\n\nTimeframe Guidance: Spend approximately {days_text} on this foundation phase. Focus on building a solid understanding of the core concepts."
                elif i == total_phases - 1:
                    guidance = f"\n\nTimeframe Guidance: Reserve around {days_text} for this final phase to consolidate your learning and prepare for practical application."
                else:
                    percentage = int((i + 1) / total_phases * 100)
                    guidance = f"\n\nTimeframe Guidance: Allocate about {days_text} to this phase, which represents approximately {percentage}% of your learning journey."
                
                item['description'] = description + guidance
    
    # For longer timeframes, keep all steps and add detailed time allocation
    else:
        adjusted_roadmap = roadmap_items
        
        # Add more comprehensive timeframe guidance
        total_phases = len(roadmap_items)
        for i, item in enumerate(adjusted_roadmap):
            description = item.get('description', '')
            if description:
                # Calculate more nuanced time allocation
                if 'month' in unit or 'year' in unit:
                    # For longer periods, express in weeks
                    time_per_step = (days / total_phases) / 7
                    time_text = f"{time_per_step:.1f} weeks" if time_per_step > 1 else f"{days / total_phases:.1f} days"
                else:
                    # For shorter periods, express in days
                    time_per_step = days / total_phases
                    time_text = f"{time_per_step:.1f} days"
                
                phase_number = i + 1
                guidance = f"\n\nTimeframe Guidance (Phase {phase_number}/{total_phases}): Allocate approximately {time_text} to master this phase. "
                
                # Add phase-specific advice
                if i == 0:
                    guidance += "Invest additional time here if necessary, as a solid foundation will accelerate later phases."
                elif i == total_phases - 1:
                    guidance += "Use any remaining time to review and integrate all previous phases into a cohesive skill set."
                else:
                    if i < total_phases / 2:
                        guidance += "This early phase builds essential knowledge needed for more advanced concepts later."
                    else:
                        guidance += "This advanced phase builds on previous learning - adjust time based on how well you've mastered earlier phases."
                
                item['description'] = description + guidance
    
    return adjusted_roadmap
