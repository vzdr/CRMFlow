import React, { useState } from 'react';
import './DeploymentMenu.css';

const DeploymentMenu = ({ onClose }) => {
  const [deployments, setDeployments] = useState({
    phone: false,
    webChat: false,
    api: false
  });
  const [areaCode, setAreaCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [widgetCode, setWidgetCode] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');

  const handleProvisionNumber = async () => {
    const saved = localStorage.getItem('crmflow_api_keys');
    const apiKeys = saved ? JSON.parse(saved) : {};

    if (!apiKeys.twilio) {
      alert('Please set your Twilio API key in Settings to provision phone numbers.');
      return;
    }

    // In production, this would make a real Twilio API call
    const mockNumber = `+1${areaCode || '415'}${Math.floor(1000000 + Math.random() * 9000000)}`;
    setPhoneNumber(mockNumber);
    alert(`Phone number ${mockNumber} provisioned! In production, this would use Twilio API to provision a real number.`);
  };

  const handleGenerateWidget = () => {
    const workflowId = `wf_${Date.now()}`;
    const code = `<!-- CRMFlow Chat Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://cdn.crmflow.ai/widget.js';
    script.async = true;
    script.onload = function() {
      CRMFlow.init({
        workflowId: '${workflowId}',
        position: 'bottom-right',
        primaryColor: '#4a9eff'
      });
    };
    document.head.appendChild(script);
  })();
</script>`;
    setWidgetCode(code);
  };

  const handleGenerateAPI = () => {
    const workflowId = `wf_${Date.now()}`;
    const apiKey = `sk_live_${Math.random().toString(36).substring(2, 15)}`;
    const endpoint = `https://api.crmflow.ai/v1/workflows/${workflowId}/execute`;
    setApiEndpoint(endpoint);

    const curlExample = `curl -X POST ${endpoint} \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "Hello, I need help",
    "userId": "user_123"
  }'`;

    alert(`API endpoint generated!\n\nExample usage:\n\n${curlExample}`);
  };

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleDeployAll = () => {
    const selected = Object.keys(deployments).filter(key => deployments[key]);
    if (selected.length === 0) {
      alert('Please select at least one deployment option.');
      return;
    }

    alert(`Deploying ${selected.join(', ')}...\n\nIn production, this would:\n- Provision Twilio numbers\n- Generate and host widget code\n- Create API endpoints\n- Set up webhook handlers`);
  };

  return (
    <div className="deployment-menu-overlay">
      <div className="deployment-menu">
        <div className="deployment-header">
          <div>
            <h2>Deploy Workflow</h2>
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
                <div className="option-icon">Phone</div>
                <div>
                  <h3>Get a Phone Number</h3>
                  <p>Provision a Twilio phone number for voice calls</p>
                </div>
              </label>
            </div>
            {deployments.phone && (
              <div className="option-details">
                <input
                  type="text"
                  placeholder="Choose area code (e.g., 415)"
                  value={areaCode}
                  onChange={(e) => setAreaCode(e.target.value)}
                />
                <button className="provision-btn" onClick={handleProvisionNumber}>
                  Provision Number
                </button>
                {phoneNumber && (
                  <div className="provisioned-number">
                    <strong>Provisioned:</strong> {phoneNumber}
                  </div>
                )}
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
                <div className="option-icon">Chat</div>
                <div>
                  <h3>Generate Web Chat Widget</h3>
                  <p>Embed a chat widget on your website</p>
                </div>
              </label>
            </div>
            {deployments.webChat && (
              <div className="option-details">
                {!widgetCode ? (
                  <button className="provision-btn" onClick={handleGenerateWidget}>
                    Generate Widget Code
                  </button>
                ) : (
                  <>
                    <code className="embed-code">
                      {widgetCode}
                    </code>
                    <button className="copy-btn" onClick={() => handleCopyCode(widgetCode)}>
                      Copy Code
                    </button>
                  </>
                )}
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
                <div className="option-icon">API</div>
                <div>
                  <h3>Create API Endpoint</h3>
                  <p>Access workflow via REST API</p>
                </div>
              </label>
            </div>
            {deployments.api && (
              <div className="option-details">
                {!apiEndpoint ? (
                  <button className="provision-btn" onClick={handleGenerateAPI}>
                    Generate API Endpoint
                  </button>
                ) : (
                  <>
                    <code className="api-endpoint">
                      {apiEndpoint}
                    </code>
                    <button className="copy-btn" onClick={() => handleCopyCode(apiEndpoint)}>
                      Copy Endpoint
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="deployment-footer">
          <button className="deploy-all-btn" onClick={handleDeployAll}>
            Deploy Selected ({Object.values(deployments).filter(Boolean).length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeploymentMenu;
