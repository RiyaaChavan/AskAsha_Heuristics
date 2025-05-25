import requests
import csv
import time

url = "https://api.scrapingdog.com/google_jobs"
all_jobs = []

for i in range(5):
    params = {
        "api_key": "680bb97bf2ff88495c67dc60",
        "query": "jobs+india",
        "page": i
    }

    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        jobs = data.get('jobs_results', [])
        all_jobs.extend(jobs)
    else:
        print(f"Request failed with status code: {response.status_code}")

    time.sleep(2)  # Be polite to the API

# Save to CSV
with open('google_jobs_india_3calls.csv', 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = ['title', 'company_name', 'location', 'posted_time', 'job_type', 'qualification', 'description_snippet', 'job_url', 'apply_link']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

    for job in all_jobs:
        writer.writerow({
            'title': job.get('title', ''),
            'company_name': job.get('company_name', ''),
            'location': job.get('location', ''),
            'posted_time': job.get('extensions', [''])[0] if job.get('extensions') else '',
            'job_type': job.get('extensions', ['', ''])[1] if len(job.get('extensions', [])) > 1 else '',
            'qualification': job.get('extensions', ['', '', ''])[2] if len(job.get('extensions', [])) > 2 else '',
            'description_snippet': job.get('description', '')[:200].replace('\n', ' ') + '...',
            'job_url': job.get('url', ''),
            'apply_link': job.get('apply_links', [{}])[0].get('link', '') if job.get('apply_links') else ''
        })

print("Saved to google_jobs_india_3calls.csv")