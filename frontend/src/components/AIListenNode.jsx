import React, { useEffect, useState, useRef } from 'react';
import useFlowStore from '../hooks/useFlowStore';
import useVoiceProcessor from '../hooks/useVoiceProcessor';
import socketService from '../services/socketService';
import './CanvasNode.css';
import './AIListenNode.css';

const AIListenNode = ({
  node,
  onDragStart,
  onOutputHandleMouseDown,
  onInputHandleMouseUp
}) => {
  const nodeRef = useRef(null);
  const { activeNodeId, advanceWorkflow } = useFlowStore();
  const { isListening, isSpeaking, transcript, startListening, stopListening, speak } = useVoiceProcessor();
  const [status, setStatus] = useState('idle');
  const [aiResponse, setAiResponse] = useState('');
  const isActive = activeNodeId === node.id;
  const hasExecutedRef = useRef(false);

  // Execute node logic when it becomes active
  useEffect(() => {
    if (isActive && !hasExecutedRef.current) {
      hasExecutedRef.current = true;
      executeNode();
    } else if (!isActive) {
      hasExecutedRef.current = false;
      setStatus('idle');
      setAiResponse('');
    }
  }, [isActive]);

  const executeNode = async () => {
    try {
      setStatus('listening');

      // Start listening to user
      startListening(
        (interim, final) => {
          // Update transcript in real-time
          console.log('Interim:', interim);
        },
        async (finalTranscript) => {
          // User stopped speaking
          console.log('Final transcript:', finalTranscript);

          if (!finalTranscript) {
            // No speech detected, advance anyway
            advanceWorkflow(node.id);
            return;
          }

          setStatus('processing');

          // Try to connect to backend and send transcript
          try {
            if (!socketService.isConnected()) {
              await socketService.connect();
            }

            // Listen for AI responses
            let fullResponse = '';
            const unsubscribe = socketService.onMessage((data) => {
              if (data.type === 'audio_chunk' || data.type === 'text_chunk') {
                fullResponse += data.content || '';
                setAiResponse(fullResponse);
              } else if (data.type === 'end_of_stream') {
                // AI finished responding
                unsubscribe();
                handleAIResponse(fullResponse);
              }
            });

            // Send transcript to backend
            socketService.sendMessage({
              type: 'transcript',
              content: finalTranscript
            });

          } catch (error) {
            console.error('WebSocket connection failed, using fallback:', error);
            // Fallback: simulate AI response
            await simulateAIResponse(finalTranscript);
          }
        }
      );

      // Auto-stop listening after 10 seconds
      setTimeout(() => {
        if (isListening) {
          stopListening();
        }
      }, 10000);

    } catch (error) {
      console.error('Error executing AI node:', error);
      setStatus('error');
      // Advance to next node even on error
      setTimeout(() => advanceWorkflow(node.id), 2000);
    }
  };

  const handleAIResponse = async (response) => {
    setStatus('speaking');

    try {
      // Speak the AI response
      await speak(response);
    } catch (error) {
      console.error('Error speaking response:', error);
    }

    setStatus('complete');

    // Advance to next node
    setTimeout(() => {
      advanceWorkflow(node.id);
    }, 1000);
  };

  const simulateAIResponse = async (userText) => {
    // Simulate AI response for demo purposes
    const demoResponse = `I heard you say: "${userText}". How can I help you further?`;
    setAiResponse(demoResponse);
    await handleAIResponse(demoResponse);
  };

  const handleMouseDown = (e) => {
    if (e.target.dataset.handleType) return;
    onDragStart && onDragStart(node.id, e);
  };

  const handleOutputMouseDown = (e) => {
    e.stopPropagation();
    onOutputHandleMouseDown && onOutputHandleMouseDown(node.id, e);
  };

  const handleInputMouseUp = (e) => {
    e.stopPropagation();
    onInputHandleMouseUp && onInputHandleMouseUp(node.id, e);
  };

  const getStatusIndicator = () => {
    switch (status) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'speaking':
        return 'Speaking...';
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return '';
    }
  };

  return (
    <div
      ref={nodeRef}
      className={`canvas-node ai-listen-node ${isActive ? 'active' : ''} ${status}`}
      style={{
        left: node.position.x,
        top: node.position.y
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Input Handle */}
      <div
        className="node-handle input-handle"
        data-handle-type="input"
        data-node-id={node.id}
        onMouseUp={handleInputMouseUp}
      />

      {/* Node Content */}
      <div className="node-content">
        <div className="node-label">{node.label}</div>
        {isActive && (
          <div className="node-status">
            {getStatusIndicator()}
          </div>
        )}
        {aiResponse && (
          <div className="ai-response">
            {aiResponse.substring(0, 50)}...
          </div>
        )}
      </div>

      {/* Output Handle */}
      <div
        className="node-handle output-handle"
        data-handle-type="output"
        data-node-id={node.id}
        onMouseDown={handleOutputMouseDown}
      />
    </div>
  );
};

export default AIListenNode;
