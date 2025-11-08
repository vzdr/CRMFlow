import React, { useState, useEffect, useRef } from 'react';
import useFlowStore from '../hooks/useFlowStore';
import useVoiceProcessor from '../hooks/useVoiceProcessor';
import './LiveTestMode.css';

const LiveTestMode = ({ onClose }) => {
  const { nodes, edges, activeNodeId, startWorkflow, stopWorkflow, isRunning } = useFlowStore();
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
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addMessage('user', userMessage);
    setInputValue('');

    // Simulate AI response (in real implementation, this would go through the workflow)
    setTimeout(() => {
      addMessage('ai', `I received your message: "${userMessage}". Processing through workflow...`);
    }, 500);
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
        (finalTranscript) => {
          if (finalTranscript) {
            addMessage('user', `🎤 ${finalTranscript}`);
            // Process through workflow
            setTimeout(() => {
              addMessage('ai', 'Processing your voice input...');
            }, 500);
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
            <h3>📊 Workflow Canvas</h3>
            <div className="test-controls">
              {!isTestRunning ? (
                <button className="test-start-btn" onClick={handleStartTest}>
                  ▶ Start Test
                </button>
              ) : (
                <button className="test-stop-btn" onClick={handleStopTest}>
                  ⏸ Stop Test
                </button>
              )}
              <button className="test-close-btn" onClick={onClose}>
                ✕ Close Test Mode
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
                    <div className="active-indicator">●</div>
                  )}
                </div>
              ))}

              {/* Render edges */}
              <svg className="mini-edges">
                {edges.map(edge => {
                  const source = nodes.find(n => n.id === edge.sourceNodeId);
                  const target = nodes.find(n => n.id === edge.targetNodeId);
                  if (!source || !target) return null;

                  const x1 = (source.position.x + 90) / 2;
                  const y1 = (source.position.y + 30) / 2;
                  const x2 = (target.position.x) / 2;
                  const y2 = (target.position.y + 30) / 2;

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
            <h3>💬 Test Interface</h3>
            <div className="test-status">
              {isTestRunning && <span className="status-running">● Testing</span>}
              {isListening && <span className="status-listening">🎤 Listening</span>}
              {isSpeaking && <span className="status-speaking">🔊 Speaking</span>}
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
              {isListening ? '⏹' : '🎤'}
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
