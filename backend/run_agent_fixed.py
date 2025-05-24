def run_agent(prompt: str, conversation_history=None, resume_data=None) -> dict:
    """
    Process a user prompt and return an appropriate response.
    Returns a dictionary in the format expected by the frontend.
    
    Args:
        prompt (str): The user's current query/message
        conversation_history (list, optional): Previous conversation messages for context
        resume_data (dict, optional): User's resume data including skills and work experience
    """
    # Step 1: Classify the query
    query_type = classify_query(prompt)
    
    # Step 2: Handle based on classification
    if query_type == "job_search":
        # Handle job search with resume data if available
        job_params = extract_job_search_params(prompt, conversation_history, resume_data)
        return format_response(query_type, prompt, job_params)
    
    elif query_type == "roadmap":
        # Handle roadmap with conversation history for context
        roadmap_items = generate_roadmap(prompt, conversation_history)
        return format_response(query_type, prompt, roadmap_items)
    
    elif query_type == "events":
        # Handle events requests
        return format_response(query_type, prompt, None)
    
    elif query_type == "job_guidance":
        # Handle job guidance with specialized response
        # Try to extract topic for better contextual responses
        topic = None
        try:
            from helper_funcs import extract_topic_from_query
            topic = extract_topic_from_query(prompt)
        except ImportError:
            # If extraction fails, use the prompt as topic
            topic = prompt
        
        # Check if this is a resume-context query
        has_resume_context = bool(resume_data and prompt and '@resume' in prompt)
        
        # Generate response with appropriate context
        guidance_response = generate_text_response(prompt, conversation_history, resume_data, query_type="job_guidance")
        
        # Pass topic to format_response
        return format_response("normal_text", prompt, guidance_response, topic=topic)
    
    else:
        # Handle normal text with resume context if available
        text_response = generate_text_response(prompt, conversation_history, resume_data)
        return format_response("normal_text", prompt, text_response)
