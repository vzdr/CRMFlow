import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useFlowStore from '../hooks/useFlowStore';
import useAutoSave from '../hooks/useAutoSave';
import Canvas from '../layouts/Canvas';
import WorkflowGenerator from '../components/WorkflowGenerator';
import LiveTestMode from '../components/LiveTestMode';
import TemplateLibrary from '../components/TemplateLibrary';
import IntelligenceHub from '../components/IntelligenceHub';
import DeploymentMenu from '../components/DeploymentMenu';
import Settings from '../components/Settings';
import { workflowApiService } from '../services/workflowApiService';
import { aiApiService } from '../services/aiApiService';
import '../App.css';

function EditorPage() {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const {
    nodes,
    edges,
    addEdge,
    startWorkflow,
    stopWorkflow,
    isRunning,
    setWorkflow,
    activeNodeId,
    completedNodeIds,
    selectedNodeIds,
    copyNodes,
    pasteNodes,
    deleteSelectedNodes,
    clearSelection
  } = useFlowStore();

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');

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

  // Load workflow from backend on mount
  useEffect(() => {
    loadWorkflow();
  }, [workflowId]);

  // Auto-save on workflow changes using custom hook (1-second debounce)
  useAutoSave(saveWorkflow, [nodes, edges, workflowName], 1000, !isLoading && nodes.length > 0);

  // Keyboard shortcuts for copy/paste/delete
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl+C or Cmd+C: Copy selected nodes
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copyNodes();
        if (selectedNodeIds.length > 0) {
          toast.success(`Copied ${selectedNodeIds.length} node(s)`);
        }
      }

      // Ctrl+V or Cmd+V: Paste nodes
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        pasteNodes();
      }

      // Delete or Backspace: Delete selected nodes
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedNodeIds.length > 0) {
          deleteSelectedNodes();
          toast.success(`Deleted ${selectedNodeIds.length} node(s)`);
        }
      }

      // Escape: Clear selection
      if (e.key === 'Escape') {
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeIds, copyNodes, pasteNodes, deleteSelectedNodes, clearSelection]);

  const loadWorkflow = async () => {
    try {
      setIsLoading(true);
      const workflow = await workflowApiService.getWorkflow(workflowId);

      // Convert backend node format to frontend format
      const frontendNodes = workflow.nodes.map(node => ({
        id: node.id,
        label: node.label,
        type: node.type,
        position: { x: node.positionX, y: node.positionY },
        data: node.data || {}
      }));

      const frontendEdges = workflow.edges.map(edge => ({
        id: edge.id,
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId
      }));

      setWorkflow(frontendNodes, frontendEdges);
      setWorkflowName(workflow.name);
    } catch (error) {
      toast.error('Failed to load workflow');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveWorkflow = async () => {
    try {
      // Convert frontend format to backend format
      const backendNodes = nodes.map(node => ({
        id: node.id,
        label: node.label,
        type: node.type,
        position: node.position,
        data: node.data || {}
      }));

      const backendEdges = edges.map(edge => ({
        id: edge.id,
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId
      }));

      await workflowApiService.updateWorkflow(workflowId, {
        name: workflowName,
        nodes: backendNodes,
        edges: backendEdges
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't show error toast for auto-save failures to avoid spam
    }
  };

  const handleUpdateWorkflowName = async (newName) => {
    setWorkflowName(newName);
    try {
      await workflowApiService.updateWorkflow(workflowId, { name: newName });
      toast.success('Workflow name updated');
    } catch (error) {
      toast.error('Failed to update name');
    }
  };

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
      // Start in AUTO mode - auto-advances through all nodes
      startWorkflow('auto');
    }
  };

  // Handle workflow generation from prompt (now uses backend API)
  const handleGenerateWorkflow = async (prompt) => {
    setIsGenerating(true);
    try {
      const { nodes: generatedNodes, edges: generatedEdges } = await aiApiService.generateWorkflow(prompt);
      setWorkflow(generatedNodes, generatedEdges);
      toast.success('Workflow generated!');
    } catch (error) {
      console.error('Failed to generate workflow:', error);
      if (error.message.includes('API key') || error.message.includes('not configured')) {
        toast.error('Please configure your Gemini API key in Settings first.');
        navigate('/settings');
      } else {
        toast.error(`Failed to generate workflow: ${error.message}`);
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

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header with controls */}
      <header className="app-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/dashboard')} title="Back to Dashboard">
            ← Back
          </button>
          <input
            type="text"
            className="workflow-name-input"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            onBlur={(e) => handleUpdateWorkflowName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.target.blur();
              }
            }}
          />
        </div>
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
          <button className="header-btn" onClick={() => navigate('/settings')}>
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

      {/* Workflow Execution Status Bar */}
      {isRunning && nodes.length > 0 && (
        <div className="workflow-status-bar">
          <div className="status-content">
            <span className="status-icon">▶</span>
            <span className="status-text">
              Running: Step {completedNodeIds.length + 1} of {nodes.length}
            </span>
            {activeNodeId && (
              <span className="active-node-label">
                {nodes.find(n => n.id === activeNodeId)?.label || ''}
              </span>
            )}
          </div>
          <div className="status-progress">
            <div
              className="status-progress-bar"
              style={{ width: `${((completedNodeIds.length + 1) / nodes.length) * 100}%` }}
            />
          </div>
        </div>
      )}
      {!isRunning && completedNodeIds.length > 0 && completedNodeIds.length === nodes.length && (
        <div className="workflow-status-bar complete">
          <div className="status-content">
            <span className="status-icon">✓</span>
            <span className="status-text">Workflow Complete!</span>
            <span className="active-node-label">
              All {nodes.length} steps executed successfully
            </span>
          </div>
        </div>
      )}

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

export default EditorPage;
