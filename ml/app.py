# # app.py
# from flask import Flask, request, jsonify
# import os
# import traceback
# from werkzeug.utils import secure_filename
# from parser import parse_resume
# from profanity import check_profanity, get_profanity_response
# from flask_cors import CORS


# app = Flask(__name__)


# CORS(app, origins="http://localhost:5173")


# UPLOAD_FOLDER = 'uploads'
# ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size


# # Create uploads directory if it doesn't exist
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# def allowed_file(filename):
#     """Check if the file has an allowed extension"""
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# @app.route('/extract-skills', methods=['POST'])
# def extract_skills():
#     """Endpoint to extract skills from a resume"""
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file part'}), 400
   
#     file = request.files['file']
   
#     if file.filename == '':
#         return jsonify({'error': 'No selected file'}), 400
   
#     if file and allowed_file(file.filename):
#         try:
#             # Save file temporarily
#             filename = secure_filename(file.filename)
#             file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
#             file.save(file_path)
           
#             # Parse resume and extract skills
#             skills_data = parse_resume(file_path)
           
#             # Clean up
#             os.remove(file_path)
           
#             return jsonify(skills_data)
           
#         except Exception as e:
#             # Clean up in case of error
#             if os.path.exists(file_path):
#                 os.remove(file_path)
           
#             print(f"Error extracting skills: {str(e)}")
#             print(traceback.format_exc())
#             return jsonify({'error': str(e)}), 500
   
#     return jsonify({'error': 'File type not allowed'}), 400


# # FOR CHECKING PROFANITY
# @app.route("/check_text", methods=["POST"])
# def check_text():
#     input_data = request.get_json()
#     text = input_data.get("text")
#     try:
#         if check_profanity(text):
#             response = get_profanity_response()
#             return jsonify({"profanity_detected": True, "response": response})
#         else:
#             return jsonify({"profanity_detected": False, "message": "Text is clean."})
#     except Exception as e:
#         print(f"Error checking profanity: {str(e)}")
#         return jsonify({"error": str(e)}), 500


# if __name__ == '__main__':
#     app.run(debug=True,port = 5001)
import os
import re
import traceback
import PyPDF2
import docx2txt
import nltk
from nltk.tokenize import word_tokenize
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
from profanity import check_profanity, get_profanity_response

# Download necessary NLTK resources
nltk.download('punkt_tab')

app = Flask(__name__)
CORS(app, origins="http://localhost:5173")

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Define skills database
SKILL_PATTERNS = {
    'languages': ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'php', 'go', 'rust', 'scala', 'kotlin', 'swift', 'objective-c', 'r', 'matlab', 'perl', 'bash', 'shell', 'sql', 'html', 'css', 'xml', 'yaml', 'json'],
    'frameworks': ['react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'asp.net', 'laravel', 'ruby on rails', 'jquery', 'bootstrap', 'tailwind', 'next.js', 'gatsby', 'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'scipy', 'matplotlib'],
    'databases': ['sql', 'mysql', 'postgresql', 'mongodb', 'sqlite', 'oracle', 'redis', 'dynamodb', 'firebase', 'cassandra', 'elasticsearch', 'neo4j', 'nosql'],
    'devops': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform', 'ansible', 'git', 'github', 'gitlab', 'bitbucket', 'jira', 'agile', 'scrum'],
    'mobile': ['android', 'ios', 'react native', 'flutter', 'xamarin', 'swift', 'kotlin', 'mobile development', 'app development'],
    'soft_skills': ['problem solving', 'teamwork', 'communication', 'leadership', 'time management', 'project management', 'critical thinking', 'analytical skills', 'adaptability'],
    'data_science': ['machine learning', 'deep learning', 'neural networks', 'data analysis', 'data visualization', 'big data', 'hadoop', 'spark', 'nlp', 'computer vision', 'ai', 'artificial intelligence', 'data mining', 'statistical analysis', 'business intelligence', 'a/b testing'],
    'design': ['ui/ux', 'graphic design', 'adobe photoshop', 'adobe illustrator', 'figma', 'sketch', 'responsive design', 'wireframing', 'prototyping']
}

