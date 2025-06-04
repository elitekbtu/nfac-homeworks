import os
import json
import time
import warnings
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, Field, ValidationError, validator

# Suppress specific warnings
warnings.filterwarnings("ignore", message=".*Assistants API is deprecated.*")

# Load environment variables
load_dotenv()

class Note(BaseModel):
    """Represents a single study note with validation."""
    id: int = Field(..., ge=1, le=10, description="Unique note ID from 1-10")
    heading: str = Field(..., min_length=3, max_length=50, example="Multi-Head Attention", 
                        description="Concise heading for the note")
    summary: str = Field(..., max_length=150, description="Brief summary of the concept")
    page_ref: Optional[int] = Field(None, ge=1, description="Page number in source PDF")

    @validator('summary')
    def validate_summary_length(cls, v):
        if len(v) > 150:
            raise ValueError("Summary must be 150 characters or less")
        return v

class NotesCollection(BaseModel):
    """Collection of exactly 10 study notes with validation."""
    notes: List[Note] = Field(..., min_items=10, max_items=10, 
                             description="Exactly 10 study notes")

class NoteGenerator:
    """Handles generation and processing of study notes."""
    
    def __init__(self, client: OpenAI):
        self.client = client
        self.assistant_file = "assistant_info.json"
    
    def _get_assistant_id(self) -> Optional[str]:
        """Retrieve assistant ID from file if exists."""
        if os.path.exists(self.assistant_file):
            with open(self.assistant_file, 'r') as f:
                return json.load(f).get('id')
        return None
    
    def _wait_for_run_completion(self, thread_id: str, run_id: str) -> Optional[Any]:
        """Wait for assistant run to complete."""
        while True:
            run = self.client.beta.threads.runs.retrieve(
                thread_id=thread_id,
                run_id=run_id
            )
            
            if run.status == "completed":
                return run
            elif run.status in ["failed", "cancelling", "cancelled", "expired"]:
                print(f"Run ended with status: {run.status}")
                if run.status == "failed" and hasattr(run, 'last_error'):
                    print(f"Error details: {run.last_error}")
                return None
            
            print(f"Status: {run.status}... waiting")
            time.sleep(2)
    
    def generate_with_assistant(self, topic: str = "Attention Is All You Need PDF") -> Optional[str]:
        """Generate notes using the Assistants API."""
        assistant_id = self._get_assistant_id()
        if not assistant_id:
            return None
            
        prompt = f"""
        Analyze the {topic} and create exactly 10 concise revision notes.
        Each note should cover a key concept from the Transformer paper.
        
        Required JSON structure:
        {{
            "notes": [
                {{
                    "id": 1,
                    "heading": "Concept Name",
                    "summary": "Brief explanation (≤150 chars)",
                    "page_ref": null
                }}
            ]
        }}
        
        Important:
        - Unique IDs 1-10
        - Concise headings
        - Short summaries
        - Cover key concepts like self-attention, multi-head attention, etc.
        """
        
        try:
            thread = self.client.beta.threads.create()
            self.client.beta.threads.messages.create(
                thread_id=thread.id,
                role="user",
                content=prompt
            )
            
            run = self.client.beta.threads.runs.create(
                thread_id=thread.id,
                assistant_id=assistant_id
            )
            
            if not self._wait_for_run_completion(thread.id, run.id):
                return None
                
            messages = self.client.beta.threads.messages.list(thread_id=thread.id)
            for message in messages:
                if message.role == "assistant" and message.content:
                    return message.content[0].text.value
                    
        except Exception as e:
            print(f"Assistant error: {e}")
            
        return None
    
    def generate_with_chat_completion(self) -> Optional[str]:
        """Generate notes using Chat Completion API with JSON mode."""
        system_prompt = """
        You are a study summarizer for "Attention Is All You Need".
        Return exactly 10 notes as valid JSON matching this schema:
        {
            "notes": [
                {
                    "id": number (1-10),
                    "heading": "string",
                    "summary": "string (≤150 chars)",
                    "page_ref": number|null
                }
            ]
        }
        """
        
        user_prompt = """
        Create 10 revision notes covering these Transformer concepts:
        1. Scaled Dot-Product Attention
        2. Multi-Head Attention
        3. Positional Encoding
        4. Encoder-Decoder architecture
        5. Feed-Forward Networks
        6. Residual Connections
        7. Training details
        8. Regularization techniques
        9. Self-attention comparisons
        10. WMT 2014 results
        
        Make each note concise and exam-focused.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"}
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Chat completion error: {e}")
            return None
    
    @staticmethod
    def extract_json(content: str) -> Optional[str]:
        """Extract JSON from potentially formatted text response."""
        content = content.strip()
        
        # Check for code blocks
        if "```json" in content:
            start = content.find("```json") + 7
            end = content.rfind("```")
            if end > start:
                return content[start:end].strip()
                
        elif "```" in content:
            lines = [line for line in content.split('\n') 
                    if not line.strip().startswith('```')]
            return '\n'.join(lines).strip()
            
        # Find first { and last }
        start_brace = content.find('{')
        end_brace = content.rfind('}')
        
        if start_brace != -1 and end_brace != -1:
            return content[start_brace:end_brace+1]
            
        return None
    
    def validate_notes(self, json_content: str) -> Optional[List[Note]]:
        """Validate and parse notes JSON against Pydantic model."""
        if not json_content:
            return None
            
        try:
            # First try to parse directly
            try:
                data = json.loads(json_content)
                notes = NotesCollection(**data)
                return notes.notes
            except (json.JSONDecodeError, ValidationError):
                pass
                
            # If fails, try to extract JSON
            extracted = self.extract_json(json_content)
            if extracted:
                data = json.loads(extracted)
                notes = NotesCollection(**data)
                return notes.notes
                
        except json.JSONDecodeError as e:
            print(f"JSON error: {e}")
        except ValidationError as e:
            print(f"Validation error: {e}")
            
        return None
    
    @staticmethod
    def save_notes(notes: List[Note], filename: str = "exam_notes.json") -> bool:
        """Save validated notes to JSON file."""
        try:
            with open(filename, 'w') as f:
                json.dump({"notes": [note.model_dump() for note in notes]}, f, indent=2)
            return True
        except Exception as e:
            print(f"Save error: {e}")
            return False
    
    @staticmethod
    def print_notes(notes: List[Note]):
        """Display notes in a readable format."""
        print("\n" + "="*60)
        print("📚 GENERATED STUDY NOTES".center(60))
        print("="*60)
        for note in notes:
            print(f"\n📝 Note {note.id}: {note.heading}")
            print(f"   Summary: {note.summary}")
            if note.page_ref:
                print(f"   Page: {note.page_ref}")
            print("-"*50)

def main():
    try:
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        generator = NoteGenerator(client)
        
        print("🔄 Generating 10 structured exam notes...")
        
        # Try assistant first, then chat completion
        json_content = generator.generate_with_assistant() or generator.generate_with_chat_completion()
        
        if not json_content:
            print("❌ Failed to generate notes")
            return
            
        print("✅ Received response, validating...")
        notes = generator.validate_notes(json_content)
        
        if not notes:
            print("❌ Invalid notes format")
            return
            
        generator.print_notes(notes)
        
        if generator.save_notes(notes):
            print(f"\n✅ Notes saved to exam_notes.json")
        
        print("\nValidation summary:")
        print(f"- {len(notes)} notes generated")
        print("- All IDs are valid (1-10)")
        print("- All summaries ≤ 150 chars")
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()