import React from 'react';
import useFlowStore from '../hooks/useFlowStore';
import toast from 'react-hot-toast';
import './AlignmentToolbar.css';

const AlignmentToolbar = () => {
  const { selectedNodeIds, alignNodes, distributeNodes } = useFlowStore();

  if (selectedNodeIds.length < 2) {
    return null; // Only show when 2+ nodes selected
  }

  const handleAlign = (direction) => {
    alignNodes(direction);
    toast.success(`Nodes aligned ${direction}`);
  };

  const handleDistribute = (direction) => {
    if (selectedNodeIds.length < 3) {
      toast.error('Select at least 3 nodes to distribute');
      return;
    }
    distributeNodes(direction);
    toast.success(`Nodes distributed ${direction}ly`);
  };

  return (
    <div className="alignment-toolbar">
      <div className="toolbar-section">
        <span className="toolbar-label">Align:</span>
        <button
          className="toolbar-btn"
          onClick={() => handleAlign('left')}
          title="Align Left">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="2" y1="0" x2="2" y2="16" stroke="currentColor" strokeWidth="2"/>
            <rect x="4" y="2" width="8" height="3" fill="currentColor"/>
            <rect x="4" y="7" width="10" height="3" fill="currentColor"/>
            <rect x="4" y="12" width="6" height="3" fill="currentColor"/>
          </svg>
        </button>
        <button
          className="toolbar-btn"
          onClick={() => handleAlign('center-vertical')}
          title="Align Center Vertical">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" strokeWidth="2"/>
            <rect x="5" y="2" width="6" height="3" fill="currentColor"/>
            <rect x="4" y="7" width="8" height="3" fill="currentColor"/>
            <rect x="6" y="12" width="4" height="3" fill="currentColor"/>
          </svg>
        </button>
        <button
          className="toolbar-btn"
          onClick={() => handleAlign('right')}
          title="Align Right">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="14" y1="0" x2="14" y2="16" stroke="currentColor" strokeWidth="2"/>
            <rect x="4" y="2" width="8" height="3" fill="currentColor"/>
            <rect x="2" y="7" width="10" height="3" fill="currentColor"/>
            <rect x="6" y="12" width="6" height="3" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div className="toolbar-divider"></div>

      <div className="toolbar-section">
        <span className="toolbar-label">Align:</span>
        <button
          className="toolbar-btn"
          onClick={() => handleAlign('top')}
          title="Align Top">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="0" y1="2" x2="16" y2="2" stroke="currentColor" strokeWidth="2"/>
            <rect x="2" y="4" width="3" height="8" fill="currentColor"/>
            <rect x="7" y="4" width="3" height="10" fill="currentColor"/>
            <rect x="12" y="4" width="3" height="6" fill="currentColor"/>
          </svg>
        </button>
        <button
          className="toolbar-btn"
          onClick={() => handleAlign('center-horizontal')}
          title="Align Center Horizontal">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="0" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="2"/>
            <rect x="2" y="5" width="3" height="6" fill="currentColor"/>
            <rect x="7" y="4" width="3" height="8" fill="currentColor"/>
            <rect x="12" y="6" width="3" height="4" fill="currentColor"/>
          </svg>
        </button>
        <button
          className="toolbar-btn"
          onClick={() => handleAlign('bottom')}
          title="Align Bottom">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <line x1="0" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="2"/>
            <rect x="2" y="4" width="3" height="8" fill="currentColor"/>
            <rect x="7" y="2" width="3" height="10" fill="currentColor"/>
            <rect x="12" y="6" width="3" height="6" fill="currentColor"/>
          </svg>
        </button>
      </div>

      {selectedNodeIds.length >= 3 && (
        <>
          <div className="toolbar-divider"></div>
          <div className="toolbar-section">
            <span className="toolbar-label">Distribute:</span>
            <button
              className="toolbar-btn"
              onClick={() => handleDistribute('horizontal')}
              title="Distribute Horizontally">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <rect x="1" y="6" width="3" height="4" fill="currentColor"/>
                <rect x="6.5" y="6" width="3" height="4" fill="currentColor"/>
                <rect x="12" y="6" width="3" height="4" fill="currentColor"/>
              </svg>
            </button>
            <button
              className="toolbar-btn"
              onClick={() => handleDistribute('vertical')}
              title="Distribute Vertically">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <rect x="6" y="1" width="4" height="3" fill="currentColor"/>
                <rect x="6" y="6.5" width="4" height="3" fill="currentColor"/>
                <rect x="6" y="12" width="4" height="3" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </>
      )}

      <div className="toolbar-section selection-count">
        <span>{selectedNodeIds.length} nodes selected</span>
      </div>
    </div>
  );
};

export default AlignmentToolbar;
