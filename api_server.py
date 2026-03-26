import streamlit as st
import sys
import os
import json
from dotenv import load_dotenv
import threading
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import gc

# Import your existing chatbot components
load_dotenv()
sys.path.append(os.path.dirname(__file__))
sys.path.append('src')

from vector_db_manager import VectorDBManager
from enhanced_rag_engine import FinancialRAGEngine
from syllabus_data import SYLLABUS, get_content_by_file
from auth_routes import AuthRoutes

# Initialize Flask app for API
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])

# Initialize authentication routes
auth_routes = AuthRoutes(app)

# Global chatbot instance
chatbot_instance = None

def initialize_chatbot():
    """Initialize chatbot for API use"""
    global chatbot_instance
    try:
        gc.collect()
        
        vector_db = VectorDBManager()
        doc_count = vector_db.get_collection_stats()
        
        if doc_count == 0:
            chunks_file = "financial corpus/processed/markdown_chunks.json"
            if os.path.exists(chunks_file):
                vector_db.add_documents(chunks_file)
        
        rag_engine = FinancialRAGEngine(
            vector_db=vector_db,
            api_key=os.getenv('GROQ_API_KEY')
        )
        
        chatbot_instance = rag_engine
        return True
    except Exception as e:
        print(f"Failed to initialize chatbot: {e}")
        return False

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat endpoint for React frontend"""
    try:
        data = request.json
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        if not chatbot_instance:
            if not initialize_chatbot():
                return jsonify({'error': 'Chatbot not available'}), 500
        
        response = chatbot_instance.generate_response(user_message)
        
        if isinstance(response, dict):
            answer = response.get('answer', 'No answer provided')
        else:
            answer = str(response)
        
        return jsonify({
            'answer': answer,
            'timestamp': time.time()
        })
        
    except Exception as e:
        # Print full error to console for debugging
        import traceback
        print("="*50)
        print("ERROR IN CHAT ENDPOINT:")
        print("="*50)
        traceback.print_exc()
        print("="*50)
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'chatbot_ready': chatbot_instance is not None
    })

@app.route('/api/syllabus', methods=['GET'])
def get_syllabus():
    """Get complete syllabus structure"""
    return jsonify(SYLLABUS)

@app.route('/api/content/<path:file_path>', methods=['GET'])
def get_content(file_path):
    """Get content for a specific file"""
    try:
        content = get_content_by_file(file_path)
        return jsonify({
            "content": content,
            "file_path": file_path
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/modules', methods=['GET'])
def get_all_modules():
    """Get flat list of all modules"""
    modules = get_all_modules()
    return jsonify(modules)

def run_api_server():
    """Run Flask API server in separate thread"""
    try:
        app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
    except Exception as e:
        print(f"Flask server error: {e}")

if __name__ == "__main__":
    # Initialize chatbot
    if initialize_chatbot():
        print("✅ Chatbot initialized successfully")
    else:
        print("❌ Failed to initialize chatbot")
    
    # Start API server in background
    print("🚀 Starting API server on port 5000...")
    api_thread = threading.Thread(target=run_api_server, daemon=True)
    api_thread.start()
    
    # Wait a moment for Flask to start
    time.sleep(2)
    
    # Test API endpoint
    try:
        import requests
        response = requests.get('http://localhost:5000/api/health', timeout=5)
        if response.status_code == 200:
            print("✅ API server is running on http://localhost:5000")
        else:
            print("⚠️ API server started but health check failed")
    except:
        print("⚠️ Could not verify API server status")
    
    print("\n🌐 You can now:")
    print("   - Access React frontend: http://localhost:3000")
    print("   - Access API directly: http://localhost:5000/api")
    print("   - API Health: http://localhost:5000/api/health")
    
    # Keep the main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Shutting down servers...")
