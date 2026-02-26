import os
import shutil
import sys
from dotenv import load_dotenv

load_dotenv()

def setup_faiss_chatbot():
    print("🚀 Setting up FAISS-based Financial Chatbot...")
    print("=" * 60)
    
    # Check and install required packages
    print("📦 Checking required packages...")
    try:
        import faiss
        from sentence_transformers import SentenceTransformer
        print("✅ FAISS and SentenceTransformers are installed")
    except ImportError as e:
        print(f"❌ Missing packages: {e}")
        print("💡 Install with: pip install faiss-cpu sentence-transformers")
        return False
    
    # Add src to path
    sys.path.append('src')
    
    from vector_db_manager import VectorDBManager
    
    # Clear existing FAISS database
    if os.path.exists("faiss_db"):
        shutil.rmtree("faiss_db")
        print("✅ Cleared existing FAISS database")
    
    # Initialize FAISS vector database
    print("\n🗃️ Initializing FAISS vector database...")
    try:
        vector_db = VectorDBManager()
    except Exception as e:
        print(f"❌ Failed to initialize FAISS: {e}")
        return False
    
    # Add documents to vector database
    chunks_file = "financial corpus/processed/markdown_chunks.json"
    if os.path.exists(chunks_file):
        print(f"📦 Adding documents from: {chunks_file}")
        added_count = vector_db.add_documents(chunks_file)
        
        if added_count > 0:
            print(f"✅ Successfully added {added_count} documents")
            
            # Test the database
            print("\n🔍 Testing database...")
            results = vector_db.search("money", n_results=2)
            
            if results:
                print("✅ FAISS database is working correctly!")
                print(f"📊 Total documents: {vector_db.get_collection_stats()}")
                
                print("\n🎉 FAISS SETUP COMPLETED SUCCESSFULLY!")
                print("=" * 60)
                print("🚀 Your chatbot is ready to use!")
                print("💬 Run: python chat.py")
                return True
            else:
                print("❌ Database test failed - no search results")
                return False
        else:
            print("❌ Failed to add documents to FAISS database")
            return False
    else:
        print(f"❌ Chunks file not found: {chunks_file}")
        print("💡 First run: python src/markdown_processor.py")
        return False

if __name__ == "__main__":
    setup_faiss_chatbot()