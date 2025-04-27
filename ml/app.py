# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from langchain_cohere import ChatCohere
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
import re
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

os.environ["TAVILY_API_KEY"] = 'XBqW4qD8r6uiDf0wGAHdwA3xfZf7GQvz'
os.environ["COHERE_API_KEY"] = 'NYilw39ngvgVrZhaxDHG2mFJZTnNj6Bhzs5HnpXK'
# Initialize tools and models
internet_search = TavilySearchResults()
internet_search.name = "internet_search"
internet_search.description = "Returns a list of relevant document snippets for a textual query retrieved from the internet."

# Initialize Cohere LLM
llm = ChatCohere(
    cohere_api_key=os.getenv("COHERE_API_KEY"),
    model="command-r-plus",
    temperature=0.3
)

# Store user sessions
sessions = {}

# System prompts for different chat types
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
    "skills": """
## Task and Context
You are a skill development coach specializing in creating personalized learning roadmaps.
You help identify relevant skills for career growth, suggest learning resources, and create structured development plans.
You focus on both technical and soft skills needed for career advancement.
Use the internet_search tool if you need updated or external information.
Stay respectful, empowering, factual, motivational. NEVER create toxic, biased, or negative content.
"""
}

# Tavily Search Helper
def search_online(query):
    return internet_search.invoke({"query": query})

@app.route('/api/start-session', methods=['POST'])
def start_session():
    data = request.json
    chat_type = data.get('chatType')
    user_id = data.get('userId', 'anonymous')
    
    if chat_type not in SYSTEM_PROMPTS:
        return jsonify({"error": "Invalid chat type"}), 400
    
    # Create a new session
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        'messages': [
            SystemMessage(content=SYSTEM_PROMPTS[chat_type])
        ],
        'user_id': user_id,
        'chat_type': chat_type
    }
    
    return jsonify({
        "sessionId": session_id,
        "message": f"Started {chat_type} session"
    })

@app.route('/api/send-message', methods=['POST'])
def send_message():
    data = request.json
    session_id = data.get('sessionId')
    user_message = data.get('message')
    
    if not session_id or session_id not in sessions:
        return jsonify({"error": "Invalid session ID"}), 400
    
    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400
    
    session = sessions[session_id]
    messages = session['messages']
    chat_type = session['chat_type']
    did_search = False

    try:
        if chat_type == "interview":
            # Initialize if not already
            if "interview_stage" not in session:
                session["interview_stage"] = "ask_role"

            stage = session["interview_stage"]

            if stage == "ask_role":
                session["role"] = user_message
                session["interview_stage"] = "ask_experience"
                return jsonify({"message": "How many years of experience do you have in this field?"})

            elif stage == "ask_experience":
                session["experience"] = user_message
                session["interview_stage"] = "ask_skills"
                return jsonify({"message": "What are your key skills related to this role?"})

            elif stage == "ask_skills":
                session["skills"] = user_message
                session["interview_stage"] = "start_interview"
                # Add system prompt
                system_prompt = f"""
## Task and Context
You are a mock interview conductor bot. 
The user is preparing for the role of {session['role']} with {session['experience']} years of experience. 
Their key skills include {session['skills']}.
Ask one interview question at a time based on their profile. After each answer, ask a relevant follow-up or a new question. Conclude with rating and feedback.
"""
                messages.append(SystemMessage(content=system_prompt))
                return jsonify({"message": "Let's begin the mock interview! Ready?"})

            elif stage == "start_interview" and user_message.lower() in ["yes", "ready", "start"]:
                session["interview_stage"] = "interviewing"
                messages.append(HumanMessage(content="Generate an initial interview question based on the user's profile."))
            elif stage == "interviewing":
                messages.append(HumanMessage(content=user_message))
                messages.append(HumanMessage(content="Generate a follow-up question based on the user's response. If user responses are satisfactory, ask a different aspect. If interview is complete, conclude and rate the user."))

            # Finally, invoke model
            response = llm.invoke(messages)
            model_reply = response.content.strip()

            # Save bot's reply
            messages.append(AIMessage(content=model_reply))

            return jsonify({
                "message": model_reply,
                "didSearch": False
            })

        else:
            
    # 🌟 CAREER COACH NORMAL FLOW 🌟
            did_search = False

    # Step 1: Add human message
            messages.append(HumanMessage(content=user_message))

    # Step 2: First model response
            response = llm.invoke(messages)
            model_reply = response.content.strip()

    # Step 3: Check if model requested a search
            search_match = re.search(r"Action:\s*Search\[(.*?)\]", model_reply, re.IGNORECASE)

            if search_match:
                search_query = search_match.group(1)
                print(f"🔎 Model requested search: {search_query}")
                try:
                    search_results = search_online(search_query)
                    snippets = "\n".join([doc.metadata['snippet'] for doc in search_results])

            # Step 4: Feed search results back to model
                    search_context = f"Here are search results for '{search_query}':\n{snippets}\n\nUse this to answer properly."
                    messages.append(HumanMessage(content=search_context))

            # Step 5: Reinvoke model after search
                    response = llm.invoke(messages)
                    model_reply = response.content.strip()
                    did_search = True

                except Exception as e:
                    model_reply = f"Sorry, I tried to search but something went wrong: {str(e)}"

    # Step 6: Save final bot reply
            messages.append(AIMessage(content=model_reply))

            return jsonify({
                "message": model_reply,
                "didSearch": did_search
            })


    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/end-session', methods=['POST'])
def end_session():
    data = request.json
    session_id = data.get('sessionId')
    
    if not session_id or session_id not in sessions:
        return jsonify({"error": "Invalid session ID"}), 400
    
    # Remove session
    del sessions[session_id]
    
    return jsonify({"message": "Session ended successfully"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
