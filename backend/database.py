from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

class Database:
    def __init__(self):
        self.client = MongoClient(os.getenv('MONGODB_URI'))
        self.db = self.client.askasha_db
        
    def get_user_collection(self):
        return self.db.users
        
    def get_user_by_uid(self, uid):
        return self.db.users.find_one({'uid': uid})
        
    def create_user(self, user_data):
        return self.db.users.insert_one(user_data)
        
    def update_user(self, uid, update_data):
        return self.db.users.update_one(
            {'uid': uid},
            {'$set': update_data}
        )
        
    def delete_user(self, uid):
        return self.db.users.delete_one({'uid': uid})