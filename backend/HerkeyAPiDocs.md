# HerKey API usage:

### Get the Authorization token using Session ID
```bash
    curl https://api-prod.herkey.com/api/v1/herkey/generate-session
```
The Response is:
```json
{
  "status_code": 200,
  "success": true,
  "body": {
    "session_id": "<session-id>"
  }
}
```


#### Use the response['body']['session_id'] as Authorization header

```bash

# Example with multiple query parameters
```bash
# Break down complex query into multiple lines for better readability
curl -H "Authorization: Token <session-id>" \
    "https://api-prod.herkey.com/api/v1/herkey/jobs/es_candidate_jobs?\
page_no=1\
&page_size=10\
&work_mode=work_from_office\
&job_types=full_time\
&job_skills=AACR2\
&location_name=Mumbai%20/%20Navi%20Mumbai\
&industries=Aerospace/Avionics\
&company_name=A%26A%20Associates\
&keyword=data%20science\
&is_global_query=false"
```



Response:
```json
{
    "response_code": 10100,
    "message": "success",
    "pagination": {
        "page_no": "1",
        "page_size": "10",
        "pages": 14,
        "total_items": 135,
        "has_next": true,
        "next_page": 2
    },
    "body": [
        {
            "company_name": "Amazon",
            "title": "Software Dev Engineer I",
            "location_name": "Hyderabad",
            "skills": [
                "supply chain systems",
                "relational databases",
                "software development"
            ],
            "status": "active"
        },...
    ]
}

```

### FUll GET response on https://api-prod.herkey.com/api/v1/herkey/jobs/jobs/173826 (last is jobid)

```json



GET /api/v1/herkey/jobs/jobs/173826

HTTP 200 OK
Allow: GET, HEAD, OPTIONS
Content-Type: application/json
Vary: Accept

