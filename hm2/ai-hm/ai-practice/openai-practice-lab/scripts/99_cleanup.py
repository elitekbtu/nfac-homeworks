import os
import json
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from openai import OpenAI
from openai.types import FileDeleted, VectorStoreDeleted

load_dotenv()

class CleanupManager:
    """Manages cleanup of OpenAI resources and local files."""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.assistant_file = "assistant_info.json"
        self.notes_file = "exam_notes.json"
    
    def load_assistant_info(self) -> Optional[Dict[str, Any]]:
        """Load assistant info from JSON file if exists."""
        if not os.path.exists(self.assistant_file):
            print("📭 No assistant info found. Nothing to clean.")
            return None
        
        try:
            with open(self.assistant_file, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️ Failed to load assistant info: {e}")
            return None
    
    def delete_vector_store(self, vector_id: str) -> bool:
        """Delete vector store resource."""
        try:
            result: VectorStoreDeleted = self.client.beta.vector_stores.delete(vector_id)
            print(f"✅ Deleted vector store: {vector_id}")
            return result.deleted
        except Exception as e:
            print(f"⚠️ Failed to delete vector store {vector_id}: {e}")
            return False
    
    def delete_file(self, file_id: str) -> bool:
        """Delete file resource."""
        try:
            result: FileDeleted = self.client.files.delete(file_id)
            print(f"✅ Deleted file: {file_id}")
            return result.deleted
        except Exception as e:
            print(f"⚠️ Failed to delete file {file_id}: {e}")
            return False
    
    def delete_assistant(self, assistant_id: str) -> bool:
        """Delete assistant resource."""
        try:
            result = self.client.beta.assistants.delete(assistant_id)
            print(f"✅ Deleted assistant: {assistant_id}")
            return result.deleted
        except Exception as e:
            print(f"⚠️ Failed to delete assistant {assistant_id}: {e}")
            return False
    
    def remove_local_file(self, file_path: str) -> bool:
        """Remove local file."""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"✅ Removed {file_path}")
                return True
            return False
        except Exception as e:
            print(f"⚠️ Failed to remove {file_path}: {e}")
            return False
    
    def cleanup(self) -> None:
        """Perform complete cleanup routine."""
        print("🧹 Starting cleanup...")
        
        assistant_info = self.load_assistant_info()
        if not assistant_info:
            return
        
        # Clean up OpenAI resources
        if "vector_store_id" in assistant_info:
            self.delete_vector_store(assistant_info["vector_store_id"])
        
        if "file_id" in assistant_info:
            self.delete_file(assistant_info["file_id"])
        
        if "id" in assistant_info:
            self.delete_assistant(assistant_info["id"])
        
        # Clean up local files
        self.remove_local_file(self.assistant_file)
        self.remove_local_file(self.notes_file)
        
        print("🎉 Cleanup completed!")

def main():
    try:
        manager = CleanupManager()
        manager.cleanup()
    except Exception as e:
        print(f"❌ Unexpected error during cleanup: {e}")

if __name__ == "__main__":
    main()