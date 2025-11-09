# CRMFlow API Documentation

Complete reference for all serverless API routes.

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-app.vercel.app/api`

## Authentication

All API routes expect API keys to be configured as environment variables on the server. Client-side requests do not need to pass authentication headers.

## Response Format

All API routes return normalized JSON responses:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2025-01-09T12:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "metadata": {
    "timestamp": "2025-01-09T12:00:00.000Z"
  }
}
```

### Error Codes

- `VALIDATION_ERROR` - Invalid input parameters
- `AUTHENTICATION_ERROR` - Missing or invalid credentials
- `EXTERNAL_API_ERROR` - Third-party API error
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT` - Too many requests
- `INTERNAL_ERROR` - Server error
- `MISSING_CONFIG` - Missing environment variable

## API Routes

### Gemini AI

#### Generate Text

Generate AI responses using Google Gemini.

**Endpoint**: `POST /api/gemini/generate`

**Request Body**:
```json
{
  "prompt": "What is the weather like?",
  "context": { "location": "San Francisco" },
  "maxTokens": 1024,
  "temperature": 0.7
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "text": "The weather in San Francisco is typically...",
    "usage": {
      "promptTokens": 15,
      "completionTokens": 42,
      "totalTokens": 57
    },
    "raw": { ... }
  }
}
```

#### Stream Text

Stream AI responses in real-time.

**Endpoint**: `POST /api/gemini/stream`

**Request Body**:
```json
{
  "prompt": "Tell me a story",
  "context": { "genre": "sci-fi" }
}
```

**Response**: Server-Sent Events (SSE)
```
data: {"text": "Once upon"}
data: {"text": " a time"}
data: {"text": " in a galaxy"}
```

---

### ElevenLabs TTS

#### Generate Speech

Convert text to speech using ElevenLabs.

**Endpoint**: `POST /api/elevenlabs/tts`

**Request Body**:
```json
{
  "text": "Hello, world!",
  "voiceId": "pNInz6obpgDQGcFmaJgB",
  "modelId": "eleven_turbo_v2_5",
  "stability": 0.5,
  "similarityBoost": 0.75
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "audioUrl": "data:audio/mpeg;base64,...",
    "audioBase64": "...",
    "format": "mp3",
    "voiceId": "pNInz6obpgDQGcFmaJgB",
    "modelId": "eleven_turbo_v2_5",
    "charactersUsed": 13
  }
}
```

#### List Voices

Get available voices.

**Endpoint**: `GET /api/elevenlabs/voices`

**Response**:
```json
{
  "success": true,
  "data": {
    "voices": [
      {
        "id": "pNInz6obpgDQGcFmaJgB",
        "name": "Adam",
        "category": "premade",
        "description": "Deep, narrative voice",
        "previewUrl": "https://..."
      }
    ]
  }
}
```

---

### Twilio

#### Make Phone Call

Initiate an outbound call.

**Endpoint**: `POST /api/twilio/call`

**Request Body**:
```json
{
  "to": "+14155551234",
  "from": "+14155559876",
  "twiml": "<Response><Say>Hello!</Say></Response>"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "callSid": "CA1234567890abcdef",
    "status": "queued",
    "to": "+14155551234",
    "from": "+14155559876",
    "direction": "outbound-api",
    "raw": { ... }
  }
}
```

#### Send SMS

Send a text message.

**Endpoint**: `POST /api/twilio/sms`

**Request Body**:
```json
{
  "to": "+14155551234",
  "from": "+14155559876",
  "body": "Your order has shipped!"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "messageSid": "SM1234567890abcdef",
    "status": "queued",
    "to": "+14155551234",
    "from": "+14155559876",
    "body": "Your order has shipped!",
    "raw": { ... }
  }
}
```

#### Send WhatsApp Message

Send a WhatsApp message.

**Endpoint**: `POST /api/twilio/whatsapp`

**Request Body**:
```json
{
  "to": "whatsapp:+14155551234",
  "from": "whatsapp:+14155559876",
  "body": "Hello from WhatsApp!"
}
```

**Response**: Same as SMS

---

### SAP Business One

#### Get Customer

Retrieve customer information.

**Endpoint**: `POST /api/sap/customer`

**Request Body**:
```json
{
  "customerId": "C001",
  "companyName": "Acme Corp"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "C001",
        "name": "Acme Corporation",
        "email": "contact@acme.com",
        "phone": "+1234567890",
        "address": {
          "street": "123 Main St",
          "city": "San Francisco",
          "country": "US",
          "zipCode": "94105"
        },
        "balance": 15000.00,
        "creditLimit": 50000.00,
        "raw": { ... }
      }
    ]
  }
}
```

#### Create Order

Create a sales order.

**Endpoint**: `POST /api/sap/order`

**Request Body**:
```json
{
  "customerId": "C001",
  "items": [
    {
      "itemCode": "ITEM-001",
      "quantity": 5,
      "price": 99.99
    }
  ],
  "deliveryDate": "2025-01-15"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "orderId": 12345,
    "orderNumber": "SO-2025-001",
    "customerId": "C001",
    "total": 499.95,
    "status": "open",
    "raw": { ... }
  }
}
```

#### Get Inventory

Check inventory levels.

**Endpoint**: `POST /api/sap/inventory`

**Request Body**:
```json
{
  "itemCode": "ITEM-001",
  "warehouseCode": "WH-01"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "itemCode": "ITEM-001",
        "itemName": "Widget Pro",
        "quantity": 150,
        "committed": 25,
        "available": 125,
        "price": 99.99,
        "raw": { ... }
      }
    ]
  }
}
```

---

### Google Calendar

#### Create Event

Create a calendar event.

**Endpoint**: `POST /api/google/calendar`

**Request Body**:
```json
{
  "summary": "Team Meeting",
  "description": "Weekly sync",
  "startDateTime": "2025-01-15T10:00:00Z",
  "endDateTime": "2025-01-15T11:00:00Z",
  "attendees": ["alice@example.com", "bob@example.com"],
  "timeZone": "America/Los_Angeles"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "eventId": "event123abc",
    "summary": "Team Meeting",
    "start": "2025-01-15T10:00:00Z",
    "end": "2025-01-15T11:00:00Z",
    "link": "https://calendar.google.com/event?eid=...",
    "status": "confirmed",
    "raw": { ... }
  }
}
```

---

### Google Sheets

#### Read Sheet

Read data from a spreadsheet.

**Endpoint**: `GET /api/google/sheets?spreadsheetId=ABC123&range=Sheet1!A1:D10`

**Response**:
```json
{
  "success": true,
  "data": {
    "range": "Sheet1!A1:D10",
    "values": [
      ["Name", "Email", "Phone", "Status"],
      ["Alice", "alice@example.com", "+1234567890", "Active"]
    ],
    "rowCount": 2,
    "raw": { ... }
  }
}
```

#### Write Sheet

Write data to a spreadsheet.

**Endpoint**: `POST /api/google/sheets`

**Request Body**:
```json
{
  "spreadsheetId": "ABC123",
  "range": "Sheet1!A1:B2",
  "values": [
    ["Name", "Status"],
    ["Alice", "Active"]
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "updatedRange": "Sheet1!A1:B2",
    "updatedRows": 2,
    "updatedColumns": 2,
    "updatedCells": 4,
    "raw": { ... }
  }
}
```

---

### Qlay

#### Execute Workflow

Execute a Qlay workflow.

**Endpoint**: `POST /api/qlay/execute`

**Request Body**:
```json
{
  "workflowId": "workflow-123",
  "input": {
    "userId": "user-456",
    "action": "process"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "executionId": "exec-789",
    "status": "completed",
    "output": {
      "result": "success",
      "data": { ... }
    },
    "startedAt": "2025-01-09T12:00:00Z",
    "completedAt": "2025-01-09T12:00:05Z",
    "raw": { ... }
  }
}
```

---

### Audio Streaming

#### Start Live Session

Start real-time audio streaming session.

**Endpoint**: `POST /api/audio/stream`

**Request Body** (Start):
```json
{
  "sessionId": "session-123",
  "action": "start"
}
```

**Request Body** (Send Chunk):
```json
{
  "sessionId": "session-123",
  "action": "chunk",
  "audioData": "base64-encoded-audio"
}
```

**Request Body** (End):
```json
{
  "sessionId": "session-123",
  "action": "end"
}
```

**Response** (Chunk):
```json
{
  "success": true,
  "data": {
    "sessionId": "session-123",
    "transcript": {
      "text": "[Interim transcript...]",
      "isFinal": false,
      "timestamp": 1704801600000
    },
    "audioProcessed": 5
  }
}
```

#### Stream Transcripts

Subscribe to transcript stream (SSE).

**Endpoint**: `GET /api/audio/stream?sessionId=session-123`

**Response**: Server-Sent Events
```
data: {"text": "Hello", "isFinal": false, "timestamp": 1704801600000}
data: {"text": "Hello world", "isFinal": true, "timestamp": 1704801601000}
```

#### Upload Audio File

Upload audio file in chunks (fallback).

**Endpoint**: `POST /api/audio/upload`

**Request Body** (FormData):
```
audio: <File>
chunkIndex: 0
totalChunks: 5
sessionId: upload-123
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sessionId": "upload-123",
    "chunkIndex": 0,
    "totalChunks": 5,
    "transcript": {
      "text": "[Transcribed text...]",
      "confidence": 0.95,
      "timestamp": 1704801600000
    },
    "audioProcessed": 1048576
  }
}
```

---

## Rate Limits

API routes inherit rate limits from external services:

- **Gemini**: 15 RPM (free tier), 360 RPM (paid)
- **ElevenLabs**: 20 concurrent requests
- **Twilio**: Varies by account type
- **SAP**: Depends on server configuration
- **Google APIs**: 100 requests/100 seconds/user

## CORS

All API routes support CORS for webhooks:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Error Handling

All routes implement consistent error handling:

1. **Input Validation** - Zod schemas validate all inputs
2. **External API Errors** - Wrapped and normalized
3. **Internal Errors** - Logged and sanitized
4. **Rate Limiting** - Proper HTTP 429 responses

## Testing

Use the provided curl examples to test each endpoint:

```bash
# Set your API URL
export API_URL=http://localhost:3001

# Test Gemini
curl -X POST $API_URL/api/gemini/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello", "temperature": 0.7}'

# Test ElevenLabs
curl -X POST $API_URL/api/elevenlabs/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Test speech"}'
```

## Client Usage

### With useLiveSession Hook

```typescript
import { useLiveSession } from '@/lib/hooks/useLiveSession'

function MyComponent() {
  const { startSession, stopSession, transcripts } = useLiveSession({
    onTranscript: (transcript) => {
      console.log('Transcript:', transcript.text)
    },
    onError: (error) => {
      console.error('Error:', error)
    },
  })

  return (
    <div>
      <button onClick={startSession}>Start Recording</button>
      <button onClick={stopSession}>Stop Recording</button>
      <div>
        {transcripts.map((t, i) => (
          <div key={i}>{t.text}</div>
        ))}
      </div>
    </div>
  )
}
```

### Direct API Calls

```typescript
// Generate AI text
const response = await fetch('/api/gemini/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'What is the weather?',
    temperature: 0.7,
  }),
})

const data = await response.json()
if (data.success) {
  console.log(data.data.text)
}
```

---

For more information, see [DEPLOYMENT.md](../DEPLOYMENT.md) for production setup.
