import React from 'react';
import './KeyboardShortcutsGuide.css';

const KeyboardShortcutsGuide = ({ onClose }) => {
  const shortcuts = [
    {
      category: 'General',
      items: [
        { keys: ['Escape'], description: 'Clear selection' },
        { keys: ['?'], description: 'Show keyboard shortcuts' }
      ]
    },
    {
      category: 'Editing',
      items: [
        { keys: ['Ctrl', 'C'], description: 'Copy selected nodes', mac: ['⌘', 'C'] },
        { keys: ['Ctrl', 'V'], description: 'Paste nodes', mac: ['⌘', 'V'] },
        { keys: ['Delete'], description: 'Delete selected nodes', mac: ['⌫'] },
        { keys: ['Ctrl', 'Z'], description: 'Undo', mac: ['⌘', 'Z'] },
        { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo', mac: ['⌘', '⇧', 'Z'] }
      ]
    },
    {
      category: 'Selection',
      items: [
        { keys: ['Click'], description: 'Select node' },
        { keys: ['Shift', 'Click'], description: 'Toggle node selection' },
        { keys: ['Drag'], description: 'Rubber band selection' }
      ]
    },
    {
      category: 'Alignment',
      items: [
        { keys: ['Toolbar'], description: 'Align selected nodes (appears when 2+ nodes selected)' },
        { keys: ['Distribute'], description: 'Evenly space 3+ nodes' }
      ]
    },
    {
      category: 'Zoom & Pan',
      items: [
        { keys: ['Ctrl', '+'], description: 'Zoom in', mac: ['⌘', '+'] },
        { keys: ['Ctrl', '-'], description: 'Zoom out', mac: ['⌘', '-'] },
        { keys: ['Ctrl', '0'], description: 'Reset zoom & pan', mac: ['⌘', '0'] }
      ]
    }
  ];

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const renderKey = (key) => {
    return (
      <kbd className="keyboard-key" key={key}>
        {key}
      </kbd>
    );
  };

  return (
    <div className="shortcuts-guide-overlay" onClick={onClose}>
      <div className="shortcuts-guide" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>Keyboard Shortcuts</h2>
          <button className="close-shortcuts-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="shortcuts-content">
          {shortcuts.map((category) => (
            <div key={category.category} className="shortcuts-category">
              <h3>{category.category}</h3>
              <div className="shortcuts-list">
                {category.items.map((item, idx) => (
                  <div key={idx} className="shortcut-item">
                    <div className="shortcut-keys">
                      {(isMac && item.mac ? item.mac : item.keys).map((key, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <span className="key-separator">+</span>}
                          {renderKey(key)}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="shortcut-description">{item.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          <p>Press <kbd className="keyboard-key">?</kbd> anytime to show this guide</p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsGuide;
