import asyncio
import websockets

# Store agent connections
agents = {}

async def handle_connection(websocket):
    agent_name = None
    try:
        async for message in websocket:
            # Handle agent registration
            if message.startswith("register:"):
                agent_name = message.split(":", 1)[1]
                agents[agent_name] = websocket
                print(f"[Server] Agent '{agent_name}' registered")
                continue

            # Handle message routing between agents
            if message.startswith("send:"):
                try:
                    _, target_agent, payload = message.split(":", 2)
                    if target_agent in agents:
                        await agents[target_agent].send(payload)
                        print(f"[Server] Message routed: {agent_name} → {target_agent}")
                    else:
                        print(f"[Server] Error: Target agent '{target_agent}' not found")
                        await websocket.send(f"Error: Agent '{target_agent}' not available")
                except ValueError:
                    print("[Server] Error: Invalid message format")
                    await websocket.send("Error: Invalid message format")
            else:
                print(f"[Server] Warning: Unknown message format: {message[:50]}...")

    except websockets.exceptions.ConnectionClosed:
        print(f"[Server] Connection closed for agent: {agent_name}")
    finally:
        if agent_name and agent_name in agents:
            del agents[agent_name]
            print(f"[Server] Agent '{agent_name}' unregistered")

async def main():
    server = await websockets.serve(
        handle_connection,
        "localhost",
        8765,
        ping_interval=20,
        ping_timeout=60
    )
    print("[Server] A2A Server running on ws://localhost:8765")
    await server.wait_closed()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[Server] Shutting down...")