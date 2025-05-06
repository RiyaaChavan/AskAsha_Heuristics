import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') 
    MONGODB_URI = os.environ.get('MONGO_URI') 
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') 
    JWT_EXPIRATION_DELTA = 60 * 60 * 24 * 30  # 30 days in seconds