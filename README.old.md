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

(Instructions to be added)

## Development

(Instructions to be added)

## License

(To be determined)
