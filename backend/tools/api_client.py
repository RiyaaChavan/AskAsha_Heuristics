# tools/api_client.py
import requests
import json
from config.config import Config

class HerkeyAPIClient:
    def __init__(self):
        self.base_url = Config.HERKEY_API_BASE_URL
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
        endpoint = f"{self.base_url}/jobs/search"
        response = requests.get(endpoint, params=query_params, headers=self.headers)
        
        if response.status_code == 200:
            data = response.json()
            
            # Process the response to ensure job links are included
            if "data" in data and isinstance(data["data"], list):
                for job in data["data"]:
                    # If job link is not provided, construct it from the job ID
                    if "link" not in job and "id" in job:
                        job["link"] = f"https://herkey.com/jobs/{job['id']}"
                    
                    # Ensure the link is a complete URL
                    if "link" in job and not job["link"].startswith(("http://", "https://")):
                        job["link"] = f"https://herkey.com{job['link']}"
            
            return data
        else:
            return {
                "status": "error",
                "message": f"API request failed with status code: {response.status_code}",
                "data": None
            }
    
    # [Rest of the code remains the same]
