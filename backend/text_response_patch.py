def generate_text_response(query: str, conversation_history=None, resume_data=None, query_type="normal_text") -> str:
    """
    Generate a conversational response for general inquiries.
    
    Args:
        query (str): The user's current query/message
        conversation_history (list, optional): Previous conversations in chronological order
        resume_data (dict, optional): User's resume data including skills and work experience
        query_type (str): The classification of the query (normal_text, job_guidance, etc.)
    """
    # Try to import response templates, define fallbacks if not available
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
    
    # Add conversation history for context - use recent history only
    if conversation_history and len(conversation_history) > 0:
        # Only use last 3 messages for context to keep relevant
        recent_history = conversation_history[-3:] if len(conversation_history) > 3 else conversation_history
        
        messages_text = []
        for convo in recent_history:
            user_message = convo.get("message", "")
            bot_response = convo.get("response", {}).get("text", "")
            if user_message:
                messages_text.append(HumanMessage(content=user_message))
            if bot_response:
                messages_text.append(AIMessage(content=bot_response))
        
        # Add messages to the conversation
        messages.extend(messages_text)
    
    # Add the current query
    messages.append(HumanMessage(content=query))
    
    # Generate the response with added context
    response = chat_model(messages)
    return response.content.strip()
