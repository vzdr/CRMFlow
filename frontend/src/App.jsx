import { useState } from 'react';
import useFlowStore from './hooks/useFlowStore';
import Canvas from './layouts/Canvas';
import WorkflowGenerator from './components/WorkflowGenerator';
import LiveTestMode from './components/LiveTestMode';
import TemplateLibrary from './components/TemplateLibrary';
import IntelligenceHub from './components/IntelligenceHub';
import DeploymentMenu from './components/DeploymentMenu';
import { generateWorkflow } from './services/workflowGeneratorService';
import './App.css';

function App() {
  const { addEdge, startWorkflow, stopWorkflow, isRunning, setWorkflow } = useFlowStore();

  // Draft edge state for creating connections
  const [draftEdge, setDraftEdge] = useState(null);
  const [sourceNodeId, setSourceNodeId] = useState(null);

  // Workflow generation state
  const [isGenerating, setIsGenerating] = useState(false);

  // Modal states
  const [showLiveTest, setShowLiveTest] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showIntelligenceHub, setShowIntelligenceHub] = useState(false);
  const [showDeploymentMenu, setShowDeploymentMenu] = useState(false);

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

  // Handle template selection
  const handleSelectTemplate = async (templateId) => {
    setShowTemplateLibrary(false);
    // Generate workflow from template
    const templatePrompts = {
      'pizza-delivery': 'Create a workflow for a pizza restaurant that takes a delivery order and processes the payment with Stripe',
      'support-routing': 'Build a customer support workflow that routes tickets based on urgency and assigns to appropriate team',
      'sales-qualification': 'Design a sales qualification workflow that scores leads and creates opportunities in Salesforce',
      'candidate-screening': 'Make a candidate screening workflow that asks interview questions and sends results to HR'
    };
    const prompt = templatePrompts[templateId] || templatePrompts['pizza-delivery'];
    await handleGenerateWorkflow(prompt);
  };

  return (
    <div className="app">
      {/* Header with controls */}
      <header className="app-header">
        <h1>CRMFlow - Visual Workflow Builder</h1>
        <div className="header-controls">
          <button className="header-btn" onClick={() => setShowTemplateLibrary(true)}>
            📚 Templates
          </button>
          <button className="header-btn" onClick={() => setShowIntelligenceHub(true)}>
            🧠 Intelligence Hub
          </button>
          <button className="header-btn" onClick={() => setShowLiveTest(true)}>
            🧪 Live Test
          </button>
          <button className="header-btn" onClick={() => setShowDeploymentMenu(true)}>
            🚀 Deploy
          </button>
          <button
            className={`run-button ${isRunning ? 'running' : ''}`}
            onClick={handleRunWorkflow}
          >
            {isRunning ? '⏸ Stop Workflow' : '▶ Run Workflow'}
          </button>
        </div>
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

      {/* Modals */}
      {showLiveTest && <LiveTestMode onClose={() => setShowLiveTest(false)} />}
      {showTemplateLibrary && (
        <TemplateLibrary
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateLibrary(false)}
        />
      )}
      {showIntelligenceHub && <IntelligenceHub onClose={() => setShowIntelligenceHub(false)} />}
      {showDeploymentMenu && <DeploymentMenu onClose={() => setShowDeploymentMenu(false)} />}
    </div>
  );
}

export default App;
