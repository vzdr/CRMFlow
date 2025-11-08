import os
import google.generativeai as genai
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# Configure the Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

app = FastAPI()

# Allow all origins for CORS (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connection established.")
    try:
        while True:
            # Receive transcript from the client
            transcript = await websocket.receive_text()
            print(f"Received transcript: {transcript}")

            # Start a streaming chat session with Gemini
            response_stream = model.generate_content(
                f"You are a helpful assistant. Respond to the following user statement concisely: '{transcript}'",
                stream=True
            )

            full_response = ""
            for chunk in response_stream:
                if chunk.text:
                    full_response += chunk.text
                    # Stream each chunk of the response back to the client
                    await websocket.send_text(chunk.text)

            print(f"Full Gemini response: {full_response}")
            # Send a special token to indicate the end of the stream
            await websocket.send_text("<END_OF_STREAM>")

    except WebSocketDisconnect:
        print("WebSocket connection closed.")
    except Exception as e:
        print(f"An error occurred: {e}")
        await websocket.close(code=1011, reason="An error occurred")
