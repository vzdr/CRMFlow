import React, { useState } from 'react';
import './WorkflowGenerator.css';

const WorkflowGenerator = ({ onGenerateWorkflow, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerateWorkflow(prompt);
    }
  };

  const handleKeyDown = (e) => {
    // Allow Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleGenerate();
    }
  };

  const examplePrompts = [
    "Create a workflow for a pizza restaurant that takes a delivery order and processes payment with Stripe",
    "Build a customer support workflow that routes tickets based on urgency and assigns to appropriate team",
    "Design a sales qualification workflow that scores leads and creates opportunities in Salesforce",
    "Make a candidate screening workflow that asks interview questions and sends results to HR"
  ];

  return (
    <div className={`workflow-generator ${isExpanded ? 'expanded' : ''}`}>
      {!isExpanded ? (
        <button
          className="generator-toggle"
          onClick={() => setIsExpanded(true)}
        >
          ✨ Generate Workflow from Prompt
        </button>
      ) : (
        <div className="generator-panel">
          <div className="generator-header">
            <h3>✨ Generate Workflow from Description</h3>
            <button
              className="close-button"
              onClick={() => setIsExpanded(false)}
              disabled={isGenerating}
            >
              ✕
            </button>
          </div>

          <textarea
            className="prompt-input"
            placeholder="Describe your workflow... e.g., 'Create a workflow for a pizza restaurant that takes a delivery order and processes the payment with Stripe.'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            rows={4}
          />

          <div className="generator-actions">
            <button
              className="generate-button"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <span className="spinner"></span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="magic-icon">✨</span>
                  Generate Workflow
                </>
              )}
            </button>
            <span className="hint">Ctrl+Enter to generate</span>
          </div>

          <div className="examples">
            <p className="examples-title">Try these examples:</p>
            {examplePrompts.map((example, idx) => (
              <button
                key={idx}
                className="example-button"
                onClick={() => setPrompt(example)}
                disabled={isGenerating}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowGenerator;
