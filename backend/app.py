# from flask import Flask, jsonify, request, session
# import time
# import requests
# from flask_cors import CORS
# from agent import run_agent  # Assuming run_agent is defined in agent.py
# from db import create_user, authenticate_user, get_user_by_id, save_conversation, get_user_conversations
# import os

# app = Flask(__name__)
# app.secret_key = os.getenv("SECRET_KEY", "herkey-secret-key-change-in-production")
# CORS(app, supports_credentials=True)  # Enabling credentials for CORS

# def get_session_id():
#     """Get a session ID from the HerKey API"""
#     response = requests.get('https://api-prod.herkey.com/api/v1/herkey/generate-session')
#     if response.status_code == 200:
#         return response.json()['body']['session_id']
#     return None

# @app.route('/health', methods=['GET'])
# def health_check():
#     return jsonify({
#         "status": "ok",
#         "message": "Server is running"
#     })

# # New routes for authentication
# @app.route('/api/signup', methods=['POST'])
# def signup():
#     data = request.get_json()
#     username = data.get('username')
#     email = data.get('email')
#     password = data.get('password')
    
#     # Validate input
#     if not username or not email or not password:
#         return jsonify({
#             "status": "error",
#             "message": "Missing required fields"
#         }), 400
    
#     # Create user
#     user_id = create_user(username, email, password)
    
#     if user_id:
#         session['user_id'] = user_id
#         return jsonify({
#             "status": "success",
#             "message": "User created successfully",
#             "user_id": user_id
#         })
#     else:
#         return jsonify({
#             "status": "error",
#             "message": "Email already exists"
#         }), 409

# @app.route('/api/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     email = data.get('email')
#     password = data.get('password')
    
#     # Validate input
#     if not email or not password:
#         return jsonify({
#             "status": "error",
#             "message": "Missing required fields"
#         }), 400
    
#     # Authenticate user
#     user_id = authenticate_user(email, password)
    
#     if user_id:
#         session['user_id'] = user_id
#         return jsonify({
#             "status": "success",
#             "message": "Login successful",
#             "user_id": user_id
#         })
#     else:
#         return jsonify({
#             "status": "error",
#             "message": "Invalid email or password"
#         }), 401

# @app.route('/api/logout', methods=['POST'])
# def logout():
#     session.pop('user_id', None)
#     return jsonify({
#         "status": "success",
#         "message": "Logout successful"
#     })

# @app.route('/api/user', methods=['GET'])
# def get_user():
#     user_id = session.get('user_id')
    
#     if not user_id:
#         return jsonify({
#             "status": "error",
#             "message": "Not authenticated"
#         }), 401
    
#     user = get_user_by_id(user_id)
    
#     if user:
#         return jsonify({
#             "status": "success",
#             "user": user
#         })
#     else:
#         return jsonify({
#             "status": "error",
#             "message": "User not found"
#         }), 404

# @app.route('/api/conversations', methods=['GET'])
# def get_conversations():
#     user_id = session.get('user_id')
    
#     if not user_id:
#         return jsonify({
#             "status": "error",
#             "message": "Not authenticated"
#         }), 401
    
#     conversations = get_user_conversations(user_id)
    
#     return jsonify({
#         "status": "success",
#         "conversations": conversations
#     })

# @app.route('/api/chat', methods=['POST'])
# def chat():
#     # Get message and userId from request
#     data = request.get_json()
#     message = data.get('message', '')
#     user_id = data.get('userId', '')
    
#     # Check if user is authenticated for saving conversations
#     is_authenticated = False
#     if not user_id:
#         user_id = session.get('user_id')
    
#     if user_id:
#         is_authenticated = True
#         # Fetch recent conversation history for context
#         # Note: get_user_conversations returns conversations in reverse chronological order (newest first)
#         # We need to reverse the list to get chronological order (oldest first)
#         conversation_history = get_user_conversations(user_id, limit=5)
#         conversation_history.reverse()  # Reverse to get chronological order (oldest first)
#     else:
#         conversation_history = []
    
