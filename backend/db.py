from pymongo import MongoClient
from bson.objectid import ObjectId
import os
from datetime import datetime
import bcrypt
import secrets
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(mongo_uri)
db = client["herkey_db"]

# Collections
users = db["users"]
conversations = db["conversations"]

# User management functions
def create_user(username, email, password):
    """
    Create a new user in the database
    Returns user_id if successful, None if email already exists
    """
    # Check if user already exists
    if users.find_one({"email": email}):
        return None
    
    # Hash the password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    # Generate API key for the user
    api_key = secrets.token_hex(16)
    
    # Create user document
    user = {
        "username": username,
        "email": email,
        "password": hashed_password,
        "api_key": api_key,
        "created_at": datetime.now(),
        "last_login": None
    }
    
    # Insert user document
    result = users.insert_one(user)
    return str(result.inserted_id)

def authenticate_user(email, password):
    """
    Authenticate a user with email and password
    Returns user_id if successful, None if failed
    """
    user = users.find_one({"email": email})
    if user and bcrypt.checkpw(password.encode('utf-8'), user["password"]):
        # Update last login timestamp
        users.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.now()}}
        )
        return str(user["_id"])
    return None

def get_user_by_id(user_id):
    """
    Get user by ID
    Returns user document if found, None otherwise
    """
    try:
        user = users.find_one({"_id": ObjectId(user_id)})
        if user:
            # Don't return the password hash
            user.pop("password", None)
            user["_id"] = str(user["_id"])
            return user
        return None
    except:
        return None

def save_conversation(user_id, message, response):
    """
    Save conversation to database
    Returns conversation ID
    """
    conversation = {
        "user_id": ObjectId(user_id),
        "message": message,
        "response": response,
        "timestamp": datetime.now()
    }
    result = conversations.insert_one(conversation)
    return str(result.inserted_id)

def get_user_conversations(user_id, limit=10):
    """
    Get user conversations
    Returns list of conversations
    """
    convo_list = []
    try:
        cursor = conversations.find({"user_id": ObjectId(user_id)}).sort("timestamp", -1).limit(limit)
        for convo in cursor:
            convo["_id"] = str(convo["_id"])
            convo["user_id"] = str(convo["user_id"])
            convo_list.append(convo)
        return convo_list
    except Exception as e:
        print(f"Error retrieving conversations: {e}")
        return []