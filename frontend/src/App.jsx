import { useState } from 'react';
import useFlowStore from './hooks/useFlowStore';
import Canvas from './layouts/Canvas';
import WorkflowGenerator from './components/WorkflowGenerator';
import LiveTestMode from './components/LiveTestMode';
import TemplateLibrary from './components/TemplateLibrary';
import IntelligenceHub from './components/IntelligenceHub';
import DeploymentMenu from './components/DeploymentMenu';
import Settings from './components/Settings';
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
  const [showSettings, setShowSettings] = useState(false);

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
      // Get API key from localStorage
      const saved = localStorage.getItem('crmflow_api_keys');
      const apiKey = saved ? JSON.parse(saved).openai : null;

      const { nodes, edges } = await generateWorkflow(prompt, apiKey);
      setWorkflow(nodes, edges);
      console.log('Generated workflow:', { nodes, edges });
    } catch (error) {
      console.error('Failed to generate workflow:', error);
      if (error.message.includes('API key')) {
        alert('Please set your OpenAI API key in Settings first.');
        setShowSettings(true);
      } else {
        alert('Failed to generate workflow. Please try again.');
      }
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
      'candidate-screening': 'Make a candidate screening workflow that asks interview questions and sends results to HR',
      'appointment-booking': 'Create an appointment booking workflow with calendar integration',
      'order-status': 'Build a workflow to check order status and provide shipping information',
      'feedback-collection': 'Create a customer feedback collection and analysis workflow',
      'lead-nurture': 'Design a multi-touch lead nurturing workflow with email sequences',
      'onboarding': 'Create a client onboarding workflow that collects required information',
      'refund-request': 'Build a refund processing workflow with verification and approval',
      'escalation': 'Create an issue escalation workflow to senior support staff',
      'interview-scheduler': 'Design an interview scheduling workflow that coordinates times'
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
            Templates
          </button>
          <button className="header-btn" onClick={() => setShowIntelligenceHub(true)}>
            Intelligence Hub
          </button>
          <button className="header-btn" onClick={() => setShowLiveTest(true)}>
            Live Test
          </button>
          <button className="header-btn" onClick={() => setShowDeploymentMenu(true)}>
            Deploy
          </button>
          <button className="header-btn" onClick={() => setShowSettings(true)}>
            Settings
          </button>
          <button
            className={`run-button ${isRunning ? 'running' : ''}`}
            onClick={handleRunWorkflow}
          >
            {isRunning ? 'Stop Workflow' : 'Run Workflow'}
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
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
