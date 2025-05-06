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
import re

# Import your internal logic
from agent import run_agent  # Your run_agent logic
from db import create_user, authenticate_user, get_user_by_id, save_conversation, get_user_conversations

from dotenv import load_dotenv
load_dotenv()

# LangChain, Tavily, Cohere imports
from langchain_cohere import ChatCohere
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

# Import profanity check functions
from profanity import check_profanity, get_profanity_response

app = Flask(__name__)

# Fix CORS for local dev and production (Render backend, Vercel frontend)
CORS(app,
     origins=[
         "http://localhost:5173",  # Local dev
         "https://ask-asha-heuristics-git-pushing-riyaas-projects.vercel.app",
         "https://ask-asha-heuristics.vercel.app",
         "https://ask-asha-heuristics-git-pushing2-riyaas-projects.vercel.app",
        #  "*"# Add your custom domain if any
     ],
     supports_credentials=True)

app.secret_key = os.getenv("SECRET_KEY", "herkey-secret-key-change-in-production")

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
    user_id = request.args.get('user_id')
    print(f"User ID from param: {user_id}")
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

        # Debug print
        print(f"Creating profile for uid: {uid}")
        print(f"Form data: {data}")
        print(f"Files: {request.files}")
            
        # Handle resume file with better error handling
        filename = "no_resume_provided"
        skills_data = {"skills": [], "categorized_skills": {}}
        
        if 'resume' in request.files and request.files['resume'].filename:
            resume_file = request.files['resume']
            if allowed_file(resume_file.filename):
                try:
                    filename = secure_filename(f"{uid}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{resume_file.filename}")
                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    resume_file.save(filepath)
                    
                    # Parse resume and extract skills
                    skills_data = parse_resume(filepath)
                except Exception as e:
                    print(f"Error saving or parsing resume: {str(e)}")
        
        # Create user profile
        profile_data = {
            'uid': uid,
            'name': data.get('name', ''),
            'email': data.get('email', ''),
            'phone': data.get('phone', ''),
            'location': data.get('location', ''),
            'locationPreference': data.get('locationPreference', ''),
            'gender': data.get('gender', ''),
            'education': data.get('education', ''),
            'professionalStage': data.get('professionalStage', ''),
            'resume_file': filename,
            'skills': skills_data.get('skills', []),
            'categorized_skills': skills_data.get('categorized_skills', {}),
            'created_at': datetime.utcnow()
        }
        
        # Insert or update profile
        db.users.update_one(
            {'uid': uid},
            {'$set': profile_data},
            upsert=True
        )
        
        print(f"Profile created successfully for uid: {uid}")
        return jsonify({'message': 'Profile created successfully', 'status': 'success'}), 201

    except Exception as e:
        print(f"Error creating profile: {str(e)}")
        return jsonify({'error': str(e), 'status': 'error'}), 500

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
@app.route('/api/start-session', methods=['POST'])
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

@app.route('/api/send-message', methods=['POST'])
def send_message():
    data = request.json
    session_id = data.get('sessionId')
    user_message = data.get('message')

    if not session_id or session_id not in sessions:
        return jsonify({"error": "Invalid session ID"}), 400
    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    # Add profanity check before processing message
    try:
        if check_profanity(user_message):
            response = get_profanity_response()
            return jsonify({"message": response})
    except Exception as e:
        print(f"Profanity check error: {str(e)}")
        # Continue with normal processing if profanity check fails
    
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
                # Check profanity for role input
                try:
                    if check_profanity(user_message):
                        return jsonify({"message": get_profanity_response()})
                except Exception as e:
                    print(f"Profanity check error in ask_role: {str(e)}")
                
                session_data["role"] = user_message
                session_data["interview_stage"] = "ask_experience"
                return jsonify({"message": "How many years of experience do you have in this field?"})

            elif stage == "ask_experience":
                # Check profanity for experience input
                try:
                    if check_profanity(user_message):
                        return jsonify({"message": get_profanity_response()})
                except Exception as e:
                    print(f"Profanity check error in ask_experience: {str(e)}")
                
                session_data["experience"] = user_message
                session_data["interview_stage"] = "ask_skills"
                return jsonify({"message": "What are your key skills related to this role?"})

            elif stage == "ask_skills":
                # Check profanity for skills input
                try:
                    if check_profanity(user_message):
                        return jsonify({"message": get_profanity_response()})
                except Exception as e:
                    print(f"Profanity check error in ask_skills: {str(e)}")
                
                session_data["skills"] = user_message
                session_data["interview_stage"] = "start_interview"
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

    #     else:
    #         # If it's not interview, handle other chat types
    #         messages.append(HumanMessage(content=user_message))

    #         # Call the LLM for normal conversation
    #         response = llm.invoke(messages)
    #         model_reply = response.content.strip()

    #         messages.append(AIMessage(content=model_reply))

    #         return jsonify({"message": model_reply})


        else:
            messages.append(HumanMessage(content=user_message))

            try:
                # Step 1: Let the model think
                response = llm.invoke(messages)
                model_reply = response.content.strip()

                # Step 2: Check if model wants to search the internet
                search_match = re.search(r"Action:\s*Search\[(.*?)\]", model_reply, re.IGNORECASE)

                if search_match:
                    search_query = search_match.group(1)
                    print(f"🔎 Bot decided to search for: {search_query}")

                    try:
                        search_results = internet_search.invoke({"query": search_query})
                        snippets = "\n".join([doc.metadata['snippet'] for doc in search_results])

                        # Feed back the search context
                        search_context = f"Here are search results for '{search_query}':\n{snippets}\n\nUse this to answer properly."
                        messages.append(HumanMessage(content=search_context))

                        # Re-invoke model with updated context
                        response = llm.invoke(messages)
                        model_reply = response.content.strip()

                    except Exception as e:
                        model_reply = f"Sorry, I tried to search the web but something went wrong. Error: {str(e)}"

                # Step 3: Store and return model response
                messages.append(AIMessage(content=model_reply))
                return jsonify({"message": model_reply})

            except Exception as e:
                print(f"Non-interview error: {str(e)}")
                return jsonify({"error": "An error occurred while processing your request."}), 500
    except Exception as e:
        print(f"Error in processing message: {str(e)}")
        return jsonify({"error": "An error occurred while processing your request."}), 500

@app.route('/api/end-session', methods=['POST'])
def end_session():
    data = request.json
    session_id = data.get('sessionId')
    if session_id and session_id in sessions:
        del sessions[session_id]
    return jsonify({"status": "success", "message": "Session ended"})

# -------------- Run -------------- #
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)