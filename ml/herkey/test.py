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