"""
Functions for handling resume-related requests without explicit @resume tag
"""

import re
from langchain.schema import HumanMessage, SystemMessage

def detect_resume_request(prompt: str) -> bool:
    """
    Detect if the prompt is asking for resume creation or guidance without @resume tag
    
    Args:
        prompt (str): The user's current query/message
    
    Returns:
        bool: True if prompt is asking for resume creation, False otherwise
    """
    # Common phrases that indicate a resume request
    resume_patterns = [
        r"create\s+(?:a|my)\s+resume",
        r"make\s+(?:a|my)\s+resume",
        r"build\s+(?:a|my)\s+resume",
        r"write\s+(?:a|my)\s+resume",
        r"resume\s+for\s+(?:this|the)\s+role",
        r"resume\s+template",
        r"help\s+(?:me\s+)?with\s+(?:my\s+)?resume",
        r"guide\s+(?:me\s+)?(?:in|on)\s+(?:creating|making|writing)\s+(?:a|my)\s+resume",
        r"prepare\s+(?:a|my)\s+resume",
        r"draft\s+(?:a|my)\s+resume"
    ]
    
    # Check if any pattern matches
    prompt_lower = prompt.lower()
    for pattern in resume_patterns:
        if re.search(pattern, prompt_lower):
            return True
    
    return False

def extract_role_from_conversation(chat_model, prompt: str, conversation_history=None):
    """
    Extract the job role from conversation history or current prompt
    
    Args:
        chat_model: The LLM model to use
        prompt (str): The user's current query/message
        conversation_history (list, optional): Previous conversations in chronological order
    
    Returns:
        str: The extracted job role or None if not found
    """
    try:
        # If there's no conversation history, try to extract from the prompt
        if not conversation_history or len(conversation_history) == 0:
            return None
        
        system_prompt = """
        Extract the specific job role or position the user is interested in based on the conversation history.
        Return ONLY the job role as a short phrase (e.g., "Java Frontend Developer", "Data Scientist").
        If multiple roles are mentioned, return the most recent one.
        If no specific role is mentioned, return "NONE".
        """
        
        # Create context from conversation history
        context = "Conversation history:\n"
        # Look at the last few messages for better context
        recent_history = conversation_history[-5:] if len(conversation_history) > 5 else conversation_history
        
        for convo in recent_history:
            user_message = convo.get("message", "")
            bot_response = convo.get("response", {}).get("text", "")
            if user_message:
                context += f"User: {user_message}\n"
            if bot_response:
                context += f"Assistant: {bot_response}\n"
        
        context += f"\nCurrent user query: {prompt}\n"
        context += "\nWhat specific job role or position is the user interested in based on this conversation?"
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=context)
        ]
        
        response = chat_model.invoke(messages)
        extracted_role = response.content.strip()
        
        # Return None if no role was found
        if extracted_role.lower() == "none":
            return None
            
        return extracted_role
    
    except Exception as e:
        print(f"Error extracting role from conversation: {str(e)}")
        return None

def generate_resume_template(chat_model, job_role: str):
    """
    Generate a detailed resume template for a specific job role
    
    Args:
        chat_model: The LLM model to use
        job_role (str): The job role to generate resume template for
    
    Returns:
        str: A detailed resume template
    """
    try:
        system_prompt = f"""
        Create a detailed and professional resume template specifically tailored for a {job_role} position.
        
        Include the following sections with relevant examples and placeholders:
        1. Header with contact information
        2. Professional summary (specifically tailored for this role)
        3. Skills section (with relevant technical and soft skills for this specific role)
        4. Work experience (with bullet points demonstrating achievements relevant to this role)
        5. Education
        6. Projects (if applicable)
        7. Certifications (relevant to this role)
        
        Provide specific examples and tailored content for the {job_role} position, not generic resume advice.
        Make the template comprehensive, practical and immediately usable.
        """
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Create a detailed resume template for a {job_role} position.")
        ]
        
        response = chat_model.invoke(messages)
        return response.content.strip()
    
    except Exception as e:
        print(f"Error generating resume template: {str(e)}")
        return "I apologize, but I encountered an error while generating a resume template. Please try again."
