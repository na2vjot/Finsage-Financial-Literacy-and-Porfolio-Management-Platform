import os
import json
import re
from typing import List, Dict, Any

try:
    import frontmatter
except ImportError:
    print("Please install python-frontmatter: pip install python-frontmatter")
    exit(1)

class MarkdownProcessor:
    def __init__(self):
        self.chunk_size = 500
        self.chunk_overlap = 50
        
    def parse_markdown_file(self, file_path: str) -> Dict[str, Any]:
        """Parse markdown file with frontmatter metadata"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Parse frontmatter manually if the library doesn't work
            if content.startswith('---'):
                parts = content.split('---', 2)
                if len(parts) >= 3:
                    # Try to parse frontmatter as YAML
                    import yaml
                    try:
                        metadata = yaml.safe_load(parts[1])
                        content = parts[2].strip()
                    except:
                        # If YAML parsing fails, use simple parsing
                        metadata = {}
                        lines = parts[1].strip().split('\n')
                        for line in lines:
                            if ':' in line:
                                key, value = line.split(':', 1)
                                metadata[key.strip()] = value.strip()
                        content = parts[2].strip()
                else:
                    metadata = {}
            else:
                metadata = {}
            
            return {
                'content': content,
                'metadata': metadata,
                'file_path': file_path,
                'title': metadata.get('title', os.path.basename(file_path).replace('.md', '').replace('_', ' ').title())
            }
        except Exception as e:
            print(f"Error parsing {file_path}: {e}")
            # Return basic structure if parsing fails
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            return {
                'content': content,
                'metadata': {},
                'file_path': file_path,
                'title': os.path.basename(file_path).replace('.md', '').replace('_', ' ').title()
            }
    
    def extract_sections(self, content: str) -> List[Dict[str, str]]:
        """Extract sections from markdown content"""
        sections = []
        
        # Split by headers (##, ###, etc.)
        header_pattern = r'(^#+ .+$)(.*?)(?=^#+ |\Z)'
        matches = re.finditer(header_pattern, content, re.MULTILINE | re.DOTALL)
        
        for match in matches:
            header = match.group(1).strip()
            section_content = match.group(2).strip()
            
            if section_content:
                sections.append({
                    'header': header,
                    'content': section_content
                })
        
        return sections
    
    def chunk_content(self, parsed_doc: Dict) -> List[Dict]:
        """Split markdown content into chunks for vector DB"""
        chunks = []
        doc_id = os.path.basename(parsed_doc['file_path']).replace('.md', '')
        
        # Method 1: Chunk by sections
        sections = self.extract_sections(parsed_doc['content'])
        
        for i, section in enumerate(sections):
            chunk_content = f"{section['header']}\n{section['content']}"
            
            chunks.append({
                "content": self.clean_text(chunk_content),
                "metadata": {
                    **parsed_doc['metadata'],
                    "chunk_id": f"{doc_id}_section_{i}",
                    "source_file": parsed_doc['file_path'],
                    "section_header": section['header']
                }
            })
        
        # Method 2: If no clear sections, split by paragraphs
        if not chunks:
            paragraphs = [p for p in parsed_doc['content'].split('\n\n') if p.strip()]
            for i, para in enumerate(paragraphs):
                if para.strip():
                    chunks.append({
                        "content": self.clean_text(para),
                        "metadata": {
                            **parsed_doc['metadata'],
                            "chunk_id": f"{doc_id}_para_{i}",
                            "source_file": parsed_doc['file_path']
                        }
                    })
        
        return chunks
    
    def clean_text(self, text: str) -> str:
        """Clean markdown text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.,!?;:()-]', '', text)
        return text.strip()
    
    def process_markdown_directory(self, directory_path: str, output_file: str):
        """Process all markdown files in a directory"""
        # Create output directory if it doesn't exist
        output_dir = os.path.dirname(output_file)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
        
        all_chunks = []
        
        for root, dirs, files in os.walk(directory_path):
            for file in files:
                if file.endswith('.md'):
                    file_path = os.path.join(root, file)
                    print(f"Processing: {file_path}")
                    
                    try:
                        parsed_doc = self.parse_markdown_file(file_path)
                        chunks = self.chunk_content(parsed_doc)
                        all_chunks.extend(chunks)
                        print(f"  ✅ Created {len(chunks)} chunks")
                    except Exception as e:
                        print(f"  ❌ Error processing {file_path}: {e}")
        
        # Save processed chunks
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_chunks, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Processed {len(all_chunks)} total chunks from markdown files")
        return all_chunks

# Usage example
if __name__ == "__main__":
    processor = MarkdownProcessor()
    chunks = processor.process_markdown_directory(
        "financial corpus/",
        "financial corpus/processed/markdown_chunks.json"
    )