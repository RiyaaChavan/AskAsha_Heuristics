# utils/helpers.py
import json

def validate_query_data(data):
    """
    Validate the query data
    
    Args:
        data (dict): Query data to validate
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not data:
        return False, "Request body is empty"
    
    if 'query' not in data:
        return False, "Query field is required"
    
    if not data['query']:
        return False, "Query cannot be empty"
    
    return True, None

def format_response(status, message, data=None):
    """
    Format the API response
    
    Args:
        status (str): Response status
        message (str): Response message
        data (dict, optional): Response data
        
    Returns:
        dict: Formatted response
    """
    return {
        "status": status,
        "message": message,
        "data": data
    }
