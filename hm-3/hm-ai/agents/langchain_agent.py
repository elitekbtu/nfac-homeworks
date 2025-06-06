from dotenv import load_dotenv
load_dotenv()

import asyncio
import websockets
from langchain_openai import ChatOpenAI

SYSTEM_PROMPT = """You are a fitness planning assistant. Create personalized plans that include:
1. Weekly workout schedule
2. Basic nutrition guidelines
3. Required equipment

Keep recommendations practical and achievable."""

async def run_planner():
    # Initialize the language model
    llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)
    
    while True:
        try:
            # Connect to the WebSocket server
            async with websockets.connect("ws://localhost:8765") as ws:
                # Register as planner agent
                await ws.send("register:planner")
                print("[Planner] Connected and waiting for requests...")

                while True:
                    try:
                        # Wait for user requests
                        request = await ws.recv()
                        print(f"[Planner] Received request: {request[:50]}...")

                        # Generate response using LLM
                        response = llm.invoke(f"{SYSTEM_PROMPT}\n\nUser request: {request}")
                        
                        # Send response back to user via reviewer
                        await ws.send(f"send:reviewer:{response}")
                        print("[Planner] Response sent to reviewer")

                    except websockets.exceptions.ConnectionClosed:
                        print("[Planner] Connection lost, attempting to reconnect...")
                        break
                    except Exception as e:
                        error_msg = f"Error processing request: {str(e)}"
                        print(f"[Planner] {error_msg}")
                        await ws.send(f"send:user:{error_msg}")
                        continue

        except Exception as e:
            print(f"[Planner] Connection error: {e}")
            await asyncio.sleep(5)  # Wait before reconnecting

if __name__ == "__main__":
    try:
        asyncio.run(run_planner())
    except KeyboardInterrupt:
        print("\n[Planner] Shutting down...")