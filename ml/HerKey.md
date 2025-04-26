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