import streamlit as st
import sys
import os
from dotenv import load_dotenv
from pyngrok import ngrok
import threading
import time
import subprocess
import gc

# Your existing chatbot code here...

load_dotenv()

# Add your existing modules to path
sys.path.append(os.path.dirname(__file__))
sys.path.append('src')

def cleanup_ngrok():
    """Completely clean up ngrok processes"""
    try:
        # Kill ngrok processes
        ngrok.kill()
        time.sleep(2)
        
        # Additional cleanup using system commands
        subprocess.run(['pkill', '-f', 'ngrok'], capture_output=True)
        time.sleep(2)
        print("✅ Ngrok cleanup completed")
    except Exception as e:
        print(f"ℹ️ Cleanup note: {e}")

def setup_ngrok_tunnel(port=8501, max_retries=3):
    """Set up ngrok tunnel with retry logic and dynamic subdomains"""
    for attempt in range(max_retries):
        try:
            print(f"🔄 Attempt {attempt + 1} to setup ngrok tunnel...")
            
            # Set ngrok authtoken
            ngrok.set_auth_token("33veiDep8BPU9ZEzwdsHGJ3sZgs_z6JN1DaEPBYFL2w4v6ux")
            
            # Clean up on first attempt
            if attempt == 0:
                cleanup_ngrok()
            
            # Check for existing tunnels first
            try:
                tunnels = ngrok.get_tunnels()
                for tunnel in tunnels:
                    if f":{port}" in tunnel.config["addr"]:
                        public_url = str(tunnel.public_url)
                        print(f"✅ Using existing tunnel: {public_url}")
                        return public_url
            except:
                pass
            
            # Create new tunnel with dynamic subdomain
            tunnel = ngrok.connect(addr=port, bind_tls=True, proto="http")
            public_url = str(tunnel.public_url)
            print(f"✅ New ngrok tunnel created: {public_url}")
            time.sleep(3)  # Wait for tunnel to stabilize
            return public_url
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Attempt {attempt + 1} failed: {error_msg}")
            
            # If it's a subdomain conflict, force cleanup and retry
            if "already online" in error_msg or "ERR_NGROK_334" in error_msg:
                print("🔄 Subdomain conflict detected, forcing cleanup...")
                cleanup_ngrok()
                time.sleep(3)
            
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 2  # Exponential backoff
                print(f"⏳ Waiting {wait_time} seconds before retry...")
                time.sleep(wait_time)
                continue
            else:
                print("💥 All retry attempts failed")
                return None

def initialize_chatbot_optimized():
    """Initialize chatbot with memory optimization"""
    try:
        # Clear memory before starting
        gc.collect()
        
        # Show progressive loading
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        status_text.text("🔄 Loading vector database...")
        progress_bar.progress(25)
        
        from vector_db_manager import VectorDBManager
        vector_db = VectorDBManager()
        
        # Check if database has documents
        doc_count = vector_db.get_collection_stats()
        if doc_count == 0:
            status_text.text("📚 Adding documents to database...")
            progress_bar.progress(50)
            
            chunks_file = "financial corpus/processed/markdown_chunks.json"
            if os.path.exists(chunks_file):
                # Add documents with progress indication
                vector_db.add_documents(chunks_file)
            else:
                st.error(f"❌ Chunks file not found: {chunks_file}")
                return None
        
        status_text.text("🤖 Initializing AI model...")
        progress_bar.progress(75)
        
        from enhanced_rag_engine import FinancialRAGEngine
        rag_engine = FinancialRAGEngine(
            vector_db=vector_db,
            api_key=os.getenv('GROQ_API_KEY')
        )
        
        progress_bar.progress(100)
        status_text.text("✅ Chatbot ready!")
        time.sleep(1)
        status_text.empty()
        progress_bar.empty()
        
        return rag_engine
        
    except Exception as e:
        st.error(f"❌ Failed to initialize chatbot: {e}")
        return None

@st.cache_resource(show_spinner=False)
def load_chatbot():
    return initialize_chatbot_optimized()

def create_lightweight_chatbot():
    """Create a lightweight version for memory-constrained systems"""
    try:
        st.warning("🚨 Using lightweight mode due to memory constraints")
        
        from vector_db_manager import VectorDBManager
        from enhanced_rag_engine import FinancialRAGEngine
        
        # Initialize with minimal setup
        vector_db = VectorDBManager()
        
        # Skip document loading if memory is low
        doc_count = vector_db.get_collection_stats()
        if doc_count == 0:
            st.info("💡 Running with minimal knowledge base")
            # Continue without documents for now
        
        # Use a smaller model if available
        rag_engine = FinancialRAGEngine(
            vector_db=vector_db,
            api_key=os.getenv('GROQ_API_KEY'),
            model_name="mixtral-8x7b-32768"  # Keep the same but be aware of memory
        )
        
        return rag_engine
        
    except Exception as e:
        st.error(f"Lightweight mode also failed: {e}")
        return None

