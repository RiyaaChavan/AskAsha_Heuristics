# Helper functions for use in agent.py

def extract_topic_from_query(query):
    """
    Extract the main topic or subject from a user query.
    This helps with personalizing responses.
    
    Args:
        query (str): The user's query
    
    Returns:
        str: The extracted topic
    """
    import re
    
    # Remove common words and get core topic
    # First remove common prefixes for better topic extraction
    topic = query.lower()
    for prefix in [
        "tell me about", "what is", "how to", "how do i", 
        "can you", "i need", "i want", "please", "help me with",
        "looking for", "searching for", "find", "show me"
    ]:
        if topic.startswith(prefix):
            topic = topic[len(prefix):].strip()
    
    # Remove stopwords by replacing common words with spaces
    stopwords = r'\b(a|an|the|for|to|of|with|on|at|in|by|about|and|or|but|is|are|was|were|be|been|being)\b'
    topic = re.sub(stopwords, ' ', topic)
    
    # Clean up extra spaces
    topic = re.sub(r'\s+', ' ', topic).strip()
    
    # If topic is empty or too short after cleaning, return original query
    if len(topic) < 3:
        return query
    
    return topic

def generate_dynamic_text_response(chat_model, query, conversation_history=None, resume_data=None, query_type="normal_text"):
    """
    Generate a conversational response for general inquiries with dynamic content.
    
    Args:
        chat_model: The LLM model to use
        query (str): The user's current query/message
        conversation_history (list, optional): Previous conversations in chronological order
        resume_data (dict, optional): User's resume data including skills and work experience
        query_type (str): The classification of the query (normal_text, job_guidance, etc.)
    """
    from langchain.schema import HumanMessage, SystemMessage
    
    # Try to import response templates
    try:
        from response_templates import get_greeting, get_job_guidance_response
    except ImportError:
        # Define fallback functions
        def get_greeting():
            return "Hello"
        
        def get_job_guidance_response(topic):
            return f"When it comes to {topic} in your career, there are several approaches to consider."
    
    # Customize system prompt based on query type
    if query_type == "job_guidance":
        system_prompt = f"You are a professional career coach helping with job and career guidance. The user is asking for career advice or guidance about: {query}\n\nRespond in a friendly but professional tone. Be specific and actionable in your advice. Provide 2-3 key suggestions that are practical and immediately useful. Keep your response concise (150-200 words maximum).\n\nIf appropriate, suggest resources or next steps the user could take. Use conversational, encouraging language that motivates the user.\n\nWhen referring to the job market or industry trends, be current and accurate."
    else:
        system_prompt = f"You are a helpful assistant for job seekers and career advancers named Asha. The current query is: {query}\n\nRespond in a friendly, conversational manner. Start with a brief acknowledgment. Keep responses focused and under 150 words. Make your response personalized and specific to the query. Use varied sentence structures and natural language patterns. Avoid repetitive phrases or generic responses.\n\nIf the user seems to be asking about jobs or careers but not requesting specific listings, suggest they can ask for job listings or a career roadmap.\n\nUse the conversation history to maintain context and provide relevant responses. If the user mentions @resume in their query, prioritize that information in your advice."
    
    messages = [
        SystemMessage(content=system_prompt),
    ]
    
    context = ""
    
    # Add resume data if available (when @resume tag is used)
    if "@resume" in query and resume_data:
        resume_context = "User's resume information:\n"
        
        # Add skills from resume
        skills = resume_data.get('skills', [])
        if skills:
            resume_context += "Skills: " + ", ".join(skills) + "\n"
            
        # Add work experience from resume
        work_experience = resume_data.get('workExperience', [])
        if work_experience:
            resume_context += "Work Experience:\n"
            for exp in work_experience:
                company = exp.get('company', '')
                role = exp.get('role', '')
                description = exp.get('description', '')
                if company and role:
                    resume_context += f"- {role} at {company}\n"
                    if description:
                        resume_context += f"  Description: {description[:100]}...\n"
        
        # Add education if available
        education = resume_data.get('education', [])
        if education:
            resume_context += "Education:\n"
            for edu in education:
                degree = edu.get('degree', '')
                institution = edu.get('institution', '')
                if degree and institution:
                    resume_context += f"- {degree} from {institution}\n"
        
        context += resume_context + "\n"
    
    # Add conversation history context if available
    if conversation_history and len(conversation_history) > 0:
        # The history is already in chronological order from oldest to newest
        # Include the last 3 messages for context
        recent_history = conversation_history[-3:] if len(conversation_history) > 3 else conversation_history
        
        context += "Previous messages (in chronological order):\n"
        for convo in recent_history:
            user_message = convo.get("message", "")
            bot_response = convo.get("response", {}).get("text", "")
            if user_message:
                context += f"User: {user_message}\n"
            if bot_response:
                context += f"Assistant: {bot_response}\n"
    
    # Add the current query with context
    if context:
        messages.append(HumanMessage(content=f"{context}\nCurrent query:\n{query}"))
    else:
        messages.append(HumanMessage(content=query))
    
    # Generate the response
    response = chat_model(messages)
    return response.content.strip()
