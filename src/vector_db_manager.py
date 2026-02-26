import numpy as np
import json
import pickle
import os
from typing import List, Dict
import sys

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    print("❌ FAISS not installed. Install with: pip install faiss-cpu")

try:
    from sentence_transformers import SentenceTransformer
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("❌ SentenceTransformers not installed. Install with: pip install sentence-transformers")

class VectorDBManager:
    def __init__(self, persist_directory: str = "./faiss_db"):
        self.persist_directory = persist_directory
        os.makedirs(persist_directory, exist_ok=True)
        
        if not FAISS_AVAILABLE or not TRANSFORMERS_AVAILABLE:
            raise ImportError("Required packages not installed. Run: pip install faiss-cpu sentence-transformers")
        
        # Initialize sentence transformer model
        print("🔧 Loading sentence transformer model...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✅ Model loaded successfully")
        
        # Initialize FAISS index and storage
        self.index = None
        self.documents = []
        self.metadatas = []
        
        # Try to load existing index
        if self._load_index():
            print("✅ Loaded existing FAISS database")
            print(f"📊 Current documents: {len(self.documents)}")
        else:
            print("📝 Creating new FAISS database")
    
    def _load_index(self) -> bool:
        """Load existing FAISS index from disk"""
        try:
            index_path = os.path.join(self.persist_directory, "faiss.index")
            data_path = os.path.join(self.persist_directory, "data.pkl")
            
            if os.path.exists(index_path) and os.path.exists(data_path):
                # Load FAISS index
                self.index = faiss.read_index(index_path)
                
                # Load documents and metadata
                with open(data_path, 'rb') as f:
                    saved_data = pickle.load(f)
                    self.documents = saved_data['documents']
                    self.metadatas = saved_data['metadatas']
                
                print(f"📁 Loaded {len(self.documents)} documents from existing database")
                return True
        except Exception as e:
            print(f"⚠️ Could not load existing index: {e}")
        
        return False
    
    def _save_index(self):
        """Save FAISS index and data to disk"""
        if self.index is not None and self.documents:
            try:
                index_path = os.path.join(self.persist_directory, "faiss.index")
                data_path = os.path.join(self.persist_directory, "data.pkl")
                
                # Save FAISS index
                faiss.write_index(self.index, index_path)
                
                # Save documents and metadata
                with open(data_path, 'wb') as f:
                    pickle.dump({
                        'documents': self.documents,
                        'metadatas': self.metadatas
                    }, f)
                
                print(f"💾 Saved {len(self.documents)} documents to disk")
            except Exception as e:
                print(f"❌ Error saving index: {e}")
    
    def add_documents(self, chunks_file: str) -> int:
        """Add processed chunks to vector database"""
        print(f"📖 Loading chunks from: {chunks_file}")
        
        if not os.path.exists(chunks_file):
            print(f"❌ Chunks file not found: {chunks_file}")
            return 0
            
        # Load chunks
        try:
            with open(chunks_file, 'r', encoding='utf-8') as f:
                chunks = json.load(f)
        except Exception as e:
            print(f"❌ Error loading chunks file: {e}")
            return 0
        
        if not chunks:
            print("❌ No chunks found in file")
            return 0
            
        print(f"📚 Found {len(chunks)} chunks to process")
        
        # Extract documents and metadata
        new_documents = [chunk['content'] for chunk in chunks]
        new_metadatas = [chunk['metadata'] for chunk in chunks]
        
        print("🔨 Creating embeddings... (this may take a moment)")
        
        # Create embeddings for new documents
        new_embeddings = self.model.encode(new_documents)
        print(f"✅ Created {len(new_embeddings)} embeddings")
        
        # Initialize or update FAISS index
        if self.index is None:
            # Create new index
            dimension = new_embeddings.shape[1]
            self.index = faiss.IndexFlatIP(dimension)  # Inner product (cosine similarity)
            print(f"📐 Created new FAISS index with dimension {dimension}")
        else:
            print("📈 Updating existing FAISS index")
        
        # Normalize embeddings for cosine similarity
        faiss.normalize_L2(new_embeddings)
        
        # Add to index
        self.index.add(new_embeddings.astype('float32'))
        
        # Update documents and metadata
        self.documents.extend(new_documents)
        self.metadatas.extend(new_metadatas)
        
        # Save to disk
        self._save_index()
        
        print(f"🎉 Successfully added {len(new_documents)} documents to FAISS database")
        print(f"📊 Total documents in database: {len(self.documents)}")
        return len(new_documents)
    
    def search(self, query: str, n_results: int = 3, filters: Dict = None) -> List[Dict]:
        """Search for relevant financial content"""
        try:
            if self.index is None or len(self.documents) == 0:
                print("❌ FAISS database is empty - no documents found!")
                return []
                
            
            # Encode query
            query_embedding = self.model.encode([query])
            
            # Normalize query embedding for cosine similarity
            faiss.normalize_L2(query_embedding)
            
            # Search
            distances, indices = self.index.search(query_embedding.astype('float32'), n_results)
            
            formatted_results = []
            for i, idx in enumerate(indices[0]):
                if idx < len(self.documents) and idx >= 0:
                    formatted_results.append({
                        'content': self.documents[idx],
                        'metadata': self.metadatas[idx],
                        'distance': float(distances[0][i])  # Cosine similarity score
                    })
            
            if formatted_results:
                # Show top result preview
                preview = formatted_results[0]['content'][:150] + "..." if len(formatted_results[0]['content']) > 150 else formatted_results[0]['content']
            else:
                print("❌ No relevant results found")
            
            return formatted_results
            
        except Exception as e:
            print(f"❌ Search error: {e}")
            return []
    
    def get_collection_stats(self):
        """Get statistics about the collection"""
        return len(self.documents)
    
    def clear_database(self):
        """Clear the entire database"""
        self.index = None
        self.documents = []
        self.metadatas = []
        
        # Remove saved files
        index_path = os.path.join(self.persist_directory, "faiss.index")
        data_path = os.path.join(self.persist_directory, "data.pkl")
        
        for path in [index_path, data_path]:
            if os.path.exists(path):
                os.remove(path)
        
        print("🗑️  Cleared FAISS database")

# Test the FAISS vector database
if __name__ == "__main__":
    print("🧪 Testing FAISS Vector Database...")
    
    try:
        # Initialize DB
        db = VectorDBManager()
        
        # Check if we have chunks to add
        chunks_file = "financial corpus/processed/markdown_chunks.json"
        if os.path.exists(chunks_file):
            print("📦 Adding documents to FAISS database...")
            added = db.add_documents(chunks_file)
            
            if added > 0:
                print("✅ Documents added successfully!")
                
                # Test search
                print("\n🔍 Testing search functionality...")
                results = db.search("money", n_results=2)
                print(f"Test search returned {len(results)} results")
                
                if results:
                    print("\n📋 Search results preview:")
                    for i, result in enumerate(results):
                        print(f"{i+1}. {result['content'][:100]}...")
            else:
                print("❌ Failed to add documents")
        else:
            print(f"❌ Chunks file not found: {chunks_file}")
            print("💡 First run: python src/markdown_processor.py")
            
    except Exception as e:
        print(f"❌ FAISS test failed: {e}")
        print("💡 Make sure to install: pip install faiss-cpu sentence-transformers")