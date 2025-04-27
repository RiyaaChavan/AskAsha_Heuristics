import re
import os
import PyPDF2
import docx2txt
import nltk
from nltk.tokenize import word_tokenize

# Download necessary NLTK resources
nltk.download('punkt')

# Define skills database
SKILL_PATTERNS = {
    # Programming Languages
    'languages': [
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'php', 'go', 'rust',
        'scala', 'kotlin', 'swift', 'objective-c', 'r', 'matlab', 'perl', 'bash', 'shell', 'sql',
        'html', 'css', 'xml', 'yaml', 'json'
    ],
    
    # Frameworks & Libraries
    'frameworks': [
        'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'asp.net',
        'laravel', 'ruby on rails', 'jquery', 'bootstrap', 'tailwind', 'next.js', 'gatsby',
        'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'scipy', 'matplotlib'
    ],
    
    # Databases
    'databases': [
        'sql', 'mysql', 'postgresql', 'mongodb', 'sqlite', 'oracle', 'redis', 'dynamodb',
        'firebase', 'cassandra', 'elasticsearch', 'neo4j', 'nosql'
    ],
    
    # DevOps & Cloud
    'devops': [
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform',
        'ansible', 'git', 'github', 'gitlab', 'bitbucket', 'jira', 'agile', 'scrum'
    ],
    
    # Mobile Development
    'mobile': [
        'android', 'ios', 'react native', 'flutter', 'xamarin', 'swift', 'kotlin',
        'mobile development', 'app development'
    ],
    
    # Soft Skills
    'soft_skills': [
        'problem solving', 'teamwork', 'communication', 'leadership', 'time management',
        'project management', 'critical thinking', 'analytical skills', 'adaptability'
    ],
    
    # Data Science & Machine Learning
    'data_science': [
        'machine learning', 'deep learning', 'neural networks', 'data analysis', 'data visualization',
        'big data', 'hadoop', 'spark', 'nlp', 'computer vision', 'ai', 'artificial intelligence',
        'data mining', 'statistical analysis', 'business intelligence', 'a/b testing'
    ],
    
    # Design
    'design': [
        'ui/ux', 'graphic design', 'adobe photoshop', 'adobe illustrator', 'figma', 'sketch',
        'responsive design', 'wireframing', 'prototyping'
    ]
}

# Create a flat list of all skills
ALL_SKILLS = []
for category, skills in SKILL_PATTERNS.items():
    ALL_SKILLS.extend(skills)

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

def parse_resume(file_path):
    """Main function to parse resume and extract skills"""
    # Extract text from the file
    text = extract_text_from_file(file_path)
    
    # Extract skills from the text
    skills_data = extract_skills_from_text(text)
    
    return skills_data
