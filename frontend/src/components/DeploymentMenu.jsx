import React, { useState } from 'react';
import './DeploymentMenu.css';

const DeploymentMenu = ({ onClose }) => {
  const [deployments, setDeployments] = useState({
    phone: false,
    webChat: false,
    api: false
  });

  return (
    <div className="deployment-menu-overlay">
      <div className="deployment-menu">
        <div className="deployment-header">
          <div>
            <h2>🚀 Deploy Workflow</h2>
            <p>Choose how you want to make this workflow available</p>
          </div>
          <button className="close-deploy-btn" onClick={onClose}>✕</button>
        </div>

        <div className="deployment-options">
          <div className="deployment-option">
            <div className="option-header">
              <input
                type="checkbox"
                id="phone"
                checked={deployments.phone}
                onChange={(e) => setDeployments({...deployments, phone: e.target.checked})}
              />
              <label htmlFor="phone">
                <div className="option-icon">📞</div>
                <div>
                  <h3>Get a Phone Number</h3>
                  <p>Provision a Twilio phone number for voice calls</p>
                </div>
              </label>
            </div>
            {deployments.phone && (
              <div className="option-details">
                <input type="text" placeholder="Choose area code (e.g., 415)" />
                <button className="provision-btn">Provision Number</button>
              </div>
            )}
          </div>

          <div className="deployment-option">
            <div className="option-header">
              <input
                type="checkbox"
                id="webChat"
                checked={deployments.webChat}
                onChange={(e) => setDeployments({...deployments, webChat: e.target.checked})}
              />
              <label htmlFor="webChat">
                <div className="option-icon">💬</div>
                <div>
                  <h3>Generate Web Chat Widget</h3>
                  <p>Embed a chat widget on your website</p>
                </div>
              </label>
            </div>
            {deployments.webChat && (
              <div className="option-details">
                <code className="embed-code">
                  &lt;script src="https://crmflow.ai/widget.js"&gt;&lt;/script&gt;
                </code>
                <button className="copy-btn">Copy Code</button>
              </div>
            )}
          </div>

          <div className="deployment-option">
            <div className="option-header">
              <input
                type="checkbox"
                id="api"
                checked={deployments.api}
                onChange={(e) => setDeployments({...deployments, api: e.target.checked})}
              />
              <label htmlFor="api">
                <div className="option-icon">🔌</div>
                <div>
                  <h3>Create API Endpoint</h3>
                  <p>Access workflow via REST API</p>
                </div>
              </label>
            </div>
            {deployments.api && (
              <div className="option-details">
                <code className="api-endpoint">
                  POST https://api.crmflow.ai/v1/workflows/execute
                </code>
                <button className="copy-btn">Copy Endpoint</button>
              </div>
            )}
          </div>
        </div>

        <div className="deployment-footer">
          <button className="deploy-all-btn">
            Deploy Selected ({Object.values(deployments).filter(Boolean).length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeploymentMenu;
