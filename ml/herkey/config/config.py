# config/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    HERKEY_API_BASE_URL = os.getenv('HERKEY_API_BASE_URL', 'https://api-prod.herkey.com/api/v1/herkey')
    DEBUG = os.getenv('FLASK_ENV') == 'development'
