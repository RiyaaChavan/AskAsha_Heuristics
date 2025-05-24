import sys
import os

# Add root directory to sys.path
sys.path.append(r"D:\djsanghvi\hacks\AskAsha_Heuristics")

from flask import Flask, request, jsonify
from backend.tools.api_client import get_job_client
from backend.agent import extract_job_search_params

app = Flask(__name__)

def recommend_jobs(query: str, platform: str, resume_data=None, conversation_history=None):
    try:
        # Extract search parameters
        params = extract_job_search_params(query, conversation_history, resume_data)

        # Force platform
        params["platforms"] = [platform]

        # Get the platform-specific job client
        client = get_job_client(platform)
        results = client.search_jobs(params)

        return {
            "platform": platform,
            "total_jobs": len(results.get("body", [])),
            "jobs": results.get("body", []),
            "message": results.get("message", "")
        }

    except Exception as e:
        return {
            "platform": platform,
            "total_jobs": 0,
            "jobs": [],
            "error": str(e)
        }

@app.route('/recommend/<platform>', methods=['POST'])
def recommend_platform(platform):
    data = request.get_json()
    query = data.get("query", "")
    resume_data = data.get("resume_data", {})
    conversation_history = data.get("conversation_history", [])

    platform = platform.lower()
    allowed_platforms = ["herkey", "linkedin", "glassdoor", "google_jobs_women", "women_redirect"]
    if platform not in allowed_platforms:
        return jsonify({"error": f"Invalid platform: {platform}"}), 400

    response = recommend_jobs(query, platform, resume_data, conversation_history)
    return jsonify(response)

if __name__ == '__main__':
    app.run(port=5005, debug=True)