#     # Log the incoming request
#     response = run_agent(message, conversation_history)
    
#     if response['canvasType'] == 'job_search':
#         # Generate link for job search with parameters encoded in the URL
#         session_id = get_session_id()
        
#         # Get parameters from response if available
#         params = response.get('canvasUtils', {}).get('param', {})
        
#         # Add the session token to the parameters
#         if session_id:
#             params['session_id'] = session_id
        
#         # Create query string from parameters
#         import urllib.parse
#         query_string = urllib.parse.urlencode(params)
        
#         # Append query string to the job link
#         base_url = "https://api-prod.herkey.com/api/v1/herkey/jobs/es_candidate_jobs"
#         response['canvasUtils']['job_link'] = f"{base_url}?{query_string}"
        
#         # Keep the job_api for backward compatibility if needed
#         response['canvasUtils']['job_api'] = session_id
    
#     # Save the conversation if user is authenticated
#     if is_authenticated:
#         save_conversation(user_id, message, response)
    
#     # Add a short delay to simulate processing (optional)
#     time.sleep(0.5)
    
#     return jsonify(response)

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, debug=True)
from flask import Flask, request, jsonify, session
from flask_cors import CORS
import time
import requests
import urllib.parse
import uuid
import requests
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
import os
import jwt
from werkzeug.utils import secure_filename
from datetime import datetime
import PyPDF2
import docx2txt
import nltk
from nltk.tokenize import word_tokenize


# Import your internal logic
from agent import run_agent  # Your run_agent logic
from db import create_user, authenticate_user, get_user_by_id, save_conversation, get_user_conversations

from dotenv import load_dotenv
load_dotenv()

# LangChain, Tavily, Cohere imports
from langchain_cohere import ChatCohere
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "herkey-secret-key-change-in-production")
CORS(app, supports_credentials=True)

client = MongoClient(os.getenv('MONGODB_URI'))
db = client.askasha_db

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# External API keys
os.environ["TAVILY_API_KEY"] = os.getenv("TAVILY_API_KEY")  # Replace with your actual API key
# os.environ["COHERE_API_KEY"] = os.getenv("COHERE_API_KEY")  # Replace with your actual API key

# Initialize internet search tool and LLM
internet_search = TavilySearchResults()
internet_search.name = "internet_search"
internet_search.description = "Returns a list of relevant document snippets for a textual query retrieved from the internet."

llm = ChatCohere(
    cohere_api_key=os.getenv("COHERE_API_KEY"),
    model="command-r-plus",
    temperature=0.3
)



# Session storage for mock interview/career chats
sessions = {}

# System prompts for special chat types
SYSTEM_PROMPTS = {
   "career": """
## Task and Context
You are a supportive career coach specializing in women's empowerment.
You assist with interview prep, salary negotiation, career transitions, confidence-building, and provide factual and motivational responses.
You prefer referencing trusted sources like Lean In, Women Who Code, SheThePeople, Fairygodboss, LinkedIn Career Blogs.
Use the internet_search tool if you need updated or external information.
Stay respectful, empowering, factual, motivational. NEVER create toxic, biased, or negative content.
""",
    "interview": """
## Task and Context
You are a mock interview conductor bot. 
Ask the user about the role they are preparing for, their experience, and their skills.
Then, generate interview questions dynamically based on the user's inputs. 
Ask one question at a time, and based on the user's answers, ask relevant follow-up questions. 
Make the interview realistic by using contextual follow-up questions, similar to how a real interview would flow. 
At the end of the interview, rate the user based on their performance and provide feedback.
""",
}

# -------------- Helper Functions -------------- #
def get_session_id():
    """Get a session ID from HerKey API"""
    response = requests.get('https://api-prod.herkey.com/api/v1/herkey/generate-session')
    if response.status_code == 200:
        return response.json()['body']['session_id']
    return None

