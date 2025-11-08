# CRMFlow Frontend - Visual Workflow Builder

A powerful, visual workflow engine built with React and Zustand that enables users to create, connect, and execute intelligent voice-driven workflows.

## 🚀 Features

### Phase 1: Connection System ✅
- **Zustand State Management**: Centralized store for nodes, edges, and workflow execution state
- **Visual Node Handles**: Input (left) and Output (right) connection points on each node
- **Dynamic Edge Rendering**: SVG-based curved connections between nodes
- **Node Positioning**: Draggable nodes with real-time position updates

### Phase 2: Interactive Connections ✅
- **Draft Edge System**: Visual feedback while creating connections
- **Mouse-based Interaction**: Click and drag from output to input handles
- **Connection Validation**: Properly validates and creates edges between nodes
- **Canvas Event Handling**: Comprehensive mouse event system

### Phase 3: Workflow Execution Engine ✅
- **Execution State Management**: Track running workflows and active nodes
- **Run/Stop Controls**: Start and stop workflows with visual feedback
- **Active Node Highlighting**: Visual indication of currently executing node with pulsing animation
- **Automatic Flow Navigation**: Automatically advances through connected nodes

### Phase 4: AI Integration ✅
- **WebSocket Service**: Real-time communication with backend AI services
- **Voice Processing**: Browser-based speech recognition and synthesis
- **Specialized AI Node**: Dedicated node component for "Listen for Intent" functionality
- **Live Interaction**: Real-time voice input, AI processing, and spoken responses

## 🛠️ Installation & Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🎯 How It Works

### Creating Workflows
1. Nodes are initialized with position and label
2. Drag nodes to position them on the canvas
3. Create connections by clicking output handle and dragging to input handle
4. Run workflow by clicking "Run Workflow" button

### Execution Flow
1. **Start**: `startWorkflow()` finds the first node
2. **Execute**: Active node performs its logic
3. **Advance**: Node calls `advanceWorkflow(nodeId)` when complete
4. **Continue**: System finds next node and sets it as active
5. **Complete**: Workflow stops when no more edges exist

## 📁 Project Structure

```
frontend/src/
├── components/          # React components
│   ├── CanvasNode.jsx
│   ├── AIListenNode.jsx
│   └── Edge.jsx
├── layouts/            # Layout components
│   └── Canvas.jsx
├── hooks/              # Custom hooks
│   ├── useFlowStore.js
│   └── useVoiceProcessor.js
├── services/           # External services
│   └── socketService.js
└── App.jsx            # Main app
```

## 🎨 All Four Phases Complete

✅ **Phase 1**: Connection architecture with Zustand, handles, and edges
✅ **Phase 2**: Interactive connection creation via mouse events
✅ **Phase 3**: Workflow execution engine with visual feedback
✅ **Phase 4**: AI integration with WebSocket and voice processing

---
Built with React + Vite + Zustand ⚡
