"""
Update the parse_resume function in app.py to use the Gemini API
"""

import os
import shutil

# Backup the original file
shutil.copy('app.py', 'app.py.bak')

with open('app.py', 'r') as f:
    content = f.read()

# Find the current parse_resume function
start_pattern = "def parse_resume(file_path):"
end_pattern = "# -------------- Health Check -------------- #"

start_index = content.find(start_pattern)
end_index = content.find(end_pattern)

if start_index != -1 and end_index != -1:
    # Replace the function
    new_function = """def parse_resume(file_path):
    \"\"\"Main function to parse resume and extract skills and work experience\"\"\"
    try:
        # Import and use the Gemini parser
        from parse_resume_gemini import parse_resume_with_gemini
        
        # Try parsing with Gemini first (modern AI approach)
        print("Attempting to parse resume with Gemini API...")
        gemini_data = parse_resume_with_gemini(file_path)
        
        # Check if Gemini returned valid data
        if (gemini_data and 
            isinstance(gemini_data, dict) and 
            (gemini_data.get("skills") or gemini_data.get("work_experience"))):
            print("Successfully parsed resume with Gemini API")
            return gemini_data
            
        # If Gemini fails or returns empty data, fall back to traditional parsing
        print("Falling back to traditional resume parsing...")
        # Extract text from the file
        text = extract_text_from_file(file_path)
        
        # Extract skills from the text
        skills_data = extract_skills_from_text(text)
        
        # Add an empty work experience list for backward compatibility
        skills_data["work_experience"] = []
        
        return skills_data
    except Exception as e:
        print(f"Error in parse_resume: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"skills": [], "categorized_skills": {}, "work_experience": []}

"""
    
    # Update the content
    updated_content = content[:start_index] + new_function + content[end_index:]
    
    # Write back to the file
    with open('app.py', 'w') as f:
        f.write(updated_content)
    
    print("Successfully updated parse_resume function in app.py")
else:
    print("Couldn't find the parse_resume function in app.py")
