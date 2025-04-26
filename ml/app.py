# app.py
from flask import Flask, request, jsonify
import asyncio
from herkey.services.agent_service import AgentService
from herkey.utils.helpers import validate_query_data, format_response
from herkey.config.config import Config

app = Flask(__name__)
agent_service = AgentService()

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Endpoint for chatting with the HerKey agents
    
    Request body:
    {
        "query": "jobs for SDE for married women",
        "type": "jobs" // Optional, defaults to "jobs"
    }
    
    Returns:
        JSON response with the agent's answer
    """
    try:
        data = request.get_json()
        
        # Validate the request data
        is_valid, error_message = validate_query_data(data)
        if not is_valid:
            return jsonify(format_response("error", error_message)), 400
        
        # Process the query
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        response = loop.run_until_complete(agent_service.process_query(data))
        loop.close()
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify(format_response("error", f"An error occurred: {str(e)}")), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    
    Returns:
        JSON response indicating the service is running
    """
    return jsonify({
        "status": "success",
        "message": "HerKey chatbot service is running",
        "version": "1.0.0"
    })

if __name__ == '__main__':
    app.run(debug=Config.DEBUG, host='0.0.0.0', port=5000)