# Create a flat list of all skills
ALL_SKILLS = []
for category, skills in SKILL_PATTERNS.items():
    ALL_SKILLS.extend(skills)

def allowed_file(filename):
    """Check if the file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text

def extract_text_from_docx(file_path):
    """Extract text from DOCX file"""
    return docx2txt.process(file_path)

def extract_text_from_txt(file_path):
    """Extract text from plain text file"""
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
        return file.read()

def extract_text_from_file(file_path):
    """Extract text from various file formats"""
    file_extension = file_path.split('.')[-1].lower()
    
    if file_extension == 'pdf':
        return extract_text_from_pdf(file_path)
    elif file_extension == 'docx':
        return extract_text_from_docx(file_path)
    elif file_extension == 'txt':
        return extract_text_from_txt(file_path)
    else:
        return ""

def extract_skills_from_text(text):
    """Extract skills from text using nltk and pattern matching"""
    # Tokenize the text into words
    words = word_tokenize(text.lower())
    
    skills_found = set()
    
    # Check if each word is a skill from our skill list
    for word in words:
        if word in ALL_SKILLS:
            skills_found.add(word)
    
    # Also look for skills mentioned in lists and bullet points
    bullet_pattern = r'(?:•|\*|\-|\d+\.)?\s*([A-Za-z0-9][\w\+\#\.\s]+)(?:,|\.|;|$)'
    for match in re.finditer(bullet_pattern, text.lower()):
        item = match.group(1).strip()
        # Check if this item contains any of our skills
        for skill in ALL_SKILLS:
            if re.search(r'\b' + re.escape(skill) + r'\b', item):
                skills_found.add(skill)
    
    # Format skills with proper capitalization
    formatted_skills = []
    for skill in skills_found:
        # Special case for acronyms
        if skill.upper() in ['HTML', 'CSS', 'SQL', 'PHP', 'AWS', 'GCP', 'API', 'AI', 'ML', 'NLP']:
            formatted_skills.append(skill.upper())
        else:
            # Capitalize first letter of each word
            formatted_skills.append(' '.join(word.capitalize() for word in skill.split()))
    
    # Categorize skills
    categorized_skills = {}
    for skill in skills_found:
        for category, category_skills in SKILL_PATTERNS.items():
            if skill in category_skills:
                if category not in categorized_skills:
                    categorized_skills[category] = []
                
                # Add with proper formatting
                if skill.upper() in ['HTML', 'CSS', 'SQL', 'PHP', 'AWS', 'GCP', 'API', 'AI', 'ML', 'NLP']:
                    categorized_skills[category].append(skill.upper())
                else:
                    categorized_skills[category].append(' '.join(word.capitalize() for word in skill.split()))
                break
    
    return {
        "skills": sorted(formatted_skills),
        "categorized_skills": categorized_skills
    }

@app.route('/extract-skills', methods=['POST'])
def extract_skills():
    """Endpoint to extract skills from a resume"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
   
    file = request.files['file']
   
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
   
    if file and allowed_file(file.filename):
        try:
            # Save file temporarily
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
           
            # Extract text from file
            text = extract_text_from_file(file_path)
            
            # Extract skills from the text
            skills_data = extract_skills_from_text(text)
           
            # Clean up
            os.remove(file_path)
           
            return jsonify(skills_data)
           
        except Exception as e:
            # Clean up in case of error
            if os.path.exists(file_path):
                os.remove(file_path)
           
            print(f"Error extracting skills: {str(e)}")
            print(traceback.format_exc())
            return jsonify({'error': str(e)}), 500
   
    return jsonify({'error': 'File type not allowed'}), 400

# FOR CHECKING PROFANITY
@app.route("/check_text", methods=["POST"])
def check_text():
    input_data = request.get_json()
    text = input_data.get("text")
    try:
        if check_profanity(text):
            response = get_profanity_response()
            return jsonify({"profanity_detected": True, "response": response})
        else:
            return jsonify({"profanity_detected": False, "message": "Text is clean."})
    except Exception as e:
        print(f"Error checking profanity: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