{
    "response_code": 10970,
    "message": "job found",
    "seo": {
        "id": 3902046,
        "entity_id": 173826,
        "entity_type": "jobs",
        "title": "  Senior Software Engineer job in Pune at GoDaddy for Women| Herkey (Formely JobsForHer) | 173826",
        "description": "Apply Senior Software Engineer job in GoDaddy - Pune - 2025-04-25 16:48:14.c#,python,rest api,sql,aws,data engineering jobs in Software Development and IT-Software/Software Services industry with  of experience for full_time position.",
        "keywords": "Senior Software Engineer jobs, GoDaddy careers, freshers and experienced jobs in GoDaddy, graduate and pg jobs in Pune, freshers and experienced jobs in Pune, full_time jobs in Pune, jobs in c#,python,rest api,sql,aws,data engineering, jobs for women, jobs for married ladies.",
        "url": "jobs/senior-software-engineer/173826"
    },
    "body": [
        {
            "max_year": 10,
            "user_id": 4685183,
            "company_id": 6791,
            "status": "active",
            "company_benefits": "",
            "deleted": false,
            "location_name": "Pune",
            "special_indicators": null,
            "boosted": true,
            "requirements": "",
            "resume_required": true,
            "salary": "",
            "responsibilities": "",
            "functional_area": "Software Development",
            "id": 173826,
            "ats_job_key": null,
            "location_id": null,
            "job_posting_type": "",
            "co_owners": null,
            "min_qualification": null,
            "min_year": 5,
            "modified_on": "2025-04-25 16:52:35",
            "pre_boosted": false,
            "boosted_on": "2025-04-25 16:52:35",
            "description": "<p>Senior Software Engineer</p><p>At GoDaddy the future of work looks different for each team.</p><p>This is a hybrid position. You’ll divide your time between working remotely from your home and an office, so you should live within commuting distance. Hybrid teams may work in-office as much as a few times a week or as little as once a month or quarter, as decided by leadership. The hiring manager can share more about what hybrid work might look like for this team.</p><p>Join our Team...</p><p>We’re seeking aSenior Software Data Engineerto join our team and focus on creating our next-generation Data Integration Platform. This platform serves as a bridge between eCommerce systems and GoDaddy’s Data Platform. This role is an exceptional opportunity for an experienced Software Engineer to contribute to developing a secure, highly available, fault-tolerant, and globally efficient microservices-based platform. Deployed on AWS, it applies the latest technology stack.</p><p>In addition to these responsibilities, the role involves supporting and maintaining our on-prem legacy stack built with Microsoft technologies. A key part of this role will be working with various database technologies, including relational and non-relational databases in AWS and Microsoft SQL Server(on-prem). Passionate about new and legacy tech? Experienced with programming languages and databases? Committed to delivering high-quality solutions? Let's talk!</p><p>What you'll get to do...</p><p>Design, build, and maintain scalable and robust data pipelines.<br />Develop and optimize data models to support business processes.Ensure data quality and integrity through rigorous testing and validation.<br />Implement data storage solutions usingAWSdatabase services and orMicrosoft SQL Server.<br />Integrate complex datasets usingRESTAPIsand other data ingestion techniques.<br />Collaborate with multi-functional teams to capture requirements and deliver data-driven solutions.Provide technical leadership and mentorship to junior data engineers.<br />Your experience should include...</p><p>At least 5 years of experience as a Data Engineer or in a similar role.<br />Expertise in Microsoft technologies and programming languages such as C# and Python.<br />Strong knowledge ofAWScloud services, particularly in data-related offerings.<br />Proficiency inRESTAPI development and integration.<br />Experience withMicrosoft SQL Serverand familiarity with otherAWSrelational and non-relational databases.<br />You might also have...</p><p>Bachelor’s or Master’s degree in Computer Science, Engineering, or a related field.<br />Proficient in tools and frameworks for handling large datasets.<br />Familiarity with data visualization and reporting tools.<br />Certifications in Microsoft and AWS technologies or any relevant in the field of Engineering.</p><p><br /></p>",
            "specialization_id": null,
            "expires_on": "2025-06-24 16:49:21",
            "created_on": "2025-04-25 16:48:14",
            "ats_type": null,
            "vacancy": null,
            "pre_boosted_on": null,
            "title": "Senior Software Engineer",
            "published_on": "2025-04-25 16:49:21",
            "redirect_url": "",
            "application_notification_type": "dashboard",
            "view_count": null,
            "boosted_expire_on": "2025-05-25 16:52:35",
            "company": {
                "company_type": "company",
                "company_profile_percentage": 7,
                "cities": "Gurgaon,Pune",
                "status": "active",
                "banner_image_mobile": "https://assets.jobsforher.com/uploads/v3/companies/d08249d2f60504715a1ae0f728cc4cc231d2ee2ec1f7683b29.png",
                "logo": "https://assets.jobsforher.com/uploads/v3/companies/9bfe49f33eba189c2592505e715fffc5e5273bd55cf3387391.png",
                "created_by": 1743356,
                "diversity": null,
                "sac_hsc_no": "",
                "company_leaders": null,
                "deleted": false,
                "featured": true,
                "insights": null,
                "no_of_admins": 3,
                "vote_flag": false,
                "website": "careers.godaddy.com",
                "id": 6791,
                "about_us": "<p style=\"text-align: justify;\"><span style=\"color: #000000;\">GoDaddy is empowering everyday entrepreneurs around the world by providing the help and tools to succeed online, making opportunity more inclusive for all. GoDaddy is the place people come to name their idea, build a professional website, attract customers, sell their products and services, and manage their work. Our mission is to give our customers the tools, insights, and people to transform their ideas and personal initiative into success.</span></p>",
                "featured_end_date": "2025-10-04 17:18:52",
                "modified_on": "2025-04-25 21:07:19",
                "culture": "<p style=\"text-align: justify;\"><span style=\"color: #000000;\">At GoDaddy, we know diverse teams build better products&mdash;period. Our people and culture reflect and celebrate that sense of diversity and inclusion in ideas, experiences and perspectives. But we also know that&rsquo;s not enough to build true equity and belonging in our communities. That&rsquo;s why we prioritize integrating diversity, equity, inclusion and belonging principles into the core of how we work every day&mdash;focusing not only on our employee experience, but also our customer experience and operations. It&rsquo;s the best way to serve our mission of empowering entrepreneurs everywhere, and making opportunity more inclusive for all. To read more about these commitments, as well as our representation and pay equity data</span></p>",
                "featured_start_date": "2025-04-07 17:18:52",
                "name": "GoDaddy",
                "created_on": "2020-04-10 22:16:09",
                "banner_image": "https://assets.jobsforher.com/uploads/v3/companies/cef9559e7fce293d84775fbf0c932ba53a87371dd46cf4169e.png",
                "industry": "IT-Software/Software Services",
                "established_date": 1997,
                "tags": "Trending",
                "team_size": "5001-10000",
                "last_activity_date": null,
                "company_profile_url": null,
                "gstin_no": "",
                "view_count": 27115,
                "active_jobs_count": 35,
                "is_follower": false,
                "locations": [],
                "policies": {},
                "jobs": [],
                "employers": [
                    {
                        "boost_count": 0,
                        "deleted": false,
                        "notification_type": "dashboard",
                        "user_id": 1743356,
                        "created_on": "2020-04-10 22:16:09",
                        "company_id": 6791,
                        "modified_on": "2024-10-07 16:04:59",
                        "share_job_access": true,
                        "gender": null,
                        "job_count": 10000,
                        "package_job_count": 0,
                        "paid": false,
                        "employer_status": "active",
                        "employer_role": "user",
                        "email_verified": 1,
                        "subscription": 1,
                        "application_access": true,
                        "designation": "Sales Lead",
                        "id": 8968,
                        "transfer_job_access": true
                    },
                    {
                        "boost_count": null,
                        "deleted": false,
                        "notification_type": null,
                        "user_id": 4685183,
                        "created_on": "2024-10-07 16:04:28",
                        "company_id": 6791,
                        "modified_on": "2024-10-07 16:05:07",
                        "share_job_access": true,
                        "gender": "male",
                        "job_count": 0,
                        "package_job_count": null,
                        "paid": false,
                        "employer_status": "active",
                        "employer_role": "admin",
                        "email_verified": 1,
                        "subscription": 1,
                        "application_access": true,
                        "designation": "Recruiter",
                        "id": 31434,
                        "transfer_job_access": true
                    },
                    {
                        "boost_count": null,
                        "deleted": false,
                        "notification_type": null,
                        "user_id": 4677972,
                        "created_on": "2024-10-18 17:13:35",
                        "company_id": 6791,
                        "modified_on": "2025-03-03 17:36:14",
                        "share_job_access": true,
                        "gender": "male",
                        "job_count": 0,
                        "package_job_count": null,
                        "paid": false,
                        "employer_status": "active",
                        "employer_role": "admin",
                        "email_verified": 1,
                        "subscription": 1,
                        "application_access": true,
                        "designation": "Employer Branding",
                        "id": 31482,
                        "transfer_job_access": true
                    },
                    {
                        "boost_count": null,
                        "deleted": false,
                        "notification_type": null,
                        "user_id": 4701990,
                        "created_on": "2024-10-24 16:18:08",
                        "company_id": 6791,
                        "modified_on": "2025-02-27 16:42:30",
                        "share_job_access": true,
                        "gender": "male",
                        "job_count": 0,
                        "package_job_count": null,
                        "paid": false,
                        "employer_status": "inactive",
                        "employer_role": "admin",
                        "email_verified": 1,
                        "subscription": 1,
                        "application_access": true,
                        "designation": "Recruiter",
                        "id": 31519,
                        "transfer_job_access": true
                    },
                    {
                        "boost_count": null,
                        "deleted": false,
                        "notification_type": null,
                        "user_id": 4724294,
                        "created_on": "2024-11-19 17:52:09",
                        "company_id": 6791,
                        "modified_on": "2024-11-27 15:26:25",
                        "share_job_access": true,
                        "gender": "female",
                        "job_count": 0,
                        "package_job_count": null,
                        "paid": false,
                        "employer_status": "active",
                        "employer_role": "admin",
                        "email_verified": 1,
                        "subscription": 1,
                        "application_access": true,
                        "designation": "Recruiter",
                        "id": 31614,
                        "transfer_job_access": true
                    },
                    {
                        "boost_count": null,
                        "deleted": false,
                        "notification_type": null,
                        "user_id": 5024119,
                        "created_on": "2025-03-21 15:28:06",
                        "company_id": 6791,
                        "modified_on": "2025-03-21 15:28:06",
                        "share_job_access": true,
                        "gender": "female",
                        "job_count": 0,
                        "package_job_count": null,
                        "paid": false,
                        "employer_status": "active",
                        "employer_role": "user",
                        "email_verified": 1,
                        "subscription": 1,
                        "application_access": true,
                        "designation": "Senior Manager Human Resources",
                        "id": 32277,
                        "transfer_job_access": true
                    }
                ],
                "images": {
                    "about_us": [],




                }}}}
                ```

## Python requests library

```python
import requests

# Generate session ID
response = requests.get('https://api-prod.herkey.com/api/v1/herkey/generate-session')
session_id = response.json()['body']['session_id']

# Search for jobs
params = {
    'page_no': 1,
    'page_size': 10,
    'work_mode': 'work_from_office',
    'job_types': 'full_time',
    # 'job_skills': 'AACR2',
    # 'location_name': 'Mumbai / Navi Mumbai',
    # 'industries': 'Aerospace/Avionics',
    # 'company_name': 'A&A Associates',
    'keyword': 'data science',
    'is_global_query': False
}

headers = {'Authorization': f'Token {session_id}'}
jobs = requests.get(
    'https://api-prod.herkey.com/api/v1/herkey/jobs/es_candidate_jobs',
    params=params,
    headers=headers
)

print(jobs.json())
```