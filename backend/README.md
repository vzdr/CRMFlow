# CRMFlow Backend API

Production-ready Node.js/TypeScript backend with PostgreSQL, Prisma ORM, and Socket.IO for real-time workflow execution.

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Real-time**: Socket.IO
- **Authentication**: JWT (jsonwebtoken)
- **Encryption**: AES-256-GCM (crypto)
- **AI Integration**: Google Gemini 1.5 Flash

## Prerequisites

- Node.js 18 or higher
- Docker & Docker Compose (for PostgreSQL)
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="postgresql://crmflow:crmflow_dev_password@localhost:5432/crmflow?schema=public"
JWT_SECRET="your-secret-key-here"
ENCRYPTION_KEY="32-character-encryption-key-change"
SERVER_PORT=3001
```

### 3. Start PostgreSQL

```bash
docker-compose up -d
```

### 4. Run Database Migrations

```bash
npm run prisma:migrate
```

### 5. Generate Prisma Client

```bash
npm run prisma:generate
```

### 6. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3001`

## API Endpoints

### Authentication
```
POST   /api/auth/register     Register new user
POST   /api/auth/login        Login user
GET    /api/auth/me           Get current user (protected)
```

### Workflows
```
GET    /api/workflows         Get all user workflows
POST   /api/workflows         Create new workflow
GET    /api/workflows/:id     Get workflow with nodes/edges
PUT    /api/workflows/:id     Update workflow (auto-save)
DELETE /api/workflows/:id     Delete workflow
POST   /api/workflows/:templateId/clone   Clone template
```

### Knowledge Base
```
GET    /api/knowledge         Get all knowledge items
POST   /api/knowledge/pdf     Upload PDF (multipart)
POST   /api/knowledge/scrape  Scrape website
POST   /api/knowledge/manual  Add Q&A
PUT    /api/knowledge/:id     Update item
DELETE /api/knowledge/:id     Delete item
```

### API Keys (Encrypted Storage)
```
POST   /api/keys              Save API key (Gemini, etc.)
GET    /api/keys              List saved services
DELETE /api/keys/:service     Delete key
```

### AI Proxy
```
POST   /api/ai/generate            Generate AI response
POST   /api/ai/generate-workflow   Generate workflow from prompt
```

### Templates
```
GET    /api/templates         Get all workflow templates
```

### Health
```
GET    /api/health            API health check
```

## Socket.IO Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `session:start` | `{ workflowId, userId }` | Start workflow execution |
| `node:execute` | `{ nodeId }` | Execute specific node |
| `user:message` | `{ message }` | Send user input |
| `workflow:advance` | `{ fromNodeId }` | Advance to next node |
| `session:end` | - | End execution session |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `session:started` | `{ workflowId, activeNode, totalNodes }` | Session initialized |
| `node:execution_complete` | `{ nodeId }` | Node finished executing |
| `ai:chunk` | `{ chunk }` | Streaming AI response chunk |
| `ai:processing_start` | - | AI processing started |
| `ai:processing_end` | - | AI processing finished |
| `system:waiting_for_input` | `{ nodeId, label }` | Waiting for user |
| `workflow:node_activated` | `{ node }` | New node activated |
| `workflow:finished` | `{ completedNodes }` | Workflow complete |
| `error:api` | `{ message }` | Error occurred |

## Database Schema

### User
- id (cuid)
- email (unique)
- password (bcrypt hashed)
- createdAt, updatedAt
- Relations: workflows, apiKeys, knowledgeItems, executionLogs

### Workflow
- id (cuid)
- name
- isPublic, isTemplate
- userId (foreign key)
- Relations: nodes, edges, executionLogs

### Node
- id (cuid)
- label, type (trigger, speak, listen, ai, logic, integration)
- positionX, positionY
- data (JSON)
- workflowId (foreign key)

### Edge
- id (cuid)
- sourceNodeId, targetNodeId
- workflowId (foreign key)

### ApiKey
- id (cuid)
- service (gemini, elevenlabs, twilio)
- encryptedKey (AES-256-GCM)
- userId (foreign key)

### KnowledgeItem
- id (cuid)
- type (pdf, web, manual, voice)
- name, content
- enabled (boolean)
- userId (foreign key)

### ExecutionLog
- id (cuid)
- eventType (session_start, message_sent, ai_response, node_advance, session_end)
- nodeId, nodeType
- data (JSON)
- userId, workflowId (foreign keys)
- createdAt (for analytics)

## Security Features

- **Password Hashing**: bcrypt with 10 rounds
- **JWT Tokens**: Signed with HS256, 7-day expiration
- **API Key Encryption**: AES-256-GCM with random IV
- **CORS Protection**: Configured origins
- **Input Validation**: zod schemas (to be implemented)
- **SQL Injection Protection**: Prisma parameterized queries
- **Ownership Checks**: All resources verified

## Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm run start        # Run production build
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (DB GUI)
```

## Development

### Adding New Endpoints

1. Create service in `/src/services/`
2. Create controller in `/src/controllers/`
3. Create routes in `/src/api/`
4. Register routes in `/src/api/index.ts`

### Database Changes

1. Modify `/prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Update TypeScript types as needed

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET` and `ENCRYPTION_KEY`
3. Configure production database URL
4. Run `npm run build`
5. Run `npm run start`
6. Use process manager (PM2, systemd)
7. Set up reverse proxy (nginx)
8. Enable HTTPS
9. Configure backup strategy

## Troubleshooting

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart db

# View logs
docker-compose logs db
```

### Prisma Client Out of Sync
```bash
npm run prisma:generate
```

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

## Architecture

```
backend/
├── src/
│   ├── api/            # Route definitions
│   ├── config/         # Configuration (Prisma client)
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── services/       # Business logic
│   ├── utils/          # Utilities (crypto, etc.)
│   └── server.ts       # Application entry point
├── prisma/
│   └── schema.prisma   # Database schema
├── .env                # Environment variables (gitignored)
├── .env.example        # Example environment file
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## License

Private - All Rights Reserved
