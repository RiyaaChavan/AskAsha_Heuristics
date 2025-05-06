from pymongo import MongoClient
from bson import ObjectId
import datetime
import bcrypt

from config import Config

# Connect to MongoDB
client = MongoClient(Config.MONGODB_URI)
db = client.get_database()

class User:
    collection = db.users
    
    @classmethod
    def create(cls, name, email, password):
        """Create a new user with hashed password"""
        # Check if user already exists
        if cls.collection.find_one({"email": email}):
            return None
            
        # Hash the password
        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        user_data = {
            "name": name,
            "email": email,
            "password": hashed_pw,
            "profile_completed": False,
            "created_at": datetime.datetime.utcnow()
        }
        
        result = cls.collection.insert_one(user_data)
        user_data['_id'] = result.inserted_id
        return user_data
    
    @classmethod
    def get_by_email(cls, email):
        """Find a user by email"""
        return cls.collection.find_one({"email": email})
    
    @classmethod
    def get_by_id(cls, user_id):
        """Find a user by ID"""
        if not ObjectId.is_valid(user_id):
            return None
        return cls.collection.find_one({"_id": ObjectId(user_id)})
    
    @staticmethod
    def verify_password(stored_password, provided_password):
        """Verify a password against hashed password"""
        return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password)