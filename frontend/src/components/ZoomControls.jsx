import React from 'react';
import useFlowStore from '../hooks/useFlowStore';
import './ZoomControls.css';

const ZoomControls = () => {
  const { zoomLevel, zoomIn, zoomOut, resetZoom } = useFlowStore();

  const zoomPercentage = Math.round(zoomLevel * 100);

  return (
    <div className="zoom-controls">
      <button
        className="zoom-btn"
        onClick={zoomOut}
        disabled={zoomLevel <= 0.1}
        title="Zoom Out (Ctrl + -)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="4" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="2"/>
          <line x1="11" y1="11" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>

      <div className="zoom-level" onClick={resetZoom} title="Reset Zoom (Ctrl + 0)">
        {zoomPercentage}%
      </div>

      <button
        className="zoom-btn"
        onClick={zoomIn}
        disabled={zoomLevel >= 2.0}
        title="Zoom In (Ctrl + +)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="2"/>
          <line x1="4" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="2"/>
          <line x1="7" y1="4" x2="7" y2="10" stroke="currentColor" strokeWidth="2"/>
          <line x1="11" y1="11" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </button>

      <button
        className="zoom-btn reset-btn"
        onClick={resetZoom}
        title="Reset Zoom & Pan">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v4M8 10v4M2 8h4M10 8h4" stroke="currentColor" strokeWidth="2"/>
          <circle cx="8" cy="8" r="2" fill="currentColor"/>
        </svg>
      </button>
    </div>
  );
};

export default ZoomControls;
