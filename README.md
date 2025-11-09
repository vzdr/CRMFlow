# CRMFlow

**The Visual IDE for Building Intelligent Voice-Driven Workflows**

## Core Pitch

CRMFlow is a no-code visual design studio that empowers businesses to create intelligent, voice-driven workflows. We leverage the visual automation paradigm of n8n to build conversational AI agents powered by Google's Gemini, which feed structured data directly into enterprise systems like SAP.

> "Business processes are workflows. Customer conversations are workflows. Today, designing and automating them is complex. We built CRMFlow to make it as simple as drawing on a whiteboard."

## Vision: The IDE for Citizen Developers

CRMFlow is an Interactive Development Environment (IDE) for "citizen developers"—business managers, sales leaders, and support staff. It empowers them to build, test, and deploy sophisticated conversational AI without needing a team of engineers. We're turning complex AI services into simple, visual building blocks.

## The Perfect End Product: The "Flow" Studio

A clean, powerful, single-page web application with a dark-themed, professional-grade visual editor inspired by n8n and modern development tools.

### Core Components

#### 1. Node Library (The Toolbox)
Sidebar containing draggable building blocks for conversations. Each node is a self-contained micro-application.

#### 2. The Canvas (The Whiteboard)
Visual workspace where users construct workflows by connecting nodes.

#### 3. Configuration Panel (The Settings)
Deep customization panel that appears when clicking a node.

### Key Nodes

#### Triggers
- **Inbound Call** (via Twilio): Assign real phone numbers to workflows
- **Webhook**: Integration with other systems

#### Agent Actions
- **Speak Text** (via ElevenLabs): Custom voice cloning
- **Listen & Understand** (via Google Gemini): Real-time intent and entity recognition using Gemini's streaming conversational API

#### Logic
- **Condition: If/Else**: Standard logic gates
- **Sentiment Analysis** (via Gemini): Outputs sentiment scores for empathetic conversation branching

#### Integrations
- **SAP**: Create Lead / Get Customer
- **Qlay**: Screen Candidate
- **Google**: Create Calendar Event / Read Sheet

## Killer Demo Templates

### Template 1: SAP Sales Qualifier
Automates initial qualification of sales leads:
1. Inbound call triggers workflow
2. Professional AI greeting with cloned voice
3. Captures company name
4. Checks SAP for existing high-value clients
5. Routes accordingly and creates structured SAP lead record

### Template 2: Qlay Candidate Screener
Performs consistent screening interviews:
1. Webhook triggered on candidate application
2. Outbound call via Twilio
3. Series of questions from Google Sheet
4. Captures answers via Gemini
5. Sends transcript and AI summary to Qlay

## Tech Stack

- **Frontend**: React/Next.js
- **Canvas**: React Flow or similar
- **AI**: Google Gemini API
- **Voice**: ElevenLabs API
- **Telephony**: Twilio API
- **Integrations**: SAP, Qlay, Google APIs

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- API keys for the services you want to use (see below)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vzdr/CRMFlow.git
   cd CRMFlow
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.local.example .env.local

   # Edit .env.local and add your API keys
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   - Navigate to http://localhost:3000
   - Go to http://localhost:3000/studio to access the Flow Studio

## Mock Mode for Development

CRMFlow includes a comprehensive mock mode that simulates all external API calls with realistic, deterministic data. This allows you to develop and test workflows without configuring any external services.

### Enabling Mock Mode

**Option 1: Environment Variable (Recommended)**
```bash
# In your .env.local file
USE_MOCK=1
```

**Option 2: Browser Console**
```javascript
// Enable mock mode in the browser
localStorage.setItem('USE_MOCK', '1')
// Then refresh the page

// Disable mock mode
localStorage.removeItem('USE_MOCK')
```

### What Mock Mode Provides

When mock mode is enabled, all node executors use simulated services:

- **Twilio**: Simulates inbound/outbound calls with realistic phone numbers and call data
- **ElevenLabs**: Returns mock audio URLs and metadata for text-to-speech
- **Google Gemini**: Provides deterministic AI responses for listening, understanding, and sentiment analysis
- **SAP**: Returns mock customer data (Acme Corp, TechStart Inc, Global Logistics) and creates sample leads
- **Google Sheets**: Returns sample tabular data with names, emails, and phone numbers
- **Google Calendar**: Creates mock calendar events with realistic timestamps
- **Qlay**: Performs candidate screening with deterministic scores based on name hashing

