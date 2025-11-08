# Project Flow Backend

This is the backend server for Project Flow, providing real-time AI responses using Google's Gemini API via WebSocket connections.

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure API Key

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Google API Key:
   ```
   GOOGLE_API_KEY="your-actual-api-key-here"
   ```

### 3. Run the Server

```bash
uvicorn main:app --reload --port 8000
```

The WebSocket server will be available at `ws://localhost:8000/ws`

## API Endpoints

### WebSocket: `/ws`

- **Purpose**: Real-time streaming communication with Gemini AI
- **Protocol**: WebSocket
- **Input**: Text transcript from the client
- **Output**: Streaming AI response chunks, ending with `<END_OF_STREAM>`

## Development Notes

- The server uses CORS middleware configured to allow all origins for development
- For production, update the `allow_origins` configuration to specific domains
- The server uses Gemini 1.5 Flash model for fast responses
