import { useState, useEffect } from 'react';
import useFlowStore from './hooks/useFlowStore';
import Canvas from './layouts/Canvas';
import './App.css';

function App() {
  const { addNode, addEdge, startWorkflow, stopWorkflow, isRunning } = useFlowStore();

  // Draft edge state for creating connections
  const [draftEdge, setDraftEdge] = useState(null);
  const [sourceNodeId, setSourceNodeId] = useState(null);

  // Initialize with some sample nodes
  useEffect(() => {
    addNode({
      id: 'node-1',
      label: 'Inbound Call',
      position: { x: 100, y: 200 }
    });
    addNode({
      id: 'node-2',
      label: 'Listen for Intent',
      position: { x: 400, y: 200 }
    });
    addNode({
      id: 'node-3',
      label: 'Process Response',
      position: { x: 700, y: 200 }
    });
  }, []);

  // Handle output handle mouse down - start creating edge
  const handleOutputHandleMouseDown = (nodeId, e) => {
    setSourceNodeId(nodeId);
    setDraftEdge({
      startPosition: { x: e.clientX, y: e.clientY },
      endPosition: { x: e.clientX, y: e.clientY }
    });
  };

  // Handle canvas mouse move - update draft edge
  const handleCanvasMouseMove = (e) => {
    if (draftEdge) {
      setDraftEdge({
        ...draftEdge,
        endPosition: { x: e.clientX, y: e.clientY }
      });
    }
  };

  // Handle input handle mouse up - complete edge
  const handleInputHandleMouseUp = (targetNodeId, e) => {
    if (draftEdge && sourceNodeId) {
      // Create the edge
      const newEdge = {
        id: `edge-${Date.now()}`,
        sourceNodeId: sourceNodeId,
        targetNodeId: targetNodeId
      };
      addEdge(newEdge);

      // Clear draft state
      setDraftEdge(null);
      setSourceNodeId(null);
    }
  };

  // Handle canvas mouse up - cancel edge if not over input handle
  const handleCanvasMouseUp = (e) => {
    // Only cancel if target is not an input handle
    if (e.target.dataset.handleType !== 'input') {
      setDraftEdge(null);
      setSourceNodeId(null);
    }
  };

  // Handle run workflow button
  const handleRunWorkflow = () => {
    if (isRunning) {
      stopWorkflow();
    } else {
      startWorkflow();
    }
  };

  return (
    <div className="app">
      {/* Header with controls */}
      <header className="app-header">
        <h1>CRMFlow - Visual Workflow Builder</h1>
        <button
          className={`run-button ${isRunning ? 'running' : ''}`}
          onClick={handleRunWorkflow}
        >
          {isRunning ? '⏸ Stop Workflow' : '▶ Run Workflow'}
        </button>
      </header>

      {/* Canvas */}
      <Canvas
        onOutputHandleMouseDown={handleOutputHandleMouseDown}
        onInputHandleMouseUp={handleInputHandleMouseUp}
        onCanvasMouseMove={handleCanvasMouseMove}
        onCanvasMouseUp={handleCanvasMouseUp}
        draftEdge={draftEdge}
      />
    </div>
  );
}

export default App;
