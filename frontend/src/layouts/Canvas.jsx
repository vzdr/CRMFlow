import React, { useRef, useState } from 'react';
import useFlowStore from '../hooks/useFlowStore';
import CanvasNode from '../components/CanvasNode';
import AIListenNode from '../components/AIListenNode';
import Edge from '../components/Edge';
import './Canvas.css';

const Canvas = ({
  onOutputHandleMouseDown,
  onInputHandleMouseUp,
  onCanvasMouseMove,
  onCanvasMouseUp,
  draftEdge
}) => {
  const canvasRef = useRef(null);
  const { nodes, edges, updateNodePosition } = useFlowStore();
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleNodeDragStart = (nodeId, e) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setDraggingNode(nodeId);
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    });
  };

  const handleCanvasMouseMove = (e) => {
    // Call parent handler for draft edge
    onCanvasMouseMove && onCanvasMouseMove(e);

    // Handle node dragging
    if (draggingNode) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };
      updateNodePosition(draggingNode, newPosition);
    }
  };

  const handleCanvasMouseUp = (e) => {
    // Call parent handler for draft edge
    onCanvasMouseUp && onCanvasMouseUp(e);

    // End node dragging
    setDraggingNode(null);
  };

  return (
    <div
      ref={canvasRef}
      className="canvas"
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
    >
      {/* SVG layer for edges */}
      <svg className="edges-layer">
        {/* Render existing edges */}
        {edges.map((edge) => {
          const sourceNode = nodes.find(n => n.id === edge.sourceNodeId);
          const targetNode = nodes.find(n => n.id === edge.targetNodeId);
          return (
            <Edge
              key={edge.id}
              sourceNode={sourceNode}
              targetNode={targetNode}
            />
          );
        })}

        {/* Render draft edge if active */}
        {draftEdge && (
          <line
            x1={draftEdge.startPosition.x}
            y1={draftEdge.startPosition.y}
            x2={draftEdge.endPosition.x}
            y2={draftEdge.endPosition.y}
            stroke="#4a9eff"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="draft-edge"
          />
        )}
      </svg>

      {/* Nodes layer */}
      <div className="nodes-layer">
        {nodes.map((node) => {
          // Render specialized node for AI interactions
          if (node.label === 'Listen for Intent') {
            return (
              <AIListenNode
                key={node.id}
                node={node}
                onDragStart={handleNodeDragStart}
                onOutputHandleMouseDown={onOutputHandleMouseDown}
                onInputHandleMouseUp={onInputHandleMouseUp}
              />
            );
          }

          // Render standard node for all others
          return (
            <CanvasNode
              key={node.id}
              node={node}
              onDragStart={handleNodeDragStart}
              onOutputHandleMouseDown={onOutputHandleMouseDown}
              onInputHandleMouseUp={onInputHandleMouseUp}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Canvas;
