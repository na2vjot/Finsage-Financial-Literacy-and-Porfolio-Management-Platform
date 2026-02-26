import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Add src to path
sys.path.append('src')

try:
    from vector_db_manager import VectorDBManager
    from enhanced_rag_engine import FinancialRAGEngine  # Changed import
    print("✅ All modules imported successfully!")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("💡 Make sure all required packages are installed:")
    print("   pip install openai python-dotenv yfinance pandas")
    sys.exit(1)

def start_enhanced_chat():
    print("🚀 Starting Enhanced FAISS-based Financial Chatbot with Live Data...")
    
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
        
        # Initialize RAG engine - USING THE COMBINED CLASS
        print("🤖 Initializing Enhanced AI engine with Live Financial Data...")
        rag_engine = FinancialRAGEngine(  # Changed class name
            vector_db=vector_db,
            api_key=os.getenv('GROQ_API_KEY')
        )
        
        print("\n" + "="*60)
        print("💼 FinSage Pro - Financial Literacy Chatbot with Live Data")
        print("="*60)
        print("📈 Now with Live: Stocks | Commodities | Currency | Market Data")
        print("💡 Ask me about:")
        print("   • 'Reliance share price today'")
        print("   • 'Current gold price'") 
        print("   • 'USD to INR rate'")
        print("   • 'How is stock market today?'")
        print("   • General financial questions")
        print("Type 'quit' to exit\n")
        
        while True:
            try:
                user_input = input("You: ").strip()
                
                if user_input.lower() in ['quit', 'exit', 'bye']:
                    print("Goodbye! 👋")
                    break
                    
                if not user_input:
                    continue
                    
                print("🔍 Analyzing...")
                response = rag_engine.generate_response(user_input)
                
                # Add emoji based on response type
                if response.get('data_type') == 'live_financial_data':
                    print("📊 Live Data Result:")
                elif response.get('data_type') == 'rag_knowledge':
                    print("🤖 AI Response:")
                else:
                    print("💬 Response:")
                    
                print(f"\nAssistant: {response['answer']}\n")
                print("-" * 60)
                
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                
    except Exception as e:
        print(f"❌ Failed to start enhanced chatbot: {e}")
        print("💡 Make sure all dependencies are installed:")
        print("   pip install openai python-dotenv yfinance pandas")

if __name__ == "__main__":
    start_enhanced_chat()