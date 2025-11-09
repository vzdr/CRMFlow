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
  const { nodes, edges, updateNodePosition, toggleNodeSelection, clearSelection, selectedNodeIds, zoomLevel, panOffset, setPanOffset } = useFlowStore();
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

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
    // Handle panning
    if (isPanning) {
      const newOffset = {
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      };
      setPanOffset(newOffset);
      return;
    }

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

    // Update selection box if active
    if (selectionBox) {
      const canvasBounds = canvasRef.current.getBoundingClientRect();
      setSelectionBox({
        ...selectionBox,
        endX: e.clientX - canvasBounds.left,
        endY: e.clientY - canvasBounds.top
      });
    }
  };

  const handleCanvasMouseDown = (e) => {
    // Middle mouse button or Space+Left mouse = pan
    if (e.button === 1 || (e.button === 0 && e.spaceKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    // Only start selection if clicking directly on canvas (not on nodes or handles)
    if (e.target.className === 'canvas' || e.target.tagName === 'svg' || e.target.className === 'nodes-layer') {
      // Start selection box
      const canvasBounds = canvasRef.current.getBoundingClientRect();
      setSelectionBox({
        startX: e.clientX - canvasBounds.left,
        startY: e.clientY - canvasBounds.top,
        endX: e.clientX - canvasBounds.left,
        endY: e.clientY - canvasBounds.top
      });

      // Clear existing selection if not holding shift
      if (!e.shiftKey) {
        clearSelection();
      }
    }
  };

  const handleCanvasMouseUp = (e) => {
    // End panning
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    // Call parent handler for draft edge
    onCanvasMouseUp && onCanvasMouseUp(e);

    // End node dragging
    setDraggingNode(null);

    // Complete selection if active
    if (selectionBox) {
      const { startX, startY, endX, endY } = selectionBox;

      // Calculate selection rectangle
      const left = Math.min(startX, endX);
      const top = Math.min(startY, endY);
      const right = Math.max(startX, endX);
      const bottom = Math.max(startY, endY);

      // Only select if box is large enough (prevent accidental selections)
      if (Math.abs(right - left) > 5 && Math.abs(bottom - top) > 5) {
        // Find nodes within selection
        nodes.forEach(node => {
          const nodeLeft = node.position.x;
          const nodeTop = node.position.y;
          const nodeRight = nodeLeft + 200; // Approximate node width
          const nodeBottom = nodeTop + 70; // Approximate node height

          // Check if node overlaps with selection box
          const overlaps = !(nodeRight < left || nodeLeft > right || nodeBottom < top || nodeTop > bottom);

          if (overlaps && !selectedNodeIds.includes(node.id)) {
            toggleNodeSelection(node.id, true); // Add to selection
          }
        });
      }

      setSelectionBox(null);
    }
  };

  return (
    <div
      ref={canvasRef}
      className={`canvas ${isPanning ? 'panning' : ''}`}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onContextMenu={(e) => e.preventDefault()} // Prevent context menu on right click
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
      <div
        className="nodes-layer"
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: '0 0'
        }}
      >
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

      {/* Selection Box */}
      {selectionBox && (() => {
        const { startX, startY, endX, endY } = selectionBox;
        const left = Math.min(startX, endX);
        const top = Math.min(startY, endY);
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

        return (
          <div
            className="selection-box"
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: `${width}px`,
              height: `${height}px`
            }}
          />
        );
      })()}
    </div>
  );
};

export default Canvas;
