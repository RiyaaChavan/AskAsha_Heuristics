from flask import Flask, request, jsonify
from openai import OpenAI
import os

app = Flask(__name__)
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

# Set your OpenAI API key
 # Make sure to set the environment variable properly

# Define the system prompt
system_prompt = """
You are a helpful, empathetic, and professional helpdesk assistant specializing in career, job, and office-related queries, 
especially for women at different stages of their careers.

Your duties:
- Provide detailed, actionable, human-like advice based on user queries.
- Stay positive, encouraging, and supportive.
- Never give legal, medical, or psychological advice. 
- If the user asks about harassment, discrimination, abuse, depression, or any critical incident (examples: 'I was harassed at work', 'I'm facing mental health issues due to workplace bullying'), 
  respond sensitively by saying: "I'm just an assistant and cannot handle such serious issues directly. 
  I strongly recommend contacting your HR department, trusted authorities, or appropriate helplines for assistance."

Handle queries like:
- How to negotiate salary
- How to ask for a promotion
- How to return to work after maternity leave
- How to break into leadership roles
- How to balance career and personal life
- How to deal with discrimination and interruptions in meetings
- How to start a business
- Handling imposter syndrome
- Networking effectively

Always offer structured, actionable advice in points or steps wherever possible.

If the user gives feedback that they are unhappy with your response, apologize and reframe your advice in a more customized, detailed, and practical manner based on the query context.
"""

# Sensitive topics trigger words
sensitive_keywords = [
    "harassed", "harassment", "assault", "abuse", "discriminated", "mental health", 
    "violence", "depression", "bullied", "bullying", "abused", "threatened", "unsafe", "sexual harassment"
]

def is_sensitive_query(user_query):
    query = user_query.lower()
    return any(keyword in query for keyword in sensitive_keywords)

# Function to generate assistant response
def generate_response(user_query, refine=False):
    if is_sensitive_query(user_query):
        return ("I'm just an assistant and cannot handle such serious issues directly. "
                "I strongly recommend contacting your HR department, trusted authorities, "
                "or appropriate helplines for assistance.")
    
    # Build messages
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_query}
    ]

    if refine:
        messages.append(
            {"role": "system", "content": "The user was not satisfied. Refine your previous advice with more customized, detailed, and practical suggestions."}
        )

    # OpenAI API call
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.7,
        max_tokens=800
    )

    return response.choices[0].message.content.strip()

@app.route('/help', methods=['POST'])
def chat():
    data = request.get_json()

    if not data or 'query' not in data:
        return jsonify({"error": "Missing 'query' in request body"}), 400

    user_query = data['query']
    feedback = data.get('feedback', 'yes').lower()  # Default feedback is 'yes'

    refine = True if feedback == 'no' else False

    assistant_response = generate_response(user_query, refine=refine)

    return jsonify({
        "user_query": user_query,
        "assistant_response": assistant_response
    }), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