### Mock Data Examples

**SAP Customer Lookup**: Search for "Acme", "TechStart", or "Global" to get sample customer records with full company details, revenue data, and account manager information.

**Qlay Screening**: The mock service generates scores based on candidate names, so the same candidate will always receive the same screening result (deterministic for testing).

**Gemini Conversations**: Returns rotating responses based on conversation context, simulating realistic multi-turn conversations.

### When to Use Mock Mode

✅ **Use mock mode when:**
- Developing new workflow features
- Testing flow logic without API costs
- Demonstrating the platform to stakeholders
- Learning how nodes connect and pass data

❌ **Disable mock mode when:**
- Testing actual API integrations
- Running production workflows
- Validating external service configurations

## Configuration & API Keys

CRMFlow integrates with multiple third-party services. You'll need API keys for the features you want to use.

### Required API Keys by Service

#### 🤖 Google Gemini (AI-Powered Conversations)

**What it does:** Powers the "Listen & Understand" node with real-time intent recognition and the "Sentiment Analysis" node.

**How to get it:**
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Create a new API key
4. Add to `.env.local`:
   ```
   GOOGLE_GEMINI_API_KEY=your_api_key_here
   ```

**Pricing:** Free tier available with generous limits

---

#### 📞 Twilio (Voice & SMS)

**What it does:** Handles the "Inbound Call" trigger node, allowing you to assign real phone numbers to workflows.

**How to get it:**
1. Sign up at https://www.twilio.com/try-twilio
2. Go to Console Dashboard
3. Find your Account SID and Auth Token
4. Purchase a phone number (or use trial number)
5. Add to `.env.local`:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

**Pricing:** Pay-as-you-go. Trial account includes free credits.

---

#### 🎙️ ElevenLabs (Text-to-Speech)

**What it does:** Powers the "Speak Text" node with high-quality, natural-sounding voice synthesis. Supports voice cloning.

**How to get it:**
1. Sign up at https://elevenlabs.io/
2. Go to Profile → API Keys
3. Generate a new API key
4. Optionally, clone a voice and copy the Voice ID
5. Add to `.env.local`:
   ```
   ELEVENLABS_API_KEY=your_api_key_here
   ELEVENLABS_VOICE_ID=your_voice_id (optional)
   ```

**Pricing:** Free tier: 10,000 characters/month. Paid plans available.

---

#### 🏢 SAP (CRM Integration)

**What it does:** Powers "SAP Create Lead" and "SAP Get Customer" integration nodes.

**How to get it:**
1. Contact your SAP administrator for API credentials
2. You'll need:
   - API URL (your SAP instance)
   - Client ID and Secret (OAuth credentials)
   - Username and Password
3. Add to `.env.local`:
   ```
   SAP_API_URL=https://your-sap-instance.com/api
   SAP_CLIENT_ID=your_client_id
   SAP_CLIENT_SECRET=your_client_secret
   SAP_USERNAME=your_username
   SAP_PASSWORD=your_password
   ```

**Note:** SAP configuration varies by organization. Work with your IT team.

---

#### 📊 Google Cloud (Sheets, Calendar, etc.)

**What it does:** Powers "Google Read Sheet" and "Google Create Event" integration nodes.

**Authentication Method:** Service Account (recommended for automation)

**How to get it:**

1. **Create a Google Cloud Project**
   - Go to https://console.cloud.google.com/
   - Click "Select a project" → "New Project"
   - Name your project (e.g., "CRMFlow Integration")
   - Click "Create"

2. **Enable Required APIs**
   - In the Cloud Console, go to "APIs & Services" → "Library"
   - Search for and enable:
     - Google Sheets API
     - Google Calendar API

3. **Create a Service Account**
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Name: `crmflow-automation`
   - Description: "Service account for CRMFlow automation"
   - Click "Create and Continue"
   - Skip "Grant this service account access to project" (optional)
   - Click "Done"

4. **Generate Service Account Key**
   - Click on the newly created service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON" format
   - Click "Create" (downloads a JSON file)

