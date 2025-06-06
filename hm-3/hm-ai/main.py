import asyncio
import websockets

async def client():
    async with websockets.connect("ws://localhost:8765") as ws:
        # Register as user agent
        await ws.send("register:user")
        print("🔹 Connected to FitBot Assistant")

        while True:
            try:
                message = input("\n📝 Your request (or press Enter to exit): ").strip()
                if not message:
                    break

                # Send message to planner agent
                await ws.send(f"send:planner:{message}")
                
                # Receive response from planner agent (via server)
                response = await ws.recv()
                print("\n💡 Response:\n" + response)
                
            except websockets.exceptions.ConnectionClosed:
                print("\n❌ Connection lost. Exiting...")
                break
            except Exception as e:
                print(f"\n❌ Error: {str(e)}")
                break

if __name__ == "__main__":
    try:
        asyncio.run(client())
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")