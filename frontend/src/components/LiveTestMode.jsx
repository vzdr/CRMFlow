import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import useFlowStore from '../hooks/useFlowStore';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import './LiveTestMode.css';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:3001';

const LiveTestMode = ({ onClose }) => {
  const { workflowId } = useParams();
  const { user } = useAuth();
  const { nodes, edges } = useFlowStore();

  // Local state for live test execution (separate from useFlowStore)
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [completedNodeIds, setCompletedNodeIds] = useState([]);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const currentAIMessageRef = useRef('');

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!workflowId || !user) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    // Socket event handlers
    socket.on('connect', () => {
      console.log('Socket.IO connected');
      addMessage('system', 'Connected to execution engine');
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      addMessage('system', 'Disconnected from execution engine');
      setIsRunning(false);
      setIsProcessing(false);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      addMessage('system', `Error: ${error.message || 'Unknown error'}`);
      setIsProcessing(false);
    });

    socket.on('session:started', (data) => {
      console.log('Session started:', data);
      setIsRunning(true);
      addMessage('system', `Workflow started (${data.nodeCount} nodes)`);
    });

    socket.on('node:execution_start', (data) => {
      console.log('Node execution start:', data);
      setActiveNodeId(data.nodeId);
      const node = nodes.find(n => n.id === data.nodeId);
      if (node) {
        addMessage('system', `[${node.type.toUpperCase()}] ${node.label}`);
      }
    });

    socket.on('node:execution_complete', (data) => {
      console.log('Node execution complete:', data);
      setCompletedNodeIds(prev => [...prev, data.nodeId]);
      setActiveNodeId(null);
    });

    socket.on('ai:processing_start', () => {
      console.log('AI processing start');
      setIsProcessing(true);
      currentAIMessageRef.current = '';
    });

    socket.on('ai:chunk', (data) => {
      // Streaming AI response
      currentAIMessageRef.current += data.chunk;

      // Update or create AI message
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.type === 'ai' && lastMessage.isStreaming) {
          // Update existing streaming message
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, content: currentAIMessageRef.current }
          ];
        } else {
          // Create new streaming message
          return [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              type: 'ai',
              content: currentAIMessageRef.current,
              isStreaming: true,
              timestamp: new Date()
            }
          ];
        }
      });
    });

    socket.on('ai:processing_end', () => {
      console.log('AI processing end');
      setIsProcessing(false);

      // Mark final AI message as complete
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.isStreaming) {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, isStreaming: false }
          ];
        }
        return prev;
      });

      currentAIMessageRef.current = '';
    });

    socket.on('ai:speech', (data) => {
      addMessage('ai', data.text);
    });

    socket.on('workflow:complete', (data) => {
      console.log('Workflow complete:', data);
      setIsRunning(false);
      setActiveNodeId(null);
      addMessage('system', `✓ Workflow complete! Executed ${data.executedNodes} nodes`);
      toast.success('Workflow completed successfully');
    });

    socket.on('workflow:stopped', () => {
      console.log('Workflow stopped');
      setIsRunning(false);
      setActiveNodeId(null);
      addMessage('system', 'Workflow stopped');
    });

    socket.on('workflow:awaiting_input', (data) => {
      console.log('Awaiting user input:', data);
      addMessage('system', 'Waiting for your input...');
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [workflowId, user, nodes]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      toast.error('Please load a workflow first');
      return;
    }

    if (!socketRef.current || !socketRef.current.connected) {
      toast.error('Not connected to execution engine');
      return;
    }

    setMessages([{
      id: 'start',
      type: 'system',
      content: `Starting workflow execution... (${nodes.length} nodes)`,
      timestamp: new Date()
    }]);

    setCompletedNodeIds([]);
    setActiveNodeId(null);

    // Start session on backend
    socketRef.current.emit('session:start', {
      workflowId,
      userId: user.id
    });
  };

  const handleStopTest = () => {
    if (socketRef.current) {
      socketRef.current.emit('session:stop');
    }
    setIsRunning(false);
    setIsProcessing(false);
    setActiveNodeId(null);
    addMessage('system', 'Workflow stopped');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !isRunning || !socketRef.current) return;

    const userMessage = inputValue.trim();
    addMessage('user', userMessage);
    setInputValue('');

    // Send message to backend via Socket.IO
    socketRef.current.emit('user:message', {
      message: userMessage
    });
  };

  const handleAdvanceWorkflow = () => {
    if (!socketRef.current || !activeNodeId) return;

    socketRef.current.emit('workflow:advance', {
      fromNodeId: activeNodeId
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
                <>
                  <button className="test-stop-btn" onClick={handleStopTest}>
                    Stop Test
                  </button>
                  {activeNodeId && (
                    <button className="test-advance-btn" onClick={handleAdvanceWorkflow}>
                      Advance →
                    </button>
                  )}
                </>
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
              <span className="processing-indicator">AI is typing...</span>
            )}
          </div>

          <div className="test-chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`test-message test-message-${message.type}`}
              >
                <div className="message-content">
                  {message.content}
                  {message.isStreaming && <span className="cursor-blink">▊</span>}
                </div>
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
