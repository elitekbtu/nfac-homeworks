import asyncio
import os
import websockets
from dotenv import load_dotenv
from pydantic_ai import Agent

load_dotenv()

# Ensure logs directory exists
os.makedirs("logs", exist_ok=True)

# Initialize the reviewer agent
reviewer = Agent(
    "google-gla:gemini-1.5-flash",
    system_prompt="""You are a fitness plan reviewer. For each plan:
1. Check if the plan is realistic and matches the user's request
2. Verify the exercises are safe and appropriate
3. Validate the nutrition guidelines

Respond with either:
✅ APPROVED - if the plan is good
🔧 NEEDS REVISION - with specific points to improve

End with one practical tip for better results."""
)

async def run_reviewer():
    while True:
        try:
            # Connect to WebSocket server
            async with websockets.connect("ws://localhost:8765") as ws:
                # Register as reviewer agent
                await ws.send("register:reviewer")
                print("[Reviewer] Connected and waiting for plans...")

                while True:
                    try:
                        # Receive fitness plan
                        plan = await ws.recv()
                        print("[Reviewer] Received plan for review")

                        # Review the plan
                        review = await reviewer.run(plan)
                        
                        # Send review to user
                        await ws.send(f"send:user:{review.output}")
                        print("[Reviewer] Review sent to user")

                        # Log the interaction
                        with open("logs/reviews.log", "a", encoding="utf-8") as f:
                            f.write("\n=== Plan ===\n" + plan +
                                  "\n=== Review ===\n" + review.output + "\n")

                    except websockets.exceptions.ConnectionClosed:
                        print("[Reviewer] Connection lost, attempting to reconnect...")
                        break
                    except Exception as e:
                        error_msg = f"Error reviewing plan: {str(e)}"
                        print(f"[Reviewer] {error_msg}")
                        await ws.send(f"send:user:{error_msg}")
                        continue

        except Exception as e:
            print(f"[Reviewer] Connection error: {e}")
            await asyncio.sleep(5)  # Wait before reconnecting

if __name__ == "__main__":
    try:
        asyncio.run(run_reviewer())
    except KeyboardInterrupt:
        print("\n[Reviewer] Shutting down...")