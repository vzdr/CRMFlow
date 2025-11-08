import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = ({ onClose }) => {
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    elevenlabs: '',
    twilio: ''
  });

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('crmflow_api_keys');
    if (saved) {
      setApiKeys(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('crmflow_api_keys', JSON.stringify(apiKeys));
    alert('API keys saved successfully!');
    onClose();
  };

  const handleChange = (key, value) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>API Settings</h2>
          <button className="close-settings-btn" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <label>Google Gemini API Key</label>
            <input
              type="password"
              placeholder="AIza..."
              value={apiKeys.gemini}
              onChange={(e) => handleChange('gemini', e.target.value)}
            />
            <small>Used for: Workflow generation, AI processing (Gemini 1.5 Flash)</small>
          </div>

          <div className="settings-section">
            <label>ElevenLabs API Key</label>
            <input
              type="password"
              placeholder="Enter ElevenLabs key..."
              value={apiKeys.elevenlabs}
              onChange={(e) => handleChange('elevenlabs', e.target.value)}
            />
            <small>Used for: Voice cloning and text-to-speech</small>
          </div>

          <div className="settings-section">
            <label>Twilio Account SID</label>
            <input
              type="password"
              placeholder="Enter Twilio SID..."
              value={apiKeys.twilio}
              onChange={(e) => handleChange('twilio', e.target.value)}
            />
            <small>Used for: Phone number provisioning</small>
          </div>
        </div>

        <div className="settings-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleSave}>Save Settings</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
