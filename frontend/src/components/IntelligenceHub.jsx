import React, { useState } from 'react';
import './IntelligenceHub.css';

const IntelligenceHub = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('knowledge');
  const [knowledgeItems, setKnowledgeItems] = useState([
    { id: 1, type: 'pdf', name: 'Product Catalog 2024.pdf', enabled: true },
    { id: 2, type: 'faq', name: 'Website FAQ', enabled: true },
    { id: 3, type: 'manual', name: 'Pricing Information', enabled: false }
  ]);

  return (
    <div className="intelligence-hub-overlay">
      <div className="intelligence-hub">
        {/* Header */}
        <div className="hub-header">
          <div>
            <h2>🧠 Intelligence Hub</h2>
            <p>Personalize your AI's knowledge and personality</p>
          </div>
          <button className="close-hub-btn" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="hub-tabs">
          <button
            className={`hub-tab ${activeTab === 'knowledge' ? 'active' : ''}`}
            onClick={() => setActiveTab('knowledge')}
          >
            📚 Knowledge Base
          </button>
          <button
            className={`hub-tab ${activeTab === 'personality' ? 'active' : ''}`}
            onClick={() => setActiveTab('personality')}
          >
            🎭 Personality
          </button>
          <button
            className={`hub-tab ${activeTab === 'voice' ? 'active' : ''}`}
            onClick={() => setActiveTab('voice')}
          >
            🎤 Voice Lab
          </button>
          <button
            className={`hub-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
        </div>

        {/* Content */}
        <div className="hub-content">
          {activeTab === 'knowledge' && (
            <div className="knowledge-panel">
              <div className="panel-actions">
                <button className="add-knowledge-btn">+ Upload PDF</button>
                <button className="add-knowledge-btn">+ Scrape Website</button>
                <button className="add-knowledge-btn">+ Add Manual Q&A</button>
              </div>

              <div className="knowledge-list">
                {knowledgeItems.map(item => (
                  <div key={item.id} className="knowledge-item">
                    <div className="item-info">
                      <span className="item-icon">
                        {item.type === 'pdf' ? '📄' : item.type === 'faq' ? '🌐' : '✏️'}
                      </span>
                      <span className="item-name">{item.name}</span>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() => {}}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'personality' && (
            <div className="personality-panel">
              <h3>Custom Instructions</h3>
              <p className="panel-description">
                Define how your AI should behave and communicate
              </p>
              <textarea
                className="personality-input"
                placeholder="Example: You are 'BistroBot,' the friendly and slightly witty assistant for our restaurant. You love to recommend the daily specials. You never use emojis."
                rows={10}
                defaultValue="You are a helpful and professional AI assistant for CRMFlow. You provide clear, concise answers and always aim to help customers efficiently."
              />
              <button className="save-btn">Save Personality</button>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="voice-panel">
              <div className="voice-cloning-section">
                <h3>🎙️ Clone Your Voice</h3>
                <p className="panel-description">
                  Record 30 seconds of your voice to create a custom AI voice
                </p>
                <div className="voice-recorder">
                  <div className="record-button">
                    <button className="record-btn">● Record</button>
                  </div>
                  <div className="recording-instructions">
                    Read this script clearly:
                    <div className="script-text">
                      "Hello, welcome to our service. How can I help you today?
                      I'm here to assist with any questions you may have about
                      our products and services. Thank you for calling."
                    </div>
                  </div>
                </div>
              </div>

              <div className="voice-library">
                <h3>Voice Library</h3>
                <div className="voice-list">
                  <div className="voice-item">
                    <span>🔊 Default Voice</span>
                    <button className="preview-btn">Preview</button>
                  </div>
                  <div className="voice-item">
                    <span>🎤 Custom Voice (Not recorded)</span>
                    <button className="preview-btn" disabled>Preview</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-panel">
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h4>📞 Total Executions</h4>
                  <div className="analytics-value">247</div>
                  <div className="analytics-trend">+12% this week</div>
                </div>

                <div className="analytics-card">
                  <h4>⏱️ Avg Duration</h4>
                  <div className="analytics-value">2m 34s</div>
                  <div className="analytics-trend">-8% faster</div>
                </div>

                <div className="analytics-card">
                  <h4>😊 Sentiment</h4>
                  <div className="analytics-value">78%</div>
                  <div className="analytics-trend positive">Positive</div>
                </div>

                <div className="analytics-card">
                  <h4>✅ Success Rate</h4>
                  <div className="analytics-value">94%</div>
                  <div className="analytics-trend">+3% improvement</div>
                </div>
              </div>

              <div className="top-questions">
                <h3>🔥 Top 5 Customer Questions</h3>
                <div className="question-list">
                  <div className="question-item">1. What are your business hours?</div>
                  <div className="question-item">2. How much does delivery cost?</div>
                  <div className="question-item">3. Do you offer refunds?</div>
                  <div className="question-item">4. What payment methods do you accept?</div>
                  <div className="question-item">5. How long does shipping take?</div>
                </div>
              </div>

              <div className="stuck-points">
                <h3>⚠️ Top "Stuck" Points</h3>
                <div className="stuck-list">
                  <div className="stuck-item">
                    <span>Get Delivery Address</span>
                    <span className="stuck-count">23 users</span>
                  </div>
                  <div className="stuck-item">
                    <span>Process Stripe Payment</span>
                    <span className="stuck-count">15 users</span>
                  </div>
                  <div className="stuck-item">
                    <span>Listen for Order</span>
                    <span className="stuck-count">12 users</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntelligenceHub;