def search_online(query):
    """Search using Tavily"""
    return internet_search.invoke({"query": query})

#SKILL PARSING FUNCTION
nltk.download('punkt')

# Define skills database
SKILL_PATTERNS = {
    # Programming Languages
    'languages': [
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'php', 'go', 'rust',
        'scala', 'kotlin', 'swift', 'objective-c', 'r', 'matlab', 'perl', 'bash', 'shell', 'sql',
        'html', 'css', 'xml', 'yaml', 'json'
    ],
    
    # Frameworks & Libraries
    'frameworks': [
        'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'asp.net',
        'laravel', 'ruby on rails', 'jquery', 'bootstrap', 'tailwind', 'next.js', 'gatsby',
        'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'scipy', 'matplotlib'
    ],
    
    # Databases
    'databases': [
        'sql', 'mysql', 'postgresql', 'mongodb', 'sqlite', 'oracle', 'redis', 'dynamodb',
        'firebase', 'cassandra', 'elasticsearch', 'neo4j', 'nosql'
    ],
    
    # DevOps & Cloud
    'devops': [
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform',
        'ansible', 'git', 'github', 'gitlab', 'bitbucket', 'jira', 'agile', 'scrum'
    ],
    
    # Mobile Development
    'mobile': [
        'android', 'ios', 'react native', 'flutter', 'xamarin', 'swift', 'kotlin',
        'mobile development', 'app development'
    ],
    
    # Soft Skills
    'soft_skills': [
        'problem solving', 'teamwork', 'communication', 'leadership', 'time management',
        'project management', 'critical thinking', 'analytical skills', 'adaptability'
    ],
    
    # Data Science & Machine Learning
    'data_science': [
        'machine learning', 'deep learning', 'neural networks', 'data analysis', 'data visualization',
        'big data', 'hadoop', 'spark', 'nlp', 'computer vision', 'ai', 'artificial intelligence',
        'data mining', 'statistical analysis', 'business intelligence', 'a/b testing'
    ],
    
    # Design
    'design': [
        'ui/ux', 'graphic design', 'adobe photoshop', 'adobe illustrator', 'figma', 'sketch',
        'responsive design', 'wireframing', 'prototyping'
    ]
}

# Create a flat list of all skills
ALL_SKILLS = []
for category, skills in SKILL_PATTERNS.items():
    ALL_SKILLS.extend(skills)

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text

def extract_text_from_docx(file_path):
    """Extract text from DOCX file"""
    return docx2txt.process(file_path)

def extract_text_from_txt(file_path):
    """Extract text from plain text file"""
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
        return file.read()

def extract_text_from_file(file_path):
    """Extract text from various file formats"""
    file_extension = file_path.split('.')[-1].lower()
    
    if file_extension == 'pdf':
        return extract_text_from_pdf(file_path)
    elif file_extension == 'docx':
        return extract_text_from_docx(file_path)
    elif file_extension == 'txt':
        return extract_text_from_txt(file_path)
    else:
        return ""

