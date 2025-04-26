from flask import Flask, jsonify, request
import time
import requests
from flask_cors import CORS
from agent import run_agent  # Assuming run_agent is defined in agent.py
app = Flask(__name__)
CORS(app)  # Fixed the incomplete CORS setup

def get_session_id():
    """Get a session ID from the HerKey API"""
    response = requests.get('https://api-prod.herkey.com/api/v1/herkey/generate-session')
    if response.status_code == 200:
        return response.json()['body']['session_id']
    return None

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "message": "Server is running"
    })

@app.route('/chat', methods=['POST'])
def chat():
    # Get message and userId from request
    data = request.get_json()
    message = data.get('message', '')
    user_id = data.get('userId', '')
    
    # Log the incoming request
    response=(run_agent(message))
    if response['canvasType'] == 'job_search':
        # Generate link for job search with parameters encoded in the URL
        session_id = get_session_id()
        
        # Get parameters from response if available
        params = response.get('canvasUtils', {}).get('param', {})
        
        # Add the session token to the parameters
        if session_id:
            params['session_id'] = session_id
        
        # Create query string from parameters
        import urllib.parse
        query_string = urllib.parse.urlencode(params)
        
        # Append query string to the job link
        base_url = "https://api-prod.herkey.com/api/v1/herkey/jobs/es_candidate_jobs"
        response['canvasUtils']['job_link'] = f"{base_url}?{query_string}"
        
        # Keep the job_api for backward compatibility if needed
        response['canvasUtils']['job_api'] = session_id
        
        
        return jsonify(response)
    if '/job' in message.lower() or 'job' in message.lower():
        # Get session ID for HerKey API
        session_id = get_session_id()
        
        # Return a response with job search canvas
        response = {
            "text": "I found some job listings that might interest you. Check them out in the panel.",
            "canvasType": "job_search",
            "canvasUtils": {
                "job_link": "https://api-prod.herkey.com/api/v1/herkey/jobs/es_candidate_jobs",
                "job_api": session_id
            }
        }
    
    elif '/roadmap' in message.lower() or 'roadmap' in message.lower():
        print('yo')
        response={
            "text": "Generated this roadmap for you.",
            "canvasType": "roadmap",
            "canvasUtils": {
                "roadmap":[
                    {
                        "title": "Roadmap 1",
                        "description": "Description for roadmap 1",
                        "link": "https://example.com/roadmap1"
                    },
                    {
                        "title": "Roadmap 2",
                        "description": "Description for roadmap 2",
                        "link": "https://example.com/roadmap2"
                    },
                    {
                        "title": "Roadmap 3",
                        "description": "Description for roadmap 3",
                        "link": "https://example.com/roadmap3"
                    },
                    {
                        "title": "Roadmap 4",
                        "description": "Description for roadmap 4",
                        "link": "https://example.com/roadmap4"
                    },
                    {
                        "title": "Roadmap 5",
                        "description": "Description for roadmap 5",
                        "link": "https://example.com/roadmap5"
                    },
                    {
                        "title": "Roadmap 6",
                        "description": "Description for roadmap 6",
                        "link": "https://example.com/roadmap6"
                    },
                    {
                        "title": "Roadmap 7",
                        "description": "Description for roadmap 7",
                        "link": "https://example.com/roadmap7"
                    },
                    {
                        "title": "Roadmap 8",
                        "description": "Description for roadmap 8",
                        "link": "https://example.com/roadmap8"
                    },
                    {
                        "title": "Roadmap 9",
                        "description": "Description for roadmap 9",
                        "link": "https://example.com/roadmap9"
                    },
                    {
                        "title": "Roadmap 10",
                        "description": "Description for roadmap 10",
                        "link": "https://example.com/roadmap10"
                    }
                ]
            }
        }
    
   
    
    # Add a short delay to simulate processing (optional)
    time.sleep(0.5)
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)