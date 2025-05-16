import os
import json
import mimetypes
import traceback
import base64
import google.generativeai as genai
import re
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not set in environment variables")

def parse_resume_with_gemini(file_path):
    """Parse resume using Gemini API to extract skills and work experience"""
    try:
        if not GEMINI_API_KEY:
            print("Error: GEMINI_API_KEY not set")
            return {"skills": [], "categorized_skills": {}, "work_experience": []}
        
        # Check file type and read content
        file_extension = file_path.split('.')[-1].lower()
        if file_extension == 'pdf':
            # For PDFs, we need to send the file directly
            with open(file_path, 'rb') as f:
                file_content = f.read()
                
            # Create Gemini model for multimodal processing (handles PDFs)
            model = genai.GenerativeModel('gemini-1.5-pro')
            
            # Prompt for Gemini to extract skills and experience
            prompt = """
            You are a professional resume analyzer. Extract the following information from this resume:

            1. SKILLS: Extract all professional skills mentioned in the resume, including:
               - Technical skills (programming languages, tools, platforms)
               - Soft skills
               - Domain knowledge
               - Certifications

            2. WORK EXPERIENCE: Extract all work experience entries, including:
               - Position/title
               - Company name
               - Duration/dates
               - Responsibilities and achievements

            Format the output as a valid JSON object with the following structure:
            {
              "skills": ["Skill1", "Skill2", "Skill3", ...],
              "categorized_skills": {
                "technical": ["Skill1", "Skill2", ...],
                "soft_skills": ["Skill3", "Skill4", ...],
                "domain_knowledge": ["Skill5", "Skill6", ...],
                "other": ["Skill7", "Skill8", ...]
              },
              "work_experience": [
                "Position at Company, Duration",
                "• Responsibility or achievement 1",
                "• Responsibility or achievement 2",
                ...
              ]
            }
            
            Return ONLY the JSON object without any other text.
            """
            
            # Generate response using Gemini
            response = model.generate_content(
                [{"text": prompt}, {"mime_type": "application/pdf", "data": file_content}],
                generation_config={"temperature": 0.2}
            )
            
            # Extract and parse the JSON response
            response_text = response.text
            
            # Sometimes the response may include ```json and ``` markers, so let's remove them
            if '```json' in response_text:
                json_content = response_text.split('```json')[1].split('```')[0].strip()
            elif '```' in response_text:
                json_content = response_text.split('```')[1].strip()
            else:
                json_content = response_text.strip()
            
            # Parse the JSON response
            try:
                parsed_data = json.loads(json_content)
                print(f"Successfully parsed resume with Gemini: Found {len(parsed_data.get('skills', []))} skills and {len(parsed_data.get('work_experience', []))} work experience entries")
                return parsed_data
                
            except json.JSONDecodeError as e:
                print(f"Error decoding Gemini API JSON response: {str(e)}")
                print(f"Raw response: {response_text}")
                # Fall back to traditional parsing if JSON parsing fails
                return {"skills": [], "categorized_skills": {}, "work_experience": []}
                
        else:
            # For non-PDF files like DOCX, we need to extract text first
            from docx2txt import process as docx_to_text
            
            if file_extension == 'docx':
                text = docx_to_text(file_path)
            else:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()
            
            # Create Gemini model for text processing
            model = genai.GenerativeModel('gemini-1.5-pro')
            
            # Generate response using Gemini
            response = model.generate_content(f"""
            Analyze this resume text and extract skills and work experience:
            
            {text}
            
            Format the output as a valid JSON object with the following structure:
            {{
              "skills": ["Skill1", "Skill2", "Skill3", ...],
              "categorized_skills": {{
                "technical": ["Skill1", "Skill2", ...],
                "soft_skills": ["Skill3", "Skill4", ...],
                "domain_knowledge": ["Skill5", "Skill6", ...],
                "other": ["Skill7", "Skill8", ...]
              }},
              "work_experience": [
                "Position at Company, Duration",
                "• Responsibility or achievement 1",
                "• Responsibility or achievement 2",
                ...
              ]
            }}
            
            Return ONLY the JSON object without any other text.
            """)
            
            # Extract and parse the JSON response
            response_text = response.text
            
            # Sometimes the response may include ```json and ``` markers, so let's remove them
            if '```json' in response_text:
                json_content = response_text.split('```json')[1].split('```')[0].strip()
            elif '```' in response_text:
                json_content = response_text.split('```')[1].strip()
            else:
                json_content = response_text.strip()
            
            # Parse the JSON response
            try:
                parsed_data = json.loads(json_content)
                print(f"Successfully parsed resume with Gemini: Found {len(parsed_data.get('skills', []))} skills and {len(parsed_data.get('work_experience', []))} work experience entries")
                return parsed_data
                
            except json.JSONDecodeError as e:
                print(f"Error decoding Gemini API JSON response: {str(e)}")
                print(f"Raw response: {response_text}")
                # Fall back to traditional parsing if JSON parsing fails
                return {"skills": [], "categorized_skills": {}, "work_experience": []}
                
    except Exception as e:
        print(f"Error in Gemini resume parsing: {str(e)}")
        traceback.print_exc()
        # Fall back to traditional parsing if Gemini fails
        return {"skills": [], "categorized_skills": {}, "work_experience": []}

# Test the function
if __name__ == "__main__":
    test_file_path = "Riya-Chavan-Work-New.pdf" 
    if os.path.exists(test_file_path):
        results = parse_resume_with_gemini(test_file_path)
        print(json.dumps(results, indent=2))
    else:
        print(f"Test file not found: {test_file_path}")
