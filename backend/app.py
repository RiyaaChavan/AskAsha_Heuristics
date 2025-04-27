from flask import Flask, jsonify, request, session
import time
import requests
from flask_cors import CORS
from agent import run_agent  # Assuming run_agent is defined in agent.py
from db import create_user, authenticate_user, get_user_by_id, save_conversation, get_user_conversations
import os

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "herkey-secret-key-change-in-production")
CORS(app, supports_credentials=True)  # Enabling credentials for CORS

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

# New routes for authentication
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    # Validate input
    if not username or not email or not password:
        return jsonify({
            "status": "error",
            "message": "Missing required fields"
        }), 400
    
    # Create user
    user_id = create_user(username, email, password)
    
    if user_id:
        session['user_id'] = user_id
        return jsonify({
            "status": "success",
            "message": "User created successfully",
            "user_id": user_id
        })
    else:
        return jsonify({
            "status": "error",
            "message": "Email already exists"
        }), 409

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Validate input
    if not email or not password:
        return jsonify({
            "status": "error",
            "message": "Missing required fields"
        }), 400
    
    # Authenticate user
    user_id = authenticate_user(email, password)
    
    if user_id:
        session['user_id'] = user_id
        return jsonify({
            "status": "success",
            "message": "Login successful",
            "user_id": user_id
        })
    else:
        return jsonify({
            "status": "error",
            "message": "Invalid email or password"
        }), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({
        "status": "success",
        "message": "Logout successful"
    })

@app.route('/api/user', methods=['GET'])
def get_user():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({
            "status": "error",
            "message": "Not authenticated"
        }), 401
    
    user = get_user_by_id(user_id)
    
    if user:
        return jsonify({
            "status": "success",
            "user": user
        })
    else:
        return jsonify({
            "status": "error",
            "message": "User not found"
        }), 404

@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({
            "status": "error",
            "message": "Not authenticated"
        }), 401
    
    conversations = get_user_conversations(user_id)
    
    return jsonify({
        "status": "success",
        "conversations": conversations
    })

@app.route('/chat', methods=['POST'])
def chat():
    # Get message and userId from request
    data = request.get_json()
    message = data.get('message', '')
    user_id = data.get('userId', '')
    
    # Check if user is authenticated for saving conversations
    is_authenticated = False
    if not user_id:
        user_id = session.get('user_id')
    
    if user_id:
        is_authenticated = True
        # Fetch recent conversation history for context
        # Note: get_user_conversations returns conversations in reverse chronological order (newest first)
        # We need to reverse the list to get chronological order (oldest first)
        conversation_history = get_user_conversations(user_id, limit=5)
        conversation_history.reverse()  # Reverse to get chronological order (oldest first)
    else:
        conversation_history = []
    
    # Log the incoming request
    response = run_agent(message, conversation_history)
    
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
    
    # Save the conversation if user is authenticated
    if is_authenticated:
        save_conversation(user_id, message, response)
    
    # Add a short delay to simulate processing (optional)
    time.sleep(0.5)
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)