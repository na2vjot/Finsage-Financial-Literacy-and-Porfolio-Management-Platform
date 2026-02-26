#!/usr/bin/env python3
"""
MongoDB Setup Script for FinSage
This script helps set up MongoDB database and collections
"""

import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv
import bcrypt

# Load environment variables
load_dotenv()

def setup_database():
    """Set up MongoDB database with collections and indexes"""
    try:
        # Connect to MongoDB
        mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
        client = MongoClient(mongo_uri)
        
        # Create database
        db = client['finsage']
        
        print("🔗 Connected to MongoDB")
        
        # Create collections
        collections = ['users', 'user_progress', 'saved_modules']
        
        for collection_name in collections:
            collection = db[collection_name]
            print(f"✅ Created collection: {collection_name}")
        
        # Create indexes for better performance
        print("\n📊 Creating indexes...")
        
        # Users collection indexes
        db.users.create_index("email", unique=True)
        db.users.create_index("created_at")
        print("✅ Users collection indexes created")
        
        # User progress collection indexes
        db.user_progress.create_index([("user_id", 1), ("module_id", 1)], unique=True)
        db.user_progress.create_index("user_id")
        print("✅ User progress collection indexes created")
        
        # Saved modules collection indexes
        db.saved_modules.create_index([("user_id", 1), ("module_id", 1)], unique=True)
        db.saved_modules.create_index("user_id")
        print("✅ Saved modules collection indexes created")
        
        # Create a sample admin user (optional)
        create_admin_user(db)
        
        print("\n🎉 MongoDB setup completed successfully!")
        print(f"📍 Database: {db.name}")
        print(f"📍 Collections: {', '.join(collections)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
        return False
    finally:
        if 'client' in locals():
            client.close()

def create_admin_user(db):
    """Create a sample admin user for testing"""
    try:
        # Check if admin user already exists
        existing_admin = db.users.find_one({"email": "admin@finsage.com"})
        if existing_admin:
            print("👤 Admin user already exists")
            return
        
        # Hash the password
        password = "admin123"
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Create admin user
        admin_user = {
            "name": "Admin User",
            "email": "admin@finsage.com",
            "password": hashed_password,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "is_active": True,
            "role": "admin",
            "profile": {
                "avatar_url": None,
                "bio": "System administrator",
                "location": None,
                "timezone": "UTC"
            },
            "preferences": {
                "theme": "light",
                "notifications": True,
                "language": "en"
            },
            "stats": {
                "total_modules_completed": 0,
                "total_time_spent": 0,
                "last_login": None,
                "login_count": 0
            }
        }
        
        db.users.insert_one(admin_user)
        print("👤 Created admin user: admin@finsage.com / admin123")
        
    except Exception as e:
        print(f"⚠️  Warning: Could not create admin user: {e}")

def check_mongodb_connection():
    """Check if MongoDB is running and accessible"""
    try:
        mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        
        # Test connection
        client.admin.command('ping')
        print("✅ MongoDB is running and accessible")
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("\n💡 Please make sure:")
        print("   1. MongoDB is installed and running")
        print("   2. Connection string in .env is correct")
        print("   3. MongoDB service is started")
        return False
    finally:
        if 'client' in locals():
            client.close()

def main():
    """Main setup function"""
    print("🚀 FinSage MongoDB Setup")
    print("=" * 40)
    
    # Check MongoDB connection
    if not check_mongodb_connection():
        print("\n❌ Cannot proceed with setup. Please fix MongoDB connection first.")
        sys.exit(1)
    
    # Setup database
    if setup_database():
        print("\n✨ Setup completed successfully!")
        print("\n📋 Next steps:")
        print("   1. Start the API server: python api_server.py")
        print("   2. Start the frontend: npm start (from frontend directory)")
        print("   3. Test login with: admin@finsage.com / admin123")
    else:
        print("\n❌ Setup failed. Please check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
