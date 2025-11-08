import { useState } from 'react';
import useFlowStore from './hooks/useFlowStore';
import Canvas from './layouts/Canvas';
import WorkflowGenerator from './components/WorkflowGenerator';
import { generateWorkflow } from './services/workflowGeneratorService';
import './App.css';

function App() {
  const { addEdge, startWorkflow, stopWorkflow, isRunning, setWorkflow } = useFlowStore();

  // Draft edge state for creating connections
  const [draftEdge, setDraftEdge] = useState(null);
  const [sourceNodeId, setSourceNodeId] = useState(null);

  // Workflow generation state
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Handle workflow generation from prompt
  const handleGenerateWorkflow = async (prompt) => {
    setIsGenerating(true);
    try {
      const { nodes, edges } = await generateWorkflow(prompt);
      setWorkflow(nodes, edges);
      console.log('Generated workflow:', { nodes, edges });
    } catch (error) {
      console.error('Failed to generate workflow:', error);
      alert('Failed to generate workflow. Please try again.');
    } finally {
      setIsGenerating(false);
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

      {/* Workflow Generator */}
      <WorkflowGenerator
        onGenerateWorkflow={handleGenerateWorkflow}
        isGenerating={isGenerating}
      />

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
