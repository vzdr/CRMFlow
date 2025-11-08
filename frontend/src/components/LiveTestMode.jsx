import React, { useState, useEffect, useRef } from 'react';
import useFlowStore from '../hooks/useFlowStore';
import useVoiceProcessor from '../hooks/useVoiceProcessor';
import './LiveTestMode.css';

const LiveTestMode = ({ onClose }) => {
  const { nodes, edges, activeNodeId, startWorkflow, stopWorkflow, isRunning, advanceWorkflow } = useFlowStore();
  const { startListening, stopListening, speak, isListening, isSpeaking } = useVoiceProcessor();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: 'welcome',
      type: 'system',
      content: 'Live Test Mode activated! Click "Start Test" to begin.',
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Track active node changes
    if (activeNodeId && isTestRunning) {
      const activeNode = nodes.find(n => n.id === activeNodeId);
      if (activeNode) {
        addMessage('system', `Executing: ${activeNode.label}`);
      }
    }
  }, [activeNodeId, isTestRunning, nodes]);

  const addMessage = (type, content) => {
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date()
    }]);
  };

  const handleStartTest = () => {
    setIsTestRunning(true);
    startWorkflow();
    addMessage('system', 'Test started! Workflow is now running.');
  };

  const handleStopTest = () => {
    setIsTestRunning(false);
    stopWorkflow();
    stopListening();
    addMessage('system', 'Test stopped.');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !isTestRunning) return;

    const userMessage = inputValue.trim();
    addMessage('user', userMessage);
    setInputValue('');

    // Process through active node
    await processUserInput(userMessage);
  };

  const processUserInput = async (userInput) => {
    if (!activeNodeId) return;

    const activeNode = nodes.find(n => n.id === activeNodeId);
    if (!activeNode) return;

    // Get API keys from localStorage
    const saved = localStorage.getItem('crmflow_api_keys');
    const apiKeys = saved ? JSON.parse(saved) : {};

    // Process based on node type
    switch (activeNode.type) {
      case 'listen':
        // Listen node - process user input with AI
        addMessage('system', `Captured input: "${userInput}"`);
        if (apiKeys.gemini) {
          try {
            const response = await callGemini(userInput, apiKeys.gemini);
            addMessage('ai', response);
          } catch (error) {
            addMessage('system', `AI processing failed: ${error.message}`);
          }
        }
        // Auto-advance after processing
        setTimeout(() => advanceWorkflow(activeNodeId), 1000);
        break;

      case 'speak':
        // Speak node - output predefined message
        addMessage('ai', activeNode.label);
        setTimeout(() => advanceWorkflow(activeNodeId), 1000);
        break;

      case 'ai':
        // AI processing node
        if (apiKeys.gemini) {
          addMessage('system', 'Processing with AI...');
          try {
            const response = await callGemini(userInput, apiKeys.gemini, 'You are a helpful assistant processing workflow data.');
            addMessage('ai', response);
          } catch (error) {
            addMessage('system', `AI error: ${error.message}`);
          }
        } else {
          addMessage('system', 'AI node requires Gemini API key');
        }
        setTimeout(() => advanceWorkflow(activeNodeId), 1500);
        break;

      case 'logic':
      case 'integration':
      case 'condition':
        // Logic/Integration nodes - simulate processing
        addMessage('system', `Executing: ${activeNode.label}`);
        setTimeout(() => advanceWorkflow(activeNodeId), 800);
        break;

      case 'trigger':
        // Trigger node - just advance
        setTimeout(() => advanceWorkflow(activeNodeId), 500);
        break;

      default:
        addMessage('system', `Node type '${activeNode.type}' processed`);
        setTimeout(() => advanceWorkflow(activeNodeId), 1000);
        break;
    }
  };

  const callGemini = async (message, apiKey, systemPrompt = 'You are a helpful AI assistant in a workflow system.') => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser: ${message}\n\nRespond naturally and concisely (max 150 words):`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API call failed');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      addMessage('system', 'Listening... Speak now.');
      startListening(
        (interim, final) => {
          // Real-time transcript
        },
        async (finalTranscript) => {
          if (finalTranscript) {
            addMessage('user', finalTranscript);
            // Process through workflow
            await processUserInput(finalTranscript);
          }
        }
      );
    }
  };

  const getNodeStatusColor = (nodeId) => {
    if (nodeId === activeNodeId && isTestRunning) {
      return '#4aff6b'; // Green for active
    }
    return null;
  };

  return (
    <div className="live-test-mode">
      {/* Split Screen Layout */}
      <div className="test-split-container">

        {/* Left Side - Canvas View */}
        <div className="test-canvas-side">
          <div className="test-canvas-header">
            <h3>Workflow Canvas</h3>
            <div className="test-controls">
              {!isTestRunning ? (
                <button className="test-start-btn" onClick={handleStartTest}>
                  Start Test
                </button>
              ) : (
                <button className="test-stop-btn" onClick={handleStopTest}>
                  Stop Test
                </button>
              )}
              <button className="test-close-btn" onClick={onClose}>
                Close Test Mode
              </button>
            </div>
          </div>

          <div className="test-canvas-view">
            <div className="mini-canvas">
              {/* Render nodes in miniature */}
              {nodes.map(node => (
                <div
                  key={node.id}
                  className={`mini-node ${node.id === activeNodeId && isTestRunning ? 'active-test-node' : ''}`}
                  style={{
                    left: node.position.x / 2,
                    top: node.position.y / 2,
                    borderColor: getNodeStatusColor(node.id) || '#444'
                  }}
                >
                  <div className="mini-node-label">{node.label}</div>
                  {node.id === activeNodeId && isTestRunning && (
                    <div className="active-indicator"></div>
                  )}
                </div>
              ))}

              {/* Render edges */}
              <svg className="mini-edges">
                {edges.map(edge => {
                  const source = nodes.find(n => n.id === edge.sourceNodeId);
                  const target = nodes.find(n => n.id === edge.targetNodeId);
                  if (!source || !target) return null;

                  const x1 = (source.position.x + 85) / 2;
                  const y1 = (source.position.y + 35) / 2;
                  const x2 = (target.position.x) / 2;
                  const y2 = (target.position.y + 35) / 2;

                  return (
                    <line
                      key={edge.id}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#4a9eff"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Right Side - Chat Interface */}
        <div className="test-chat-side">
          <div className="test-chat-header">
            <h3>Test Interface</h3>
            <div className="test-status">
              {isTestRunning && <span className="status-running">Testing</span>}
              {isListening && <span className="status-listening">Listening</span>}
              {isSpeaking && <span className="status-speaking">Speaking</span>}
            </div>
          </div>

          <div className="test-chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`test-message ${msg.type}`}>
                <div className="message-content">{msg.content}</div>
                <div className="message-time">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="test-chat-input">
            <input
              type="text"
              placeholder="Type a message to test..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={!isTestRunning}
            />
            <button
              className="voice-input-btn"
              onClick={handleVoiceInput}
              disabled={!isTestRunning}
            >
              {isListening ? 'Stop' : 'Voice'}
            </button>
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!isTestRunning || !inputValue.trim()}
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
