import { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import NodeLibrary from './layouts/NodeLibrary';
import Canvas from './layouts/Canvas';
import ConfigPanel from './components/ConfigPanel';

// Node Library Data (centralized)
const libraryNodes = [
  { id: 'node-1', label: 'Inbound Call' },
  { id: 'node-2', label: 'Speak Text' },
  { id: 'node-3', label: 'Listen for Intent' },
  { id: 'node-4', label: 'Condition: If/Else' },
  { id: 'node-5', label: 'SAP: Create Lead' },
];

export default function App() {
  const [canvasNodes, setCanvasNodes] = useState([]);

  function handleDragEnd(event) {
    const { over, active } = event;
    if (over && over.id === 'canvas-drop-area') {
      const draggedNodeInfo = libraryNodes.find(n => n.id === active.id);
      if (draggedNodeInfo) {
        const newNode = {
          id: `${draggedNodeInfo.id}-${Date.now()}`, // Unique ID for the canvas instance
          label: draggedNodeInfo.label,
          // Position would be calculated based on drop coordinates
          // For now, we'll place it statically
          position: { x: 200, y: 150 },
        };
        setCanvasNodes(prevNodes => [...prevNodes, newNode]);
      }
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex w-screen h-screen font-sans overflow-hidden bg-background text-on-surface">
        <NodeLibrary nodes={libraryNodes} />
        <Canvas nodes={canvasNodes} />
        <ConfigPanel />
      </div>
    </DndContext>
  );
}
