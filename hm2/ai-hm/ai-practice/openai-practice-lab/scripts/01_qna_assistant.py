import os
import json
import time
from dotenv import load_dotenv
from openai import OpenAI
from typing import Tuple, Optional, Dict, Any, List

# Load environment variables
load_dotenv()

def create_thread_and_run(client: OpenAI, assistant_id: str, user_message: str) -> Tuple[Any, Any]:
    """Create a new thread and run with the user's message."""
    thread = client.beta.threads.create()
    
    client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=user_message
    )
    
    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=assistant_id
    )
    
    return thread, run

def wait_for_run_completion(client: OpenAI, thread_id: str, run_id: str) -> Any:
    """Wait for the run to complete and return the final status."""
    while True:
        run = client.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run_id
        )
        
        if run.status == "completed":
            return run
        elif run.status in ["failed", "cancelling", "cancelled", "expired"]:
            print(f"Run ended with status: {run.status}")
            if run.status == "failed" and hasattr(run, 'last_error'):
                print(f"Error details: {run.last_error}")
            return run
        
        print(f"Current status: {run.status}... waiting")
        time.sleep(2)

def get_response_and_citations(client: OpenAI, thread_id: str) -> Tuple[Optional[str], List[Dict]]:
    """Retrieve the assistant's response and any citations from the thread."""
    messages = client.beta.threads.messages.list(thread_id=thread_id)
    
    for message in messages:
        if message.role == "assistant" and message.content:
            content = message.content[0].text.value
            
            citations = []
            if hasattr(message.content[0].text, "annotations"):
                for annotation in message.content[0].text.annotations:
                    citation = {
                        "type": annotation.type,
                        "text": annotation.text,
                    }
                    if hasattr(annotation, "file_citation"):
                        citation["file_citation"] = annotation.file_citation
                    citations.append(citation)
            
            return content, citations
    
    return None, []

def load_assistant_info(file_path: str = "assistant_info.json") -> Dict[str, Any]:
    """Load assistant information from JSON file."""
    if not os.path.exists(file_path):
        raise FileNotFoundError("Assistant not found. Please run the bootstrap script first.")
    
    with open(file_path, "r") as f:
        return json.load(f)

def display_welcome_message():
    """Display the welcome message and instructions."""
    border = "=" * 60
    print(f"\n{border}")
    print("🤖 TRANSFORMER PAPER Q&A MODE".center(60))
    print(border)
    print("Ask questions about 'Attention Is All You Need'.")
    print("Type 'quit', 'exit', or 'bye' to exit.")
    print(border)

def main():
    try:
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        assistant_info = load_assistant_info()
        assistant_id = assistant_info["id"]
        print(f"Using assistant: {assistant_id}")
        
        display_welcome_message()
        
        while True:
            try:
                user_question = input("\n❓ Your question: ").strip()
                
                if user_question.lower() in ["quit", "exit", "bye"]:
                    print("👋 Goodbye!")
                    break
                    
                if not user_question:
                    print("⚠️ Please enter a question.")
                    continue
                
                thread, run = create_thread_and_run(client, assistant_id, user_question)
                completed_run = wait_for_run_completion(client, thread.id, run.id)
                
                if completed_run.status == "completed":
                    response, citations = get_response_and_citations(client, thread.id)
                    print(f"\n📚 Answer:\n{response}")
                    
                    if citations:
                        print(f"\n📎 Citations ({len(citations)}):")
                        for i, citation in enumerate(citations, 1):
                            print(f"  {i}. Type: {citation.get('type')}")
                            print(f"     Text: {citation.get('text')}")
                            if 'file_citation' in citation:
                                print(f"     File citation: {citation['file_citation']}")
                else:
                    print(f"❌ Failed to get response: {completed_run.status}")
                    
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error occurred: {str(e)}")
                continue
                
    except Exception as e:
        print(f"❌ Initialization error: {str(e)}")

if __name__ == "__main__":
    main()