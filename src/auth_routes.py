from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import os
from datetime import datetime, timedelta
from functools import wraps
import sys
import os

# Add the src directory to the path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from src.user_schema import UserSchema

class AuthRoutes:
    """Authentication routes for the API"""
    
    def __init__(self, app):
        self.app = app
        self.user_schema = UserSchema()
        self.SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-here')
        self.TOKEN_EXPIRATION = int(os.getenv('TOKEN_EXPIRATION_HOURS', 24))
        
        # Register authentication routes
        self._register_routes()
    
    def _register_routes(self):
        """Register all authentication routes"""
        
        @self.app.route('/api/auth/register', methods=['POST'])
        def register():
            """Register a new user"""
            try:
                data = request.get_json()
                
                # Validate required fields
                if not data or not data.get('name') or not data.get('email') or not data.get('password'):
                    return jsonify({
                        'success': False,
                        'message': 'Name, email, and password are required'
                    }), 400
                
                name = data.get('name').strip()
                email = data.get('email').strip().lower()
                password = data.get('password')
                
                # Basic validation
                if len(name) < 2:
                    return jsonify({
                        'success': False,
                        'message': 'Name must be at least 2 characters long'
                    }), 400
                
                if len(password) < 6:
                    return jsonify({
                        'success': False,
                        'message': 'Password must be at least 6 characters long'
                    }), 400
                
                # Create user
                success, message = self.user_schema.create_user(name, email, password)
                
                if success:
                    return jsonify({
                        'success': True,
                        'message': 'User registered successfully'
                    }), 201
                else:
                    return jsonify({
                        'success': False,
                        'message': message
                    }), 400
                    
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Registration error: {str(e)}'
                }), 500
        
        @self.app.route('/api/auth/login', methods=['POST'])
        def login():
            """Login user"""
            try:
                data = request.get_json()
                
                if not data or not data.get('email') or not data.get('password'):
                    return jsonify({
                        'success': False,
                        'message': 'Email and password are required'
                    }), 400
                
                email = data.get('email').strip().lower()
                password = data.get('password')
                
                # Authenticate user
                success, result = self.user_schema.authenticate_user(email, password)
                
                if success:
                    user_data = result
                    
                    # Generate JWT token
                    token = jwt.encode({
                        'user_id': user_data['_id'],
                        'email': user_data['email'],
                        'exp': datetime.utcnow() + timedelta(hours=self.TOKEN_EXPIRATION)
                    }, self.SECRET_KEY, algorithm='HS256')
                    
                    return jsonify({
                        'success': True,
                        'message': 'Login successful',
                        'token': token,
                        'user': user_data
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'message': result
                    }), 401
                    
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Login error: {str(e)}'
                }), 500
        
        @self.app.route('/api/auth/verify', methods=['POST'])
        def verify_token():
            """Verify JWT token and return user data"""
            try:
                data = request.get_json()
                token = data.get('token') if data else None
                
                if not token:
                    return jsonify({
                        'success': False,
                        'message': 'Token is required'
                    }), 400
                
                # Decode token
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Get user data
                success, user_data = self.user_schema.get_user_by_id(user_id)
                
                if success:
                    return jsonify({
                        'success': True,
                        'user': user_data
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'message': 'User not found'
                    }), 404
                    
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Update progress error: {str(e)}'
                }), 500
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Token verification error: {str(e)}'
                }), 500
        
        @self.app.route('/api/auth/profile', methods=['GET'])
        def get_profile():
            """Get user profile (protected route)"""
            try:
                # Verify token
                token = request.headers.get('Authorization')
                if not token or not token.startswith('Bearer '):
                    return jsonify({
                        'success': False,
                        'message': 'Authorization token required'
                    }), 401
                
                token = token.split(' ')[1]
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Get user data
                success, user_data = self.user_schema.get_user_by_id(user_id)
                
                if success:
                    return jsonify({
                        'success': True,
                        'user': user_data
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'message': 'User not found'
                    }), 404
                    
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Update progress error: {str(e)}'
                }), 500
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Profile error: {str(e)}'
                }), 500
        
        @self.app.route('/api/auth/profile', methods=['PUT'])
        def update_profile():
            """Update user profile (protected route)"""
            try:
                # Verify token
                token = request.headers.get('Authorization')
                if not token or not token.startswith('Bearer '):
                    return jsonify({
                        'success': False,
                        'message': 'Authorization token required'
                    }), 401
                
                token = token.split(' ')[1]
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Get update data
                data = request.get_json()
                if not data:
                    return jsonify({
                        'success': False,
                        'message': 'Update data is required'
                    }), 400
                
                # Remove fields that shouldn't be updated directly
                update_data = {k: v for k, v in data.items() 
                             if k not in ['_id', 'password', 'email', 'created_at', 'stats']}
                
                # Update user
                success, message = self.user_schema.update_user(user_id, update_data)
                
                if success:
                    # Get updated user data
                    _, user_data = self.user_schema.get_user_by_id(user_id)
                    return jsonify({
                        'success': True,
                        'message': message,
                        'user': user_data
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'message': message
                    }), 400
                    
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Update progress error: {str(e)}'
                }), 500
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Profile update error: {str(e)}'
                }), 500
        
        @self.app.route('/api/user/progress', methods=['GET'])
        def get_user_progress():
            """Get user progress (protected route)"""
            try:
                # Verify token
                token = request.headers.get('Authorization')
                if not token or not token.startswith('Bearer '):
                    return jsonify({
                        'success': False,
                        'message': 'Authorization token required'
                    }), 401
                
                token = token.split(' ')[1]
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Get user progress
                success, progress_data = self.user_schema.get_user_progress(user_id)
                
                if success:
                    return jsonify({
                        'success': True,
                        'progress': progress_data
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'message': 'Error fetching progress'
                    }), 500
                    
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Update progress error: {str(e)}'
                }), 500
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Progress error: {str(e)}'
                }), 500
        
        @self.app.route('/api/user/progress', methods=['POST'])
        def update_user_progress():
            """Update user progress (protected route)"""
            try:
                # Verify token
                token = request.headers.get('Authorization')
                if not token or not token.startswith('Bearer '):
                    return jsonify({
                        'success': False,
                        'message': 'Authorization token required'
                    }), 401
                
                token = token.split(' ')[1]
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Get progress data
                data = request.get_json()
                if not data or not data.get('module_id'):
                    return jsonify({
                        'success': False,
                        'message': 'Module ID is required'
                    }), 400
                
                module_id = data.get('module_id')
                progress_data = {
                    'progress': data.get('progress', 0),
                    'time_spent': data.get('time_spent', 0),
                    'status': data.get('status', 'in_progress')
                }
                
                # Update progress
                success, message = self.user_schema.update_module_progress(user_id, module_id, progress_data)
                
                if success:
                    return jsonify({
                        'success': True,
                        'message': message
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'message': message
                    }), 500
                    
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Update progress error: {str(e)}'
                }), 500
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Progress update error: {str(e)}'
                }), 500
        
        @self.app.route('/api/user/saved-modules', methods=['GET'])
        def get_saved_modules():
            """Get user's saved modules (protected route)"""
            try:
                # Verify token
                token = request.headers.get('Authorization')
                if not token or not token.startswith('Bearer '):
                    return jsonify({
                        'success': False,
                        'message': 'Authorization token required'
                    }), 401
                
                token = token.split(' ')[1]
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Get saved modules
                success, modules = self.user_schema.get_saved_modules(user_id)
                
                if success:
                    return jsonify({
                        'success': True,
                        'modules': modules
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'message': 'Error fetching saved modules'
                    }), 500
                    
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Update progress error: {str(e)}'
                }), 500
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Saved modules error: {str(e)}'
                }), 500
        
        @self.app.route('/api/user/saved-modules', methods=['POST'])
        def save_module():
            """Save a module for user (protected route)"""
            try:
                # Verify token
                token = request.headers.get('Authorization')
                if not token or not token.startswith('Bearer '):
                    return jsonify({
                        'success': False,
                        'message': 'Authorization token required'
                    }), 401
                
                token = token.split(' ')[1]
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Get module data
                data = request.get_json()
                if not data or not data.get('module_id'):
                    return jsonify({
                        'success': False,
                        'message': 'Module ID is required'
                    }), 400
                
                module_id = data.get('module_id')
                module_data = {
                    'module_name': data.get('module_name'),
                    'section': data.get('section'),
                    'notes': data.get('notes', '')
                }
                
                # Save module
                success, message = self.user_schema.save_module(user_id, module_id, module_data)
                
                if success:
                    return jsonify({
                        'success': True,
                        'message': message
                    }), 201
                else:
                    return jsonify({
                        'success': False,
                        'message': message
                    }), 400
                    
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Update progress error: {str(e)}'
                }), 500
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Save module error: {str(e)}'
                }), 500
        
        # Chat History API Routes
        @self.app.route('/api/chat/save-message', methods=['POST'])
        def save_chat_message():
            """Save a chat message (protected route)"""
            try:
                # Verify token
                token = request.headers.get('Authorization')
                if not token or not token.startswith('Bearer '):
                    return jsonify({
                        'success': False,
                        'message': 'Authorization token required'
                    }), 401
                
                token = token.split(' ')[1]
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Get message data
                data = request.get_json()
                if not data or not data.get('message_type') or not data.get('content'):
                    return jsonify({
                        'success': False,
                        'message': 'Message type and content are required'
                    }), 400
                
                message_type = data.get('message_type')  # 'user' or 'bot'
                content = data.get('content')
                session_id = data.get('session_id', 'default')
                metadata = data.get('metadata', {})
                
                # Save message
                success, message_id = self.user_schema.save_chat_message(
                    user_id, session_id, message_type, content, metadata
                )
                
                if success:
                    return jsonify({
                        'success': True,
                        'message_id': message_id
                    }), 201
                else:
                    return jsonify({
                        'success': False,
                        'message': message
                    }), 500
                    
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Update progress error: {str(e)}'
                }), 500
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Save message error: {str(e)}'
                }), 500
        
        @self.app.route('/api/chat/history', methods=['GET'])
        def get_chat_history():
            """Get chat history for a user (protected route)"""
            try:
                # Verify token
                token = request.headers.get('Authorization')
                if not token or not token.startswith('Bearer '):
                    return jsonify({
                        'success': False,
                        'message': 'Authorization token required'
                    }), 401
                
                token = token.split(' ')[1]
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Get query parameters
                session_id = request.args.get('session_id')
                limit = int(request.args.get('limit', 50))
                
                # Get chat history
                success, messages = self.user_schema.get_chat_history(user_id, session_id, limit)
                
                if success:
                    return jsonify({
                        'success': True,
                        'messages': messages
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'message': 'Error fetching chat history'
                    }), 500
                    
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Update progress error: {str(e)}'
                }), 500
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Chat history error: {str(e)}'
                }), 500
        
        @self.app.route('/api/chat/sessions', methods=['GET'])
        def get_chat_sessions():
            """Get chat sessions for a user (protected route)"""
            try:
                # Verify token
                token = request.headers.get('Authorization')
                if not token or not token.startswith('Bearer '):
                    return jsonify({
                        'success': False,
                        'message': 'Authorization token required'
                    }), 401
                
                token = token.split(' ')[1]
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Get query parameters
                limit = int(request.args.get('limit', 10))
                
                # Get chat sessions
                success, sessions = self.user_schema.get_chat_sessions(user_id, limit)
                
                if success:
                    return jsonify({
                        'success': True,
                        'sessions': sessions
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'message': 'Error fetching chat sessions'
                    }), 500
                    
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Update progress error: {str(e)}'
                }), 500
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Chat sessions error: {str(e)}'
                }), 500
        
        @self.app.route('/api/chat/session/<session_id>', methods=['DELETE'])
        def delete_chat_session(session_id):
            """Delete a chat session (protected route)"""
            try:
                # Verify token
                token = request.headers.get('Authorization')
                if not token or not token.startswith('Bearer '):
                    return jsonify({
                        'success': False,
                        'message': 'Authorization token required'
                    }), 401
                
                token = token.split(' ')[1]
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Delete session
                success, message = self.user_schema.delete_chat_session(user_id, session_id)
                
                if success:
                    return jsonify({
                        'success': True,
                        'message': message
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'message': message
                    }), 500
                    
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Update progress error: {str(e)}'
                }), 500
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Delete session error: {str(e)}'
                }), 500
        
        @self.app.route('/api/chat/clear', methods=['DELETE'])
        def clear_chat_history():
            """Clear all chat history for a user (protected route)"""
            try:
                # Verify token
                token = request.headers.get('Authorization')
                if not token or not token.startswith('Bearer '):
                    return jsonify({
                        'success': False,
                        'message': 'Authorization token required'
                    }), 401
                
                token = token.split(' ')[1]
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Clear chat history
                success, message = self.user_schema.clear_chat_history(user_id)
                
                if success:
                    return jsonify({
                        'success': True,
                        'message': message
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'message': message
                    }), 500
                    
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Update progress error: {str(e)}'
                }), 500
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Clear history error: {str(e)}'
                }), 500
        
        # User Statistics API Routes
        @self.app.route('/api/user/statistics', methods=['GET'])
        def get_user_statistics():
            """Get comprehensive user statistics (protected route)"""
            try:
                # Verify token
                token = request.headers.get('Authorization')
                if not token or not token.startswith('Bearer '):
                    return jsonify({
                        'success': False,
                        'message': 'Authorization token required'
                    }), 401
                
                token = token.split(' ')[1]
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Get user statistics
                success, statistics = self.user_schema.get_user_statistics(user_id)
                
                if success:
                    return jsonify({
                        'success': True,
                        'statistics': statistics
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'message': 'Error fetching statistics'
                    }), 500
                    
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Update progress error: {str(e)}'
                }), 500
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Statistics error: {str(e)}'
                }), 500
        
        @self.app.route('/api/user/save-module', methods=['POST'])
        def save_user_module():
            """Save a module for user (protected route)"""
            try:
                # Verify token
                token = request.headers.get('Authorization')
                if not token or not token.startswith('Bearer '):
                    return jsonify({
                        'success': False,
                        'message': 'Authorization token required'
                    }), 401
                
                token = token.split(' ')[1]
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Get module data
                data = request.get_json()
                if not data or not data.get('module_id'):
                    return jsonify({
                        'success': False,
                        'message': 'Module ID is required'
                    }), 400
                
                module_data = {
                    'module_id': data.get('module_id'),
                    'module_name': data.get('module_name'),
                    'section': data.get('section'),
                    'description': data.get('description', ''),
                    'difficulty': data.get('difficulty', 'beginner'),
                    'estimated_time': data.get('estimated_time', 30),
                    'topics': data.get('topics', [])
                }
                
                # Save module
                success, result = self.user_schema.save_user_module(user_id, module_data)
                
                if success:
                    return jsonify({
                        'success': True,
                        'message': 'Module saved successfully',
                        'module_id': result
                    }), 201
                else:
                    return jsonify({
                        'success': False,
                        'message': result
                    }), 400
                    
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Update progress error: {str(e)}'
                }), 500
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Save module error: {str(e)}'
                }), 500
        
        @self.app.route('/api/user/saved-modules-list', methods=['GET'])
        def get_user_saved_modules():
            """Get all saved modules for a user (protected route)"""
            try:
                # Verify token
                token = request.headers.get('Authorization')
                if not token or not token.startswith('Bearer '):
                    return jsonify({
                        'success': False,
                        'message': 'Authorization token required'
                    }), 401
                
                token = token.split(' ')[1]
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Get saved modules
                success, modules = self.user_schema.get_user_saved_modules(user_id)
                
                if success:
                    return jsonify({
                        'success': True,
                        'modules': modules
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'message': 'Error fetching saved modules'
                    }), 500
                    
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Update progress error: {str(e)}'
                }), 500
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Saved modules error: {str(e)}'
                }), 500
        
        @self.app.route('/api/user/update-progress', methods=['POST'])
        def update_module_progress():
            """Update user progress for a module (protected route)"""
            try:
                # Verify token
                token = request.headers.get('Authorization')
                if not token or not token.startswith('Bearer '):
                    return jsonify({
                        'success': False,
                        'message': 'Authorization token required'
                    }), 401
                
                token = token.split(' ')[1]
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Get progress data
                data = request.get_json()
                if not data or not data.get('module_id'):
                    return jsonify({
                        'success': False,
                        'message': 'Module ID is required'
                    }), 400
                
                progress_data = {
                    'progress': data.get('progress', 0),
                    'time_spent': data.get('time_spent', 0),
                    'status': data.get('status', 'in_progress')
                }
                
                # Update progress
                success, message = self.user_schema.update_module_progress(
                    user_id, data.get('module_id'), progress_data
                )
                
                if success:
                    return jsonify({
                        'success': True,
                        'message': message
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'message': message
                    }), 400
                    
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Update progress error: {str(e)}'
                }), 500

        @self.app.route('/api/user/unsave-module', methods=['DELETE'])
        def unsave_module():
            """Remove a saved module for user (protected route)"""
            try:
                token = request.headers.get('Authorization')
                if not token:
                    return jsonify({
                        'success': False,
                        'message': 'Authorization token required'
                    }), 401
                
                token = token.split(' ')[1]
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Get module data
                data = request.get_json()
                if not data or not data.get('module_id'):
                    return jsonify({
                        'success': False,
                        'message': 'Module ID is required'
                    }), 400
                
                module_id = data.get('module_id')
                
                # Unsave module
                success, message = self.user_schema.unsave_user_module(user_id, module_id)
                
                if success:
                    return jsonify({
                        'success': True,
                        'message': 'Module removed successfully'
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'message': message
                    }), 400
                
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Unsave module error: {str(e)}'
                }), 500

        @self.app.route('/api/user/complete-module', methods=['POST'])
        def complete_module():
            """Mark a module as completed for user (protected route)"""
            try:
                token = request.headers.get('Authorization')
                if not token or not token.startswith('Bearer '):
                    return jsonify({
                        'success': False,
                        'message': 'Authorization token required'
                    }), 401
                
                token = token.split(' ')[1]
                decoded = jwt.decode(token, self.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded['user_id']
                
                # Get module data
                data = request.get_json()
                if not data or not data.get('module_id'):
                    return jsonify({
                        'success': False,
                        'message': 'Module ID is required'
                    }), 400
                
                module_id = data.get('module_id')
                
                # Complete module
                success, message = self.user_schema.complete_user_module(user_id, module_id)
                
                if success:
                    return jsonify({
                        'success': True,
                        'message': 'Module marked as completed successfully'
                    }), 200
                else:
                    return jsonify({
                        'success': False,
                        'message': message
                    }), 400
                
            except jwt.ExpiredSignatureError:
                return jsonify({
                    'success': False,
                    'message': 'Token has expired'
                }), 401
            except jwt.InvalidTokenError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid token'
                }), 401
            except Exception as e:
                return jsonify({
                    'success': False,
                    'message': f'Complete module error: {str(e)}'
                }), 500
