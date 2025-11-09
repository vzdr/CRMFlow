import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { aiApiService } from '../services/aiApiService';
import toast from 'react-hot-toast';
import './SettingsPage.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    elevenlabs: '',
    twilio: '',
    stripe: ''
  });
  const [existingKeys, setExistingKeys] = useState([]);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const keys = await aiApiService.getApiKeys();
      // Keys are returned as array of services (not actual key values for security)
      setExistingKeys(keys.map(k => k.service));
    } catch (error) {
      console.error('Failed to load API keys:', error);
      toast.error('Failed to load saved API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (service, key) => {
    if (!key || key.trim() === '') {
      toast.error('Please enter an API key');
      return;
    }

    try {
      setSaving(true);
      await aiApiService.saveApiKey(service, key);
      toast.success(`${service.toUpperCase()} API key saved securely`);

      // Clear the input field
      setApiKeys(prev => ({ ...prev, [service]: '' }));

      // Reload to update existing keys list
      await loadApiKeys();
    } catch (error) {
      toast.error(error.message || 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (service) => {
    if (!confirm(`Delete ${service.toUpperCase()} API key?`)) {
      return;
    }

    try {
      setSaving(true);
      await aiApiService.deleteApiKey(service);
      toast.success(`${service.toUpperCase()} API key deleted`);
      await loadApiKeys();
    } catch (error) {
      toast.error('Failed to delete API key');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1>Settings</h1>
        </div>
        <div className="header-right">
          <p className="user-info">{user?.email}</p>
        </div>
      </header>

      <div className="settings-content">
        <div className="settings-section">
          <h2>API Keys</h2>
          <p className="section-description">
            Your API keys are encrypted and stored securely on the server.
            They are never exposed in responses.
          </p>

          {/* Gemini */}
          <div className="api-key-item">
            <div className="key-header">
              <label>Google Gemini API Key</label>
              {existingKeys.includes('gemini') && (
                <span className="key-status">✓ Configured</span>
              )}
            </div>
            <div className="key-input-group">
              <input
                type="password"
                placeholder="AIza..."
                value={apiKeys.gemini}
                onChange={(e) => handleChange('gemini', e.target.value)}
                disabled={saving}
              />
              {existingKeys.includes('gemini') ? (
                <button
                  className="delete-key-btn"
                  onClick={() => handleDelete('gemini')}
                  disabled={saving}
                >
                  Delete
                </button>
              ) : (
                <button
                  className="save-key-btn"
                  onClick={() => handleSave('gemini', apiKeys.gemini)}
                  disabled={saving || !apiKeys.gemini}
                >
                  Save
                </button>
              )}
            </div>
            <small>Used for AI workflow generation, intelligent processing, and chatbot responses</small>
          </div>

          {/* ElevenLabs */}
          <div className="api-key-item">
            <div className="key-header">
              <label>ElevenLabs API Key</label>
              {existingKeys.includes('elevenlabs') && (
                <span className="key-status">✓ Configured</span>
              )}
            </div>
            <div className="key-input-group">
              <input
                type="password"
                placeholder="Enter ElevenLabs key..."
                value={apiKeys.elevenlabs}
                onChange={(e) => handleChange('elevenlabs', e.target.value)}
                disabled={saving}
              />
              {existingKeys.includes('elevenlabs') ? (
                <button
                  className="delete-key-btn"
                  onClick={() => handleDelete('elevenlabs')}
                  disabled={saving}
                >
                  Delete
                </button>
              ) : (
                <button
                  className="save-key-btn"
                  onClick={() => handleSave('elevenlabs', apiKeys.elevenlabs)}
                  disabled={saving || !apiKeys.elevenlabs}
                >
                  Save
                </button>
              )}
            </div>
            <small>Used for voice cloning and text-to-speech in Speak nodes</small>
          </div>

          {/* Twilio */}
          <div className="api-key-item">
            <div className="key-header">
              <label>Twilio Account SID</label>
              {existingKeys.includes('twilio') && (
                <span className="key-status">✓ Configured</span>
              )}
            </div>
            <div className="key-input-group">
              <input
                type="password"
                placeholder="Enter Twilio SID..."
                value={apiKeys.twilio}
                onChange={(e) => handleChange('twilio', e.target.value)}
                disabled={saving}
              />
              {existingKeys.includes('twilio') ? (
                <button
                  className="delete-key-btn"
                  onClick={() => handleDelete('twilio')}
                  disabled={saving}
                >
                  Delete
                </button>
              ) : (
                <button
                  className="save-key-btn"
                  onClick={() => handleSave('twilio', apiKeys.twilio)}
                  disabled={saving || !apiKeys.twilio}
                >
                  Save
                </button>
              )}
            </div>
            <small>Used for phone number provisioning and SMS/voice communication</small>
          </div>

          {/* Stripe */}
          <div className="api-key-item">
            <div className="key-header">
              <label>Stripe API Key</label>
              {existingKeys.includes('stripe') && (
                <span className="key-status">✓ Configured</span>
              )}
            </div>
            <div className="key-input-group">
              <input
                type="password"
                placeholder="sk_test_... or sk_live_..."
                value={apiKeys.stripe}
                onChange={(e) => handleChange('stripe', e.target.value)}
                disabled={saving}
              />
              {existingKeys.includes('stripe') ? (
                <button
                  className="delete-key-btn"
                  onClick={() => handleDelete('stripe')}
                  disabled={saving}
                >
                  Delete
                </button>
              ) : (
                <button
                  className="save-key-btn"
                  onClick={() => handleSave('stripe', apiKeys.stripe)}
                  disabled={saving || !apiKeys.stripe}
                >
                  Save
                </button>
              )}
            </div>
            <small>Used for payment processing and subscription management in Integration nodes</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