def extract_skills_from_text(text):
    """Extract skills from text using nltk and pattern matching"""
    # Tokenize the text into words
    words = word_tokenize(text.lower())
    
    skills_found = set()
    
    # Check if each word is a skill from our skill list
    for word in words:
        if word in ALL_SKILLS:
            skills_found.add(word)
    
    # Also look for skills mentioned in lists and bullet points
    bullet_pattern = r'(?:•|\*|\-|\d+\.)?\s*([A-Za-z0-9][\w\+\#\.\s]+)(?:,|\.|;|$)'
    for match in re.finditer(bullet_pattern, text.lower()):
        item = match.group(1).strip()
        # Check if this item contains any of our skills
        for skill in ALL_SKILLS:
            if re.search(r'\b' + re.escape(skill) + r'\b', item):
                skills_found.add(skill)
    
    # Format skills with proper capitalization
    formatted_skills = []
    for skill in skills_found:
        # Special case for acronyms
        if skill.upper() in ['HTML', 'CSS', 'SQL', 'PHP', 'AWS', 'GCP', 'API', 'AI', 'ML', 'NLP']:
            formatted_skills.append(skill.upper())
        else:
            # Capitalize first letter of each word
            formatted_skills.append(' '.join(word.capitalize() for word in skill.split()))
    
    # Categorize skills
    categorized_skills = {}
    for skill in skills_found:
        for category, category_skills in SKILL_PATTERNS.items():
            if skill in category_skills:
                if category not in categorized_skills:
                    categorized_skills[category] = []
                
                # Add with proper formatting
                if skill.upper() in ['HTML', 'CSS', 'SQL', 'PHP', 'AWS', 'GCP', 'API', 'AI', 'ML', 'NLP']:
                    categorized_skills[category].append(skill.upper())
                else:
                    categorized_skills[category].append(' '.join(word.capitalize() for word in skill.split()))
                break
    
    return {
        "skills": sorted(formatted_skills),
        "categorized_skills": categorized_skills
    }

def parse_resume(file_path):
    """Main function to parse resume and extract skills"""
    # Extract text from the file
    text = extract_text_from_file(file_path)
    
    # Extract skills from the text
    skills_data = extract_skills_from_text(text)
    
    return skills_data
\

# -------------- Health Check -------------- #
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Server is running"})

# -------------- Authentication Routes -------------- #
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username, email, password = data.get('username'), data.get('email'), data.get('password')

    if not username or not email or not password:
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    user_id = create_user(username, email, password)
    if user_id:
        session['user_id'] = user_id
        return jsonify({"status": "success", "user_id": user_id})
    else:
        return jsonify({"status": "error", "message": "Email already exists"}), 409

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email, password = data.get('email'), data.get('password')

    if not email or not password:
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    user_id = authenticate_user(email, password)
    if user_id:
        session['user_id'] = user_id
        return jsonify({"status": "success", "user_id": user_id})
    else:
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"status": "success", "message": "Logged out"})

@app.route('/api/user', methods=['GET'])
def get_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"status": "error", "message": "Not authenticated"}), 401

    user = get_user_by_id(user_id)
    if user:
        return jsonify({"status": "success", "user": user})
    else:
        return jsonify({"status": "error", "message": "User not found"}), 404

@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"status": "error", "message": "Not authenticated"}), 401

    conversations = get_user_conversations(user_id)
    return jsonify({"status": "success", "conversations": conversations})

@app.route('/api/check-user', methods=['POST'])
def check_user():
    data = request.json
    user = db.users.find_one({'uid': data['uid']})
    return jsonify({'exists': bool(user)})