5. **Extract Credentials from JSON**
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "crmflow-automation@your-project.iam.gserviceaccount.com",
     ...
   }
   ```

6. **Add to `.env.local`**
   ```bash
   GOOGLE_SERVICE_ACCOUNT_EMAIL=crmflow-automation@your-project.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_PROJECT_ID=your-project-id
   ```

   ⚠️ **Important:** The private key must include the newline characters (`\n`). Keep the quotes around the entire key.

7. **Grant Access to Resources**

   For **Google Sheets:**
   - Open your Google Sheet
   - Click "Share"
   - Add the service account email (`crmflow-automation@...`)
   - Give "Editor" permission
   - Click "Done"

   For **Google Calendar:**
   - Open Google Calendar
   - Go to "Settings" → "Settings for my calendars"
   - Select the calendar you want to use
   - Scroll to "Share with specific people"
   - Add the service account email
   - Give "Make changes to events" permission
   - Click "Send"

**Alternative: OAuth 2.0 for User Context**

If you need to access user-specific resources (not recommended for automation), you can use OAuth 2.0:

1. **Create OAuth 2.0 Credentials**
   - In Cloud Console, go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Click "Create"

2. **OAuth Flow (Future Implementation)**
   ```typescript
   // Note: OAuth implementation is planned for future releases
   // For now, use Service Account for automation

   // OAuth will allow:
   // - User consent flow
   // - Access to user's personal calendars
   // - Refresh token management
   ```

3. **Add OAuth Credentials to `.env.local`**
   ```bash
   GOOGLE_OAUTH_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
   GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
   ```

**Current Implementation Status:**
- ✅ Service Account authentication (ready to implement)
- ✅ Mock mode (fully functional)
- 🔨 Real API integration (skeleton endpoints created at `/api/google/sheets/read` and `/api/google/calendar/create`)
- 📋 OAuth 2.0 user flow (planned for future release)

**Pricing:** Free for reasonable usage. See [Google Cloud Pricing](https://cloud.google.com/pricing) for details.

**Useful Links:**
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [Service Account Guide](https://cloud.google.com/iam/docs/service-accounts)

---

#### 👔 Qlay (Candidate Screening)

**What it does:** Powers the "Qlay Screen Candidate" integration node for automated recruitment workflows.

**How to get it:**
1. Contact Qlay for API access
2. Obtain your API key from their platform
3. Add to `.env.local`:
   ```
   QLAY_API_KEY=your_api_key_here
   QLAY_API_URL=https://api.qlay.ai/v1
   ```

**Note:** Qlay is an enterprise service. Contact their sales team for access.

---

### Environment Variable Security

⚠️ **IMPORTANT SECURITY NOTES:**

1. **NEVER commit `.env.local` to version control**
   - It's already in `.gitignore`
   - Contains sensitive API keys

2. **Client vs Server Variables:**
   - `NEXT_PUBLIC_*` variables are embedded in the client bundle (visible to users)
   - Only use `NEXT_PUBLIC_*` for non-sensitive configuration
   - All API keys should be server-side only (no `NEXT_PUBLIC_` prefix)

3. **Using Secrets in Code:**
   - ✅ **Server-side (API routes):** Use `serverSecrets` from `@/config/secrets`
   - ❌ **Client-side:** Never import or use server secrets in React components

4. **Example - Correct Usage:**
   ```typescript
   // In an API route (server-side) ✅
   import { serverSecrets } from '@/config/secrets'

   export async function POST(request: Request) {
     const apiKey = serverSecrets.gemini.apiKey()
     // Use apiKey to call external service
   }
   ```

   ```typescript
   // In a React component (client-side) ❌ WRONG!
   import { serverSecrets } from '@/config/secrets'
   // This exposes secrets to the browser!
   ```

### Testing Your Setup

Visit http://localhost:3000/api/example to check which services are configured:

```bash
curl http://localhost:3000/api/example
```

This endpoint will show you which API keys are properly configured without exposing the actual keys.

## Development

### Project Structure

```
CRMFlow/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   │   ├── studio/      # Flow Studio IDE
│   │   │   └── api/         # API routes (server-side)
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities and core logic
│   │   │   ├── nodeRegistry.ts    # Node definitions
│   │   │   ├── flowExecutor.ts    # Execution engine
│   │   │   └── nodeTypes.ts       # Type definitions
│   │   └── config/          # Configuration
│   │       └── secrets.ts   # Environment variable management
│   ├── .env.local.example   # Example environment variables
│   └── package.json
└── README.md
```

### Key Technologies

- **Next.js 15** - React framework with App Router
- **React Flow** - Visual node-based editor
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zod** - Schema validation

### Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check

# Run linting
npm run lint

# Format code
npm run format
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

(To be determined)
