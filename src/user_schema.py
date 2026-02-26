from pymongo import MongoClient
from datetime import datetime, timedelta
import bcrypt
import os
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv()

class UserSchema:
    """User schema for MongoDB"""
    
    def __init__(self):
        self.client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017'))
        self.db = self.client['finsage']
        self.users = self.db['users']
        self.user_progress = self.db['user_progress']
        self.saved_modules = self.db['saved_modules']
        self.chat_history = self.db['chat_history']
        
        # Create indexes for better performance
        self.users.create_index("email", unique=True)
        self.users.create_index("created_at")
        self.user_progress.create_index([("user_id", 1), ("module_id", 1)], unique=True)
        self.saved_modules.create_index([("user_id", 1), ("module_id", 1)], unique=True)
        self.chat_history.create_index([("user_id", 1), ("created_at", -1)])
        self.chat_history.create_index([("user_id", 1), ("session_id", 1)])
    
    def create_user(self, name, email, password):
        """Create a new user"""
        try:
            # Check if user already exists
            if self.users.find_one({"email": email}):
                return False, "User with this email already exists"
            
            # Hash the password
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
            # Create user document
            user_doc = {
                "name": name,
                "email": email,
                "password": hashed_password,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "is_active": True,
                "profile": {
                    "avatar_url": None,
                    "bio": None,
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
            
            # Insert user
            result = self.users.insert_one(user_doc)
            
            # Initialize user progress
            self._initialize_user_progress(str(result.inserted_id))
            
            return True, "User created successfully"
            
        except Exception as e:
            return False, f"Error creating user: {str(e)}"
    
    def authenticate_user(self, email, password):
        """Authenticate user with email and password"""
        try:
            user = self.users.find_one({"email": email})
            
            if not user:
                return False, "User not found"
            
            if not user.get("is_active", True):
                return False, "Account is deactivated"
            
            # Check password
            if bcrypt.checkpw(password.encode('utf-8'), user["password"]):
                # Update last login
                self.users.update_one(
                    {"_id": user["_id"]},
                    {
                        "$set": {"last_login": datetime.utcnow()},
                        "$inc": {"stats.login_count": 1}
                    }
                )
                
                # Return user data without password
                user_data = self._sanitize_user_data(user)
                return True, user_data
            else:
                return False, "Invalid password"
                
        except Exception as e:
            return False, f"Authentication error: {str(e)}"
    
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        try:
            # Convert string user_id to ObjectId
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            user = self.users.find_one({"_id": user_id})
            if user:
                return True, self._sanitize_user_data(user)
            else:
                return False, "User not found"
        except Exception as e:
            return False, f"Error fetching user: {str(e)}"
    
    def update_user(self, user_id, update_data):
        """Update user information"""
        try:
            update_data["updated_at"] = datetime.utcnow()
            result = self.users.update_one(
                {"_id": user_id},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                return True, "User updated successfully"
            else:
                return False, "No changes made"
                
        except Exception as e:
            return False, f"Error updating user: {str(e)}"
    
    def _initialize_user_progress(self, user_id):
        """Initialize user progress tracking"""
        try:
            # This would be populated with actual module data from syllabus
            initial_modules = [
                {
                    "user_id": user_id,
                    "module_id": "basics-intro",
                    "module_name": "Introduction to Financial Literacy",
                    "section": "Basics",
                    "status": "not_started",
                    "progress": 0,
                    "time_spent": 0,
                    "started_at": None,
                    "completed_at": None,
                    "last_accessed": None
                },
                {
                    "user_id": user_id,
                    "module_id": "basics-budgeting",
                    "module_name": "Personal Budgeting Basics",
                    "section": "Basics",
                    "status": "not_started",
                    "progress": 0,
                    "time_spent": 0,
                    "started_at": None,
                    "completed_at": None,
                    "last_accessed": None
                }
            ]
            
            if initial_modules:
                self.user_progress.insert_many(initial_modules)
            
            return True, "User progress initialized"
            
        except Exception as e:
            return False, f"Error initializing progress: {str(e)}"
    
    def update_module_progress(self, user_id, module_id, progress_data):
        """Update user's progress for a specific module"""
        try:
            update_doc = {
                "progress": progress_data.get("progress", 0),
                "time_spent": progress_data.get("time_spent", 0),
                "last_accessed": datetime.utcnow()
            }
            
            if progress_data.get("status") == "completed":
                update_doc["completed_at"] = datetime.utcnow()
                update_doc["status"] = "completed"
            elif progress_data.get("status") == "in_progress":
                if not self.user_progress.find_one({
                    "user_id": user_id, 
                    "module_id": module_id, 
                    "started_at": {"$exists": True}
                }):
                    update_doc["started_at"] = datetime.utcnow()
                update_doc["status"] = "in_progress"
            
            result = self.user_progress.update_one(
                {"user_id": user_id, "module_id": module_id},
                {"$set": update_doc},
                upsert=True
            )
            
            # Update user stats
            self._update_user_stats(user_id)
            
            return True, "Progress updated"
            
        except Exception as e:
            return False, f"Error updating progress: {str(e)}"
    
    def get_user_progress(self, user_id):
        """Get all progress data for a user"""
        try:
            progress = list(self.user_progress.find({"user_id": user_id}))
            
            # Convert ObjectId to string for JSON serialization
            for p in progress:
                p["_id"] = str(p["_id"])
                if "started_at" in p and p["started_at"]:
                    p["started_at"] = p["started_at"].isoformat()
                if "completed_at" in p and p["completed_at"]:
                    p["completed_at"] = p["completed_at"].isoformat()
                if "last_accessed" in p and p["last_accessed"]:
                    p["last_accessed"] = p["last_accessed"].isoformat()
            
            return True, progress
            
        except Exception as e:
            return False, f"Error fetching progress: {str(e)}"
    
    def save_user_module(self, user_id, module_data):
        """Save a module for a user"""
        try:
            # Convert user_id to ObjectId if it's a string
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            module_doc = {
                "user_id": user_id,
                "module_id": module_data.get("module_id"),
                "module_name": module_data.get("module_name"),
                "section": module_data.get("section"),
                "description": module_data.get("description", ""),
                "difficulty": module_data.get("difficulty", "beginner"),
                "estimated_time": module_data.get("estimated_time", 30),
                "topics": module_data.get("topics", []),
                "saved_at": datetime.utcnow(),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Check if module already saved
            existing = self.saved_modules.find_one({
                "user_id": user_id,
                "module_id": module_data.get("module_id")
            })
            
            if existing:
                return False, "Module already saved"
            
            result = self.saved_modules.insert_one(module_doc)
            return True, str(result.inserted_id)
            
        except Exception as e:
            return False, f"Error saving module: {str(e)}"
    
    def get_user_saved_modules(self, user_id):
        """Get all saved modules for a user"""
        try:
            # Convert user_id to ObjectId if it's a string
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            modules = list(self.saved_modules.find({"user_id": user_id}))
            
            # Convert ObjectId to string for JSON serialization
            for module in modules:
                module["_id"] = str(module["_id"])
                module["user_id"] = str(module["user_id"])
                if "saved_at" in module and module["saved_at"]:
                    module["saved_at"] = module["saved_at"].isoformat()
            
            return True, modules
            
        except Exception as e:
            return False, f"Error fetching saved modules: {str(e)}"
    
    def get_user_statistics(self, user_id):
        """Get comprehensive statistics for a user"""
        try:
            # Convert user_id to ObjectId if it's a string
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            # Get progress data
            progress_data = list(self.user_progress.find({"user_id": user_id}))
            
            # Get saved modules
            saved_modules = list(self.saved_modules.find({"user_id": user_id}))
            
            # Calculate statistics
            total_modules = len(progress_data)
            completed_modules = len([p for p in progress_data if p.get("status") == "completed"])
            in_progress_modules = len([p for p in progress_data if p.get("status") == "in_progress"])
            not_started_modules = len([p for p in progress_data if p.get("status") == "not_started"])
            
            # Calculate total time spent (in minutes)
            total_time_spent = sum(p.get("time_spent", 0) for p in progress_data)
            
            # Calculate overall progress percentage
            overall_progress = 0
            if total_modules > 0:
                overall_progress = (completed_modules / total_modules) * 100
            
            # Get recent activity (last 7 days)
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            recent_activity = len([
                p for p in progress_data 
                if p.get("last_accessed") and p["last_accessed"] > seven_days_ago
            ])
            
            # Get most recent completed module
            most_recent_completion = None
            completed_with_dates = [
                p for p in progress_data 
                if p.get("completed_at")
            ]
            if completed_with_dates:
                most_recent_completion = max(completed_with_dates, key=lambda x: x["completed_at"])
                most_recent_completion["completed_at"] = most_recent_completion["completed_at"].isoformat()
            
            # Get study streak (consecutive days with activity)
            study_streak = self._calculate_study_streak(user_id, progress_data)
            
            statistics = {
                "modules": {
                    "total": total_modules,
                    "completed": completed_modules,
                    "in_progress": in_progress_modules,
                    "not_started": not_started_modules,
                    "saved": len(saved_modules)
                },
                "progress": {
                    "overall_percentage": round(overall_progress, 2),
                    "total_time_spent_minutes": total_time_spent,
                    "total_time_spent_hours": round(total_time_spent / 60, 2),
                    "average_time_per_module": round(total_time_spent / total_modules, 2) if total_modules > 0 else 0
                },
                "activity": {
                    "recent_activity_7_days": recent_activity,
                    "study_streak": study_streak,
                    "most_recent_completion": most_recent_completion
                },
                "achievements": self._get_user_achievements(completed_modules, total_time_spent)
            }
            
            return True, statistics
            
        except Exception as e:
            return False, f"Error fetching statistics: {str(e)}"
    
    def _calculate_study_streak(self, user_id, progress_data):
        """Calculate consecutive days of study activity"""
        try:
            # Get unique dates when user studied
            study_dates = set()
            for p in progress_data:
                if p.get("last_accessed"):
                    study_dates.add(p["last_accessed"].date())
            
            if not study_dates:
                return 0
            
            # Sort dates in descending order
            sorted_dates = sorted(study_dates, reverse=True)
            
            # Calculate streak
            streak = 0
            current_date = datetime.utcnow().date()
            
            for date in sorted_dates:
                if date == current_date:
                    streak += 1
                    current_date = current_date - timedelta(days=1)
                elif date == current_date:
                    streak += 1
                    current_date = current_date - timedelta(days=1)
                else:
                    break
            
            return streak
            
        except Exception:
            return 0
    
    def _get_user_achievements(self, completed_modules, total_time_spent):
        """Get user achievements based on progress"""
        achievements = []
        
        # Module completion achievements
        if completed_modules >= 1:
            achievements.append({
                "id": "first_module",
                "name": "First Steps",
                "description": "Completed your first module",
                "icon": "🎯",
                "earned": True
            })
        
        if completed_modules >= 5:
            achievements.append({
                "id": "five_modules",
                "name": "Learning Journey",
                "description": "Completed 5 modules",
                "icon": "🌟",
                "earned": True
            })
        
        if completed_modules >= 10:
            achievements.append({
                "id": "ten_modules",
                "name": "Dedicated Learner",
                "description": "Completed 10 modules",
                "icon": "🏆",
                "earned": True
            })
        
        # Time-based achievements
        if total_time_spent >= 60:  # 1 hour
            achievements.append({
                "id": "hour_studied",
                "name": "Time Investor",
                "description": "Studied for 1 hour total",
                "icon": "⏰",
                "earned": True
            })
        
        if total_time_spent >= 300:  # 5 hours
            achievements.append({
                "id": "five_hours",
                "name": "Financial Scholar",
                "description": "Studied for 5 hours total",
                "icon": "📚",
                "earned": True
            })
        
        return achievements
    
    def save_module(self, user_id, module_id, module_data):
        """Save a module for user"""
        try:
            saved_module = {
                "user_id": user_id,
                "module_id": module_id,
                "module_name": module_data.get("module_name"),
                "section": module_data.get("section"),
                "saved_at": datetime.utcnow(),
                "notes": module_data.get("notes", "")
            }
            
            # Check if already saved
            existing = self.saved_modules.find_one({
                "user_id": user_id,
                "module_id": module_id
            })
            
            if existing:
                return False, "Module already saved"
            
            self.saved_modules.insert_one(saved_module)
            return True, "Module saved successfully"
            
        except Exception as e:
            return False, f"Error saving module: {str(e)}"
    
    def unsave_user_module(self, user_id, module_id):
        """Remove a saved module for user"""
        try:
            from bson import ObjectId
            
            # Convert user_id to ObjectId if it's a valid ObjectId string
            try:
                user_object_id = ObjectId(user_id)
            except:
                user_object_id = user_id
            
            # Try to find and delete with both ObjectId and string user_id
            result = self.saved_modules.delete_one({
                "$or": [
                    {"user_id": user_id},
                    {"user_id": user_object_id}
                ],
                "module_id": module_id
            })
            
            if result.deleted_count > 0:
                return True, "Module removed successfully"
            else:
                # Debug: let's see what's actually in the collection
                sample = self.saved_modules.find_one({"module_id": module_id})
                if sample:
                    print(f"Debug: Found module with user_id: {sample.get('user_id')} (type: {type(sample.get('user_id'))})")
                    print(f"Debug: Looking for user_id: {user_id} (type: {type(user_id)})")
                
                return False, "Module not found in saved modules"
                
        except Exception as e:
            return False, f"Error removing module: {str(e)}"
    
    def complete_user_module(self, user_id, module_id):
        """Mark a module as completed for user"""
        try:
            from datetime import datetime
            
            # Check if module is already completed
            existing_progress = self.module_progress.find_one({
                "user_id": user_id,
                "module_id": module_id
            })
            
            if existing_progress and existing_progress.get('status') == 'completed':
                return False, "Module already marked as completed"
            
            # Update or create progress entry
            if existing_progress:
                self.module_progress.update_one(
                    {"user_id": user_id, "module_id": module_id},
                    {
                        "$set": {
                            "status": "completed",
                            "progress": 100,
                            "completed_at": datetime.utcnow(),
                            "last_accessed": datetime.utcnow()
                        }
                    }
                )
            else:
                # Create new progress entry
                progress_data = {
                    "user_id": user_id,
                    "module_id": module_id,
                    "status": "completed",
                    "progress": 100,
                    "time_spent": 0,
                    "started_at": datetime.utcnow(),
                    "completed_at": datetime.utcnow(),
                    "last_accessed": datetime.utcnow(),
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                self.module_progress.insert_one(progress_data)
            
            # Update user statistics
            self._update_user_stats(user_id)
            
            return True, "Module marked as completed successfully"
            
        except Exception as e:
            return False, f"Error completing module: {str(e)}"
    
    def get_saved_modules(self, user_id):
        """Get all saved modules for a user"""
        try:
            modules = list(self.saved_modules.find({"user_id": user_id}))
            
            for m in modules:
                m["_id"] = str(m["_id"])
                m["saved_at"] = m["saved_at"].isoformat()
            
            return True, modules
            
        except Exception as e:
            return False, f"Error fetching saved modules: {str(e)}"
    
    def _update_user_stats(self, user_id):
        """Update user statistics based on progress"""
        try:
            # Count completed modules
            completed_count = self.user_progress.count_documents({
                "user_id": user_id,
                "status": "completed"
            })
            
            # Calculate total time spent
            total_time = list(self.user_progress.aggregate([
                {"$match": {"user_id": user_id}},
                {"$group": {"_id": None, "total_time": {"$sum": "$time_spent"}}}
            ]))
            
            total_time_spent = total_time[0]["total_time"] if total_time else 0
            
            # Update user stats
            self.users.update_one(
                {"_id": user_id},
                {
                    "$set": {
                        "stats.total_modules_completed": completed_count,
                        "stats.total_time_spent": total_time_spent,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
        except Exception as e:
            print(f"Error updating user stats: {e}")
    
    def _sanitize_user_data(self, user):
        """Remove sensitive data from user object"""
        user_data = dict(user)
        user_data["_id"] = str(user_data["_id"])
        
        # Remove sensitive fields
        if "password" in user_data:
            del user_data["password"]
        
        # Convert datetime objects to strings
        if "created_at" in user_data and user_data["created_at"]:
            if hasattr(user_data["created_at"], 'isoformat'):
                user_data["created_at"] = user_data["created_at"].isoformat()
        if "updated_at" in user_data and user_data["updated_at"]:
            if hasattr(user_data["updated_at"], 'isoformat'):
                user_data["updated_at"] = user_data["updated_at"].isoformat()
        if "stats" in user_data and user_data["stats"].get("last_login"):
            last_login = user_data["stats"]["last_login"]
            if last_login and hasattr(last_login, 'isoformat'):
                user_data["stats"]["last_login"] = last_login.isoformat()
        
        return user_data
    
    def close(self):
        """Close database connection"""
        self.client.close()
    
    def save_chat_message(self, user_id, session_id, message_type, content, metadata=None):
        """Save a chat message to the database"""
        try:
            # Convert user_id to ObjectId if it's a string
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            chat_message = {
                "user_id": user_id,
                "session_id": session_id,
                "message_type": message_type,  # 'user' or 'bot'
                "content": content,
                "metadata": metadata or {},
                "created_at": datetime.utcnow(),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            result = self.chat_history.insert_one(chat_message)
            return True, str(result.inserted_id)
            
        except Exception as e:
            return False, f"Error saving chat message: {str(e)}"
    
    def get_chat_history(self, user_id, session_id=None, limit=50):
        """Get chat history for a user"""
        try:
            # Convert user_id to ObjectId if it's a string
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            # Build query
            query = {"user_id": user_id}
            if session_id:
                query["session_id"] = session_id
            
            # Get messages sorted by creation time (newest first)
            messages = list(
                self.chat_history.find(query)
                .sort("created_at", -1)
                .limit(limit)
            )
            
            # Convert ObjectId to string and format for frontend
            formatted_messages = []
            for message in messages:
                formatted_message = {
                    "id": str(message["_id"]),
                    "user_id": str(message["user_id"]),
                    "session_id": message["session_id"],
                    "message_type": message["message_type"],
                    "content": message["content"],
                    "metadata": message.get("metadata", {}),
                    "timestamp": message["timestamp"],
                    "created_at": message["created_at"].isoformat()
                }
                formatted_messages.append(formatted_message)
            
            # Return in chronological order (oldest first for display)
            return True, list(reversed(formatted_messages))
            
        except Exception as e:
            return False, f"Error fetching chat history: {str(e)}"
    
    def get_chat_sessions(self, user_id, limit=10):
        """Get all chat sessions for a user"""
        try:
            # Convert user_id to ObjectId if it's a string
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            # Aggregate to get unique sessions with their latest message
            sessions = list(
                self.chat_history.aggregate([
                    {"$match": {"user_id": user_id}},
                    {"$sort": {"created_at": -1}},
                    {"$group": {
                        "_id": "$session_id",
                        "last_message": {"$first": "$content"},
                        "last_message_time": {"$first": "$created_at"},
                        "message_count": {"$sum": 1}
                    }},
                    {"$sort": {"last_message_time": -1}},
                    {"$limit": limit}
                ])
            )
            
            # Format sessions
            formatted_sessions = []
            for session in sessions:
                formatted_session = {
                    "session_id": session["_id"],
                    "last_message": session["last_message"],
                    "last_message_time": session["last_message_time"].isoformat(),
                    "message_count": session["message_count"]
                }
                formatted_sessions.append(formatted_session)
            
            return True, formatted_sessions
            
        except Exception as e:
            return False, f"Error fetching chat sessions: {str(e)}"
    
    def delete_chat_session(self, user_id, session_id):
        """Delete an entire chat session"""
        try:
            # Convert user_id to ObjectId if it's a string
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            result = self.chat_history.delete_many({
                "user_id": user_id,
                "session_id": session_id
            })
            
            return True, f"Deleted {result.deleted_count} messages"
            
        except Exception as e:
            return False, f"Error deleting chat session: {str(e)}"
    
    def clear_chat_history(self, user_id):
        """Clear all chat history for a user"""
        try:
            # Convert user_id to ObjectId if it's a string
            if isinstance(user_id, str):
                user_id = ObjectId(user_id)
            
            result = self.chat_history.delete_many({"user_id": user_id})
            return True, f"Cleared {result.deleted_count} messages"
            
        except Exception as e:
            return False, f"Error clearing chat history: {str(e)}"