@app.route('/api/create-profile', methods=['POST'])
def create_profile():
    try:
        # Get form data
        data = request.form.to_dict()
        uid = data.pop('uid', None)
        
        if not uid:
            return jsonify({'error': 'User ID is required'}), 400

        # Handle resume file
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file'}), 400
            
        resume_file = request.files['resume']
        if resume_file and allowed_file(resume_file.filename):
            filename = secure_filename(f"{uid}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{resume_file.filename}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            resume_file.save(filepath)
            
            # Parse resume and extract skills
            skills_data = parse_resume(filepath)
            
            # Create user profile
            profile_data = {
                'uid': uid,
                'name': data.get('name'),
                'email': data.get('email'),
                'phone': data.get('phone'),
                'location': data.get('location'),
                'locationPreference': data.get('locationPreference'),
                'gender': data.get('gender'),
                'education': data.get('education'),
                'professionalStage': data.get('professionalStage'),
                'resume_file': filename,
                'skills': skills_data['skills'],
                'categorized_skills': skills_data['categorized_skills'],
                'created_at': datetime.utcnow()
            }
            
            # Insert or update profile
            db.users.update_one(
                {'uid': uid},
                {'$set': profile_data},
                upsert=True
            )
            
            return jsonify({'message': 'Profile created successfully'}), 201
            
        return jsonify({'error': 'Invalid file type'}), 400

    except Exception as e:
        print(f"Error creating profile: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/update-profile/<uid>', methods=['PUT'])
def update_profile(uid):
    try:
        data = request.json
        result = db.users.update_one(
            {'uid': uid},
            {'$set': data}
        )
        if result.modified_count:
            return jsonify({'message': 'Profile updated successfully'})
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/profile/<uid>', methods=['GET'])
def get_profile(uid):
    try:
        user = db.users.find_one({'uid': uid})
        if user:
            user['_id'] = str(user['_id'])  # Convert ObjectId to string
            return jsonify(user)
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        print(f"Server error: {e}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/api/delete-profile/<uid>', methods=['DELETE'])
def delete_profile(uid):
    try:
        result = db.users.delete_one({'uid': uid})
        if result.deleted_count:
            return jsonify({'message': 'Profile deleted successfully'})
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# -------------- Chat via run_agent (HerKey Chatbot) -------------- #
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')
    user_id = data.get('userId', '')

    if not user_id:
        user_id = session.get('user_id')

    is_authenticated = bool(user_id)

    conversation_history = []
    if is_authenticated:
        conversation_history = get_user_conversations(user_id, limit=5)
        conversation_history.reverse()  # chronological order

    response = run_agent(message, conversation_history)

    if response.get('canvasType') == 'job_search':
        session_id = get_session_id()
        params = response.get('canvasUtils', {}).get('param', {})
        if session_id:
            params['session_id'] = session_id

        query_string = urllib.parse.urlencode(params)
        job_url = f"https://api-prod.herkey.com/api/v1/herkey/jobs/es_candidate_jobs?{query_string}"
        response['canvasUtils']['job_link'] = job_url
        response['canvasUtils']['job_api'] = session_id

    if is_authenticated:
        save_conversation(user_id, message, response)

    time.sleep(0.5)
    return jsonify(response)

# -------------- LangChain Career Coach / Interview Bot -------------- #
@app.route('/start-session', methods=['POST'])
def start_session():
    data = request.json
    chat_type = data.get('chatType')
    user_id = data.get('userId', 'anonymous')

    if chat_type not in SYSTEM_PROMPTS:
        return jsonify({"error": "Invalid chat type"}), 400

    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        'messages': [SystemMessage(content=SYSTEM_PROMPTS[chat_type])],
        'user_id': user_id,
        'chat_type': chat_type
    }

    return jsonify({"sessionId": session_id, "message": f"Started {chat_type} session"})

import re

@app.route('/send-message', methods=['POST'])
def send_message():
    data = request.json
    session_id = data.get('sessionId')
    user_message = data.get('message')

    if not session_id or session_id not in sessions:
        return jsonify({"error": "Invalid session ID"}), 400
    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    session_data = sessions[session_id]
    messages = session_data['messages']
    chat_type = session_data['chat_type']

    try:
        if chat_type == "interview":
            # Initialize interview flow if not already
            if "interview_stage" not in session_data:
                session_data["interview_stage"] = "ask_role"  # Set initial stage
                return jsonify({"message": "Please provide your role for the mock interview."})

            stage = session_data["interview_stage"]

            if stage == "ask_role":
                session_data["role"] = user_message
                session_data["interview_stage"] = "ask_experience"  # Move to next stage
                return jsonify({"message": "How many years of experience do you have in this field?"})

            elif stage == "ask_experience":
                session_data["experience"] = user_message
                session_data["interview_stage"] = "ask_skills"  # Move to next stage
                return jsonify({"message": "What are your key skills related to this role?"})

            elif stage == "ask_skills":
                session_data["skills"] = user_message
                session_data["interview_stage"] = "start_interview"  # Move to the interview stage
                # System prompt to guide the LLM
                system_prompt = f"""
    ## Task and Context
    You are a mock interview conductor bot. 
    The user is preparing for the role of {session_data['role']} with {session_data['experience']} years of experience. 
    Their key skills include {session_data['skills']}.
    Ask one interview question at a time based on their profile. After each answer, ask a relevant follow-up or a new question. Conclude with rating and feedback.
    """
                messages.append(SystemMessage(content=system_prompt))
                return jsonify({"message": "Let's begin the mock interview! Ready?"})

            elif stage == "start_interview" and user_message.lower() in ["yes", "ready", "start"]:
                session_data["interview_stage"] = "interviewing"  # Move to the actual interview stage

                # Generate initial interview question
                messages.append(HumanMessage(content="Generate an initial interview question based on the user's profile."))

                response = llm.invoke(messages)
                model_reply = response.content.strip()

                # Add question to memory
                messages.append(AIMessage(content=model_reply))

                return jsonify({"message": model_reply})

            elif stage == "interviewing":
                messages.append(HumanMessage(content=user_message))

                # Generate follow-up question based on user input
                messages.append(HumanMessage(content="Generate a follow-up question based on the user's response. If the user response is satisfactory ask a different question. If the interview questions have covered all aspects to be asked about then start concluding the interview."))

                follow_up_response = llm.invoke(messages)
                follow_up_reply = follow_up_response.content.strip()

                messages.append(AIMessage(content=follow_up_reply))

                return jsonify({"message": follow_up_reply})

            elif stage == "concluding":
                # Provide interview rating and feedback
                rating_messages = [
                    HumanMessage(content="Please rate the user's performance on the interview based on their responses. Provide constructive feedback.")
                ]
                rating_response = llm.invoke(rating_messages)
                rating_reply = rating_response.content.strip()

                return jsonify({"message": rating_reply})

        else:
            # If it's not interview, handle other chat types
            messages.append(HumanMessage(content=user_message))

            # Call the LLM for normal conversation
            response = llm.invoke(messages)
            model_reply = response.content.strip()

            messages.append(AIMessage(content=model_reply))

            return jsonify({"message": model_reply})

    except Exception as e:
        print(f"Error in processing message: {str(e)}")
        return jsonify({"error": "An error occurred while processing your request."}), 500

# Function to call Cohere or LLM API for generating interview questions
def generate_interview_question(role, experience, skills, messages):
    # Create a prompt for the LLM based on the user's profile
    prompt = f"""
    The user is preparing for the role of {role} with {experience} years of experience. 
    Their key skills include {skills}.
    Ask one question at a time, and based on the user's answers, ask relevant follow-up questions. 
Make the interview realistic by using contextual follow-up questions, similar to how a real interview would flow. 
Ask follow up questions if the user seems to be struggling move to the next question.
At the end of the interview, rate the user based on their performance and provide feedback.
    """

    # Add the system message with the context about the user's role, experience, and skills
    system_message = SystemMessage(content=prompt)
    messages.append(system_message)

    try:
        # Invoke the model to generate the question based on the updated conversation context
        response = llm.invoke(messages)
        model_reply = response.content.strip()

        # Add the AI's reply (generated interview question) to the message history
        messages.append(AIMessage(content=model_reply))

        # Return the interview question as a JSON response
        return {"message": model_reply, "didSearch": False}

    except Exception as e:
        # Handle any potential errors during the invocation of the model
        print(f"Error invoking the model: {str(e)}")
        return {"error": "Sorry, I couldn't generate a question right now."}




  

@app.route('/end-session', methods=['POST'])
def end_session():
    data = request.json
    session_id = data.get('sessionId')
    if session_id and session_id in sessions:
        del sessions[session_id]
    return jsonify({"status": "success", "message": "Session ended"})

# -------------- Run -------------- #
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)