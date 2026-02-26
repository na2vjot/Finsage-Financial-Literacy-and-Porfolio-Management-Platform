import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Add src to path
sys.path.append('src')

from vector_db_manager import VectorDBManager
from enhanced_rag_engine import FinancialRAGEngine

def start_chat():
    print("🚀 Starting FAISS-based Financial Chatbot...")
    
    try:
        # Initialize FAISS vector database
        print("📡 Connecting to FAISS database...")
        vector_db = VectorDBManager()
        
        # Check document count
        doc_count = vector_db.get_collection_stats()
        print(f"📊 Documents in database: {doc_count}")
        
        if doc_count == 0:
            print("❌ Database is empty! Adding documents...")
            
            chunks_file = "financial corpus/processed/markdown_chunks.json"
            if os.path.exists(chunks_file):
                added = vector_db.add_documents(chunks_file)
                if added == 0:
                    print("❌ Failed to add documents")
                    return
            else:
                print(f"❌ Chunks file not found: {chunks_file}")
                return
        
        # Initialize RAG engine
        print("🤖 Initializing AI engine...")
        rag_engine = FinancialRAGEngine(
            vector_db=vector_db,
            api_key=os.getenv('GROQ_API_KEY')
        )
        
        print("\n" + "="*50)
        print("💼 FinSage - Financial Literacy Chatbot")
        print("="*50)
        print("Powered by FAISS + Groq AI")
        print("Ask me anything about money, banking, investing, or personal finance!")
        print("Type 'quit' to exit\n")
        
        while True:
            try:
                user_input = input("You: ").strip()
                
                if user_input.lower() in ['quit', 'exit', 'bye']:
                    print("Goodbye! 👋")
                    break
                    
                if not user_input:
                    continue
                    
                print("Thinking...")
                response = rag_engine.generate_response(user_input)
                print(f"\nAssistant: {response['answer']}\n")
                print("-" * 50)
                
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                
    except Exception as e:
        print(f"❌ Failed to start chatbot: {e}")
        print("💡 Make sure FAISS is installed: pip install faiss-cpu sentence-transformers")

if __name__ == "__main__":
    start_chat()