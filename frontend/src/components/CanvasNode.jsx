import React, { useRef, useEffect } from 'react';
import useFlowStore from '../hooks/useFlowStore';
import './CanvasNode.css';

const CanvasNode = ({
  node,
  onDragStart,
  onDrag,
  onDragEnd,
  onOutputHandleMouseDown,
  onInputHandleMouseUp
}) => {
  const nodeRef = useRef(null);
  const { activeNodeId, completedNodeIds } = useFlowStore();
  const isActive = activeNodeId === node.id;
  const isCompleted = completedNodeIds.includes(node.id);

  // Determine node state class
  let stateClass = 'pending';
  if (isActive) {
    stateClass = 'active';
  } else if (isCompleted) {
    stateClass = 'completed';
  }

  const handleMouseDown = (e) => {
    // Only start drag if clicking on the node body, not handles
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

  return (
    <div
      ref={nodeRef}
      className={`canvas-node ${stateClass}`}
      style={{
        left: node.position.x,
        top: node.position.y
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Input Handle (left side) */}
      <div
        className="node-handle input-handle"
        data-handle-type="input"
        data-node-id={node.id}
        onMouseUp={handleInputMouseUp}
      />

      {/* Node Content */}
      <div className="node-content">
        <div className="node-label">{node.label}</div>
      </div>

      {/* Output Handle (right side) */}
      <div
        className="node-handle output-handle"
        data-handle-type="output"
        data-node-id={node.id}
        onMouseDown={handleOutputMouseDown}
      />
    </div>
  );
};

export default CanvasNode;
