import requests
import json
import urllib3
from herkey.config.config import Config

# Disable warnings for insecure requests
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class HerkeyAPIClient:
    def __init__(self):
        self.base_url = Config.HERKEY_API_BASE_URL
        self.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        self.session_id = None
    
    def _ensure_session(self):
        """Get a fresh session ID for authentication"""
        try:
            # Generate a new session ID exactly as in the reference code
            session_url = f"{self.base_url}/generate-session"
            print(f"Requesting session from: {session_url}")
            
            response = requests.get(session_url, verify=False, timeout=30)  # Increased timeout
            if response.status_code == 200:
                data = response.json()
                self.session_id = data.get('body', {}).get('session_id')
                if self.session_id:
                    self.headers['Authorization'] = f"Token {self.session_id}"
                    print(f"Successfully obtained session ID: {self.session_id[:10]}...")
                else:
                    print(f"Session ID not found in response: {data}")
            else:
                print(f"Failed to generate session ID: {response.status_code}")
        except Exception as e:
            print(f"Error generating session: {e}")
    
    def search_jobs(self, query_params):
        """
        Search for jobs on HerKey platform
        
        Args:
            query_params (dict): Search query parameters
            
        Returns:
            dict: API response with job listings
        """
        self._ensure_session()
        
        # Extract keyword from query_params
        keyword = query_params.get("q", "")
        
        # Prepare parameters for Herkey API
        params = {
            'page_no': 1,
            'page_size': 10,
            'keyword': keyword,
            'is_global_query': True  # Set to True for broader search results
        }
        
        # Use the endpoint from the reference
        endpoint = f"{self.base_url}/jobs/es_candidate_jobs"
        print(f"Searching for jobs with params: {params}")
        
        try:
            response = requests.get(
                endpoint, 
                params=params, 
                headers=self.headers, 
                verify=False,
                timeout=30  # Increased timeout for API call
            )
            
            print(f"API Response Status: {response.status_code}")
            if response.status_code == 200:
                api_data = response.json()
                return {
                    "status": "success",
                    "data": api_data,
                    "message": "Jobs retrieved successfully"
                }
            else:
                return {
                    "status": "error",
                    "message": f"API request failed with status code: {response.status_code}",
                    "data": None
                }
        except Exception as e:
            print(f"Error during API request: {e}")
            return {
                "status": "error",
                "message": f"API request failed: {str(e)}",
                "data": None
            }
    
    def search_groups(self, query_params):
        """
        Search for groups on HerKey platform
        """
        # Implementation can be added when needed
        return {
            "status": "error",
            "message": "Group search not yet implemented in Herkey API",
            "data": None
        }

    def search_sessions(self, query_params):
        """
        Search for sessions on HerKey platform
        """
        # Implementation can be added when needed
        return {
            "status": "error",
            "message": "Session search not yet implemented in Herkey API",
            "data": None
        }
    
    def search_jobs_with_params(self, params):
        """
        Search for jobs with direct parameter passing
        
        Args:
            params (dict): API parameters exactly as they should be sent
            
        Returns:
            dict: API response with job listings and links
        """
        self._ensure_session()
        
        # Use the endpoint from the reference code
        endpoint = f"{self.base_url}/jobs/es_candidate_jobs"
        print(f"Searching for jobs with params: {params}")
        
        try:
            response = requests.get(
                endpoint, 
                params=params, 
                headers=self.headers, 
                verify=False,
                timeout=30  # Increased timeout
            )
            
            print(f"API Response Status: {response.status_code}")
            if response.status_code == 200:
                api_data = response.json()
                
                # Transform the job results to include clickable links
                processed_jobs = self._process_job_results(api_data)
                
                return {
                    "status": "success",
                    "data": processed_jobs,
                    "raw_response": api_data,
                    "message": "Jobs retrieved successfully"
                }
            else:
                return {
                    "status": "error",
                    "message": f"API request failed with status code: {response.status_code}",
                    "data": None
                }
        except requests.exceptions.Timeout:
            # Return error for timeout without mock data
            print("Request to Herkey API timed out.")
            return {
                "status": "error",
                "message": "Connection to Herkey API timed out. Please try again later.",
                "data": None
            }
        except Exception as e:
            print(f"Error during API request: {e}")
            return {
                "status": "error",
                "message": f"API request failed: {str(e)}",
                "data": None
            }
    
    def _process_job_results(self, api_data):
        """Process API response to add clickable links to job listings"""
        processed_data = {
            "total_jobs": 0,
            "jobs": []
        }
        
        # Extract job listings from the response
        jobs = []
        if isinstance(api_data, dict):
            # Try various paths where job results might be
            if "body" in api_data and isinstance(api_data["body"], list):
                jobs = api_data["body"]
            elif "body" in api_data and isinstance(api_data["body"], dict) and "jobs" in api_data["body"]:
                jobs = api_data["body"]["jobs"]
            elif "jobs" in api_data:
                jobs = api_data["jobs"]
                
            # Get pagination info if available
            if "pagination" in api_data:
                processed_data["pagination"] = api_data["pagination"]
            elif "body" in api_data and isinstance(api_data["body"], dict) and "pagination" in api_data["body"]:
                processed_data["pagination"] = api_data["body"]["pagination"]
        
        # Process each job to add links
        for job in jobs:
            job_id = job.get("id") or job.get("job_id")
            if job_id:
                job["apply_link"] = f"https://herkey.com/job/{job_id}"
            
            # Add to processed jobs list
            processed_data["jobs"].append(job)
        
        processed_data["total_jobs"] = len(processed_data["jobs"])
        return processed_data