def main():
    st.set_page_config(
        page_title="Financial RAG Chatbot",
        page_icon="🧠",
        layout="wide"
    )
    
    # Initialize ngrok first
    if "ngrok_url" not in st.session_state:
        with st.spinner("🌐 Setting up secure public URL..."):
            public_url = setup_ngrok_tunnel(8501)
            if public_url:
                st.session_state.ngrok_url = public_url
            else:
                st.session_state.ngrok_url = "http://localhost:8501"
                st.error("⚠️ Could not create public URL. Running in local mode only.")
    
    st.title("🧠 FinSage - Financial RAG Chatbot")
    st.markdown("Ask me anything about financial documents, investing, banking, and personal finance!")
    
    # Sidebar
    with st.sidebar:
        st.header("🌐 Sharing Information")
        
        if "ngrok_url" in st.session_state:
            ngrok_url = str(st.session_state.ngrok_url)
            
            if "ngrok-free.dev" in ngrok_url or "ngrok.io" in ngrok_url:
                st.subheader("🎯 Public Share URL:")
                st.code(ngrok_url)
                st.markdown(f"[Open in new tab]({ngrok_url})")
            else:
                st.subheader("🔒 Local Access Only:")
                st.code(ngrok_url)
        
        st.markdown("---")
        st.subheader("Ask anything about Finance")
        st.markdown("""
        - Financial Concepts
        - Investments
        - Stocks
        - Banking
        - Personal Finance
        """)
        
        if st.button("🔄 Restart Chatbot"):
            if "chatbot" in st.session_state:
                del st.session_state.chatbot
            gc.collect()
            st.rerun()
    
    # Initialize chat history
    if "messages" not in st.session_state:
        st.session_state.messages = [
            {"role": "assistant", "content": "Hello! I'm your financial assistant. Ask me anything about money, banking, investing, or personal finance!"}
        ]
    
    # Initialize chatbot with memory optimization
    if "chatbot" not in st.session_state:
        with st.container():
            st.info("🚀 Initializing chatbot components...")
            
            # Try normal initialization first
            chatbot = load_chatbot()
            
            if not chatbot:
                st.warning("🔄 Trying lightweight initialization...")
                chatbot = create_lightweight_chatbot()
            
            if chatbot:
                st.session_state.chatbot = chatbot
                st.success("✅ Chatbot ready! You can start asking questions.")
            else:
                st.error("""
                ❌ Failed to initialize chatbot due to memory constraints.
                
                **Immediate Solutions:**
                1. **Close other applications** (especially browsers)
                2. **Click 'Restart Chatbot' button** in sidebar
                3. **Restart your computer** and try again
                4. **Check virtual memory** settings
                """)
                return
    
    # Display chat messages
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
    
    # Chat input
    if prompt := st.chat_input("What financial topic would you like to know about?"):
        st.chat_message("user").markdown(prompt)
        st.session_state.messages.append({"role": "user", "content": prompt})
        
        with st.spinner("🔍 Analyzing financial information..."):
            try:
                response_data = st.session_state.chatbot.generate_response(prompt)
                
                # Handle different response formats safely - WITHOUT SOURCES
                if isinstance(response_data, dict):
                    response = response_data.get('answer', 'No answer provided.')
                    # Removed sources handling completely
                elif isinstance(response_data, str):
                    response = response_data
                else:
                    response = str(response_data)
                    
            except Exception as e:
                error_msg = str(e)
                response = f"Sorry, I encountered an error: {error_msg}"
                
                # Provide helpful tips for common errors
                if "sequence item 0: expected str instance, dict found" in error_msg:
                    response += "\n\n🔧 **Technical Note**: There's an issue with source formatting."
                elif "memory" in error_msg.lower():
                    response += "\n\n💡 **Tip**: Try restarting the application or using a simpler question."
        
        with st.chat_message("assistant"):
            st.markdown(response)
        st.session_state.messages.append({"role": "assistant", "content": response})

# Add cleanup on exit
import atexit
@atexit.register
def cleanup_on_exit():
    print("🔄 Cleaning up ngrok tunnels on exit...")
    cleanup_ngrok()

if __name__ == "__main__":
    main()