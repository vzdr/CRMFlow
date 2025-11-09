import React, { useState, useEffect, useRef } from 'react';
import useFlowStore from '../hooks/useFlowStore';
import { callGemini } from '../services/geminiService';
import './LiveTestMode.css';

const LiveTestMode = ({ onClose }) => {
  const { nodes, edges, activeNodeId, startWorkflow, stopWorkflow, isRunning, advanceWorkflow, completedNodeIds } = useFlowStore();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Welcome message
    setMessages([{
      id: 'welcome',
      type: 'system',
      content: 'Live Test Mode - Click "Start Test" to begin workflow execution',
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // When workflow starts or advances, handle the active node
  useEffect(() => {
    if (activeNodeId && isRunning && nodes.length > 0) {
      handleActiveNode();
    }
  }, [activeNodeId, isRunning]);

  const addMessage = (type, content) => {
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date()
    }]);
  };

  const handleStartTest = () => {
    if (nodes.length === 0) {
      alert('Please load a workflow first (use Templates or Generate from Prompt)');
      return;
    }

    setMessages([{
      id: 'start',
      type: 'system',
      content: `Starting workflow execution... (${nodes.length} nodes)`,
      timestamp: new Date()
    }]);

    // Start in MANUAL mode - no auto-advance, wait for user input
    startWorkflow('manual');
  };

  const handleStopTest = () => {
    stopWorkflow();
    addMessage('system', 'Workflow stopped');
    setIsProcessing(false);
  };

  const handleActiveNode = async () => {
    if (isProcessing) return; // Prevent duplicate processing

    const activeNode = nodes.find(n => n.id === activeNodeId);
    if (!activeNode) return;

    setIsProcessing(true);

    try {
      await executeNode(activeNode);
    } catch (error) {
      console.error('Node execution error:', error);
      addMessage('system', `Error executing ${activeNode.label}: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeNode = async (node) => {
    console.log('Executing node:', node);

    // Add system message showing which node is executing
    addMessage('system', `[${node.type.toUpperCase()}] ${node.label}`);

    switch (node.type) {
      case 'trigger':
        // Trigger nodes just start the workflow
        await delay(500);
        addMessage('system', 'Workflow triggered');
        advanceWorkflow(node.id);
        break;

      case 'speak':
        // AI speaks to the user
        await delay(800);
        try {
          const response = await callGemini(
            `Say this to the user in a natural, conversational way: "${node.label}"`,
            {
              systemPrompt: 'You are speaking to a user. Be friendly and natural. Keep it brief (1-2 sentences).',
              maxTokens: 150
            }
          );
          addMessage('ai', response);
        } catch (error) {
          // Fallback if Gemini fails
          addMessage('ai', node.label);
        }
        advanceWorkflow(node.id);
        break;

      case 'listen':
        // Wait for user input - don't auto-advance
        addMessage('system', 'Waiting for your input...');
        // Don't call advanceWorkflow - wait for user to type
        break;

      case 'ai':
        // AI processing - wait for user input or use context
        addMessage('system', 'AI is ready to respond. Type your message...');
        // Don't auto-advance
        break;

      case 'logic':
        // Perform logic operation
        await delay(1000);
        addMessage('system', `Processing: ${node.label}...`);
        addMessage('system', `✓ ${node.label} completed`);
        advanceWorkflow(node.id);
        break;

      case 'condition':
        // Evaluate condition (simplified - take first edge)
        await delay(800);
        addMessage('system', `Evaluating: ${node.label}...`);
        const conditionResult = Math.random() > 0.5 ? 'true' : 'false';
        addMessage('system', `Condition result: ${conditionResult}`);
        advanceWorkflow(node.id);
        break;

      case 'integration':
        // Simulate API call
        await delay(1200);
        addMessage('system', `Calling API: ${node.label}...`);
        addMessage('system', `✓ ${node.label} completed successfully`);
        advanceWorkflow(node.id);
        break;

      default:
        // Unknown node type
        await delay(500);
        addMessage('system', `Executed: ${node.label}`);
        advanceWorkflow(node.id);
        break;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !isRunning) return;

    const userMessage = inputValue.trim();
    addMessage('user', userMessage);
    setInputValue('');
    setIsProcessing(true);

    try {
      // Get active node
      const activeNode = nodes.find(n => n.id === activeNodeId);
      if (!activeNode) {
        addMessage('system', 'No active node to process input');
        setIsProcessing(false);
        return;
      }

      if (activeNode.type === 'listen' || activeNode.type === 'ai') {
        // Process user input with Gemini
        addMessage('system', 'Processing your input with AI...');

        try {
          // Build context from conversation
          const conversationContext = messages
            .filter(m => m.type === 'user' || m.type === 'ai')
            .slice(-5) // Last 5 messages
            .map(m => `${m.type === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
            .join('\n');

          const systemPrompt = `You are helping process this step in a workflow: "${activeNode.label}"

Previous conversation:
${conversationContext}

Respond naturally and helpfully to the user's message. Keep responses concise (2-3 sentences max).`;

          const aiResponse = await callGemini(userMessage, {
            systemPrompt,
            includeKnowledge: true,
            includePersonality: true,
            maxTokens: 300
          });

          addMessage('ai', aiResponse);

          // Auto-advance after AI processes
          await delay(1000);
          advanceWorkflow(activeNode.id);
        } catch (error) {
          addMessage('system', `AI error: ${error.message}`);
          // Still advance even on error
          advanceWorkflow(activeNode.id);
        }
      } else {
        // Not a listen/ai node, just acknowledge
        addMessage('system', 'Input received');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const getNodeStatusColor = (nodeId) => {
    if (nodeId === activeNodeId && isRunning) {
      return '#00ff00'; // Green for active
    } else if (completedNodeIds.includes(nodeId)) {
      return '#4a9eff'; // Blue for completed
    }
    return '#444'; // Gray for pending
  };

  return (
    <div className="live-test-mode">
      <div className="test-split-container">
        {/* Left Side - Mini Canvas */}
        <div className="test-canvas-side">
          <div className="test-canvas-header">
            <h3>Workflow Progress</h3>
            <div className="test-controls">
              {!isRunning ? (
                <button className="test-start-btn" onClick={handleStartTest}>
                  Start Test
                </button>
              ) : (
                <button className="test-stop-btn" onClick={handleStopTest}>
                  Stop Test
                </button>
              )}
              <button className="test-close-btn" onClick={onClose}>
                Close
              </button>
            </div>
          </div>

          {/* Mini Canvas View */}
          <div className="test-canvas-view">
            <svg className="mini-canvas-svg" width="100%" height="100%">
              {/* Render edges */}
              {edges.map((edge) => {
                const sourceNode = nodes.find(n => n.id === edge.sourceNodeId);
                const targetNode = nodes.find(n => n.id === edge.targetNodeId);

                if (!sourceNode || !targetNode) return null;

                const scale = 0.5; // Scale down for mini view
                const sourceX = sourceNode.position.x * scale + 85;
                const sourceY = sourceNode.position.y * scale + 35;
                const targetX = targetNode.position.x * scale + 85;
                const targetY = targetNode.position.y * scale + 35;

                return (
                  <line
                    key={edge.id}
                    x1={sourceX}
                    y1={sourceY}
                    x2={targetX}
                    y2={targetY}
                    stroke={getNodeStatusColor(edge.sourceNodeId)}
                    strokeWidth="2"
                  />
                );
              })}
            </svg>

            {/* Render nodes */}
            {nodes.map((node) => {
              const scale = 0.5;
              const color = getNodeStatusColor(node.id);
              const isActive = node.id === activeNodeId && isRunning;

              return (
                <div
                  key={node.id}
                  className="mini-node"
                  style={{
                    left: node.position.x * scale,
                    top: node.position.y * scale,
                    borderColor: color,
                    backgroundColor: isActive ? 'rgba(0, 255, 0, 0.1)' : 'transparent',
                    boxShadow: isActive ? '0 0 10px rgba(0, 255, 0, 0.5)' : 'none'
                  }}
                >
                  <div className="mini-node-label">{node.label}</div>
                  {isActive && <div className="mini-active-indicator">●</div>}
                </div>
              );
            })}
          </div>

          {/* Workflow Status */}
          <div className="test-workflow-status">
            {isRunning && (
              <div className="status-running">
                <span className="status-dot"></span>
                Running: Step {completedNodeIds.length + 1} of {nodes.length}
              </div>
            )}
            {!isRunning && completedNodeIds.length > 0 && (
              <div className="status-complete">
                ✓ Complete: {completedNodeIds.length} steps executed
              </div>
            )}
            {!isRunning && completedNodeIds.length === 0 && (
              <div className="status-idle">
                Ready to test
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chat Interface */}
        <div className="test-chat-side">
          <div className="test-chat-header">
            <h3>Test Conversation</h3>
            {isProcessing && (
              <span className="processing-indicator">Processing...</span>
            )}
          </div>

          <div className="test-chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`test-message test-message-${message.type}`}
              >
                <div className="message-content">{message.content}</div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="test-chat-input">
            <input
              type="text"
              placeholder={isRunning ? "Type your message..." : "Start the test first..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isRunning || isProcessing}
            />
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!isRunning || !inputValue.trim() || isProcessing}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTestMode;
