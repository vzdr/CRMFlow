import React from 'react';
import './Edge.css';

const Edge = ({ sourceNode, targetNode }) => {
  if (!sourceNode || !targetNode) return null;

  // Calculate handle positions
  const sourceX = sourceNode.position.x + 170 + 6; // node width + handle offset
  const sourceY = sourceNode.position.y + 42; // node height / 2 (approximate center)
  const targetX = targetNode.position.x - 6;
  const targetY = targetNode.position.y + 42;

  // Create a smooth curved path using cubic bezier
  const midX = (sourceX + targetX) / 2;
  const path = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`;

  return (
    <g className="edge">
      <path
        d={path}
        fill="none"
        stroke="#4a9eff"
        strokeWidth="2"
        className="edge-path"
      />
      {/* Arrowhead */}
      <circle
        cx={targetX}
        cy={targetY}
        r="4"
        fill="#4a9eff"
        className="edge-arrow"
      />
    </g>
  );
};

export default Edge;
