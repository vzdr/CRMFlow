import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { knowledgeApiService } from '../services/knowledgeApiService';
import toast from 'react-hot-toast';
import './IntelligenceHub.css';

const IntelligenceHub = ({ onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('knowledge');
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [personality, setPersonality] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadKnowledgeItems();
    loadPersonality();
  }, []);

  const loadKnowledgeItems = async () => {
    try {
      setLoading(true);
      const items = await knowledgeApiService.getKnowledgeItems();
      setKnowledgeItems(items);
    } catch (error) {
      console.error('Failed to load knowledge items:', error);
      toast.error('Failed to load knowledge items');
    } finally {
      setLoading(false);
    }
  };

  const loadPersonality = () => {
    // Load from localStorage for now (backend support in future)
    const saved = localStorage.getItem('crmflow_personality');
    setPersonality(saved || getDefaultPersonality());
  };

  const getDefaultPersonality = () => {
    return 'You are a helpful and professional AI assistant for CRMFlow. You provide clear, concise answers and always aim to help customers efficiently.';
  };

  // PDF UPLOAD - Backend API
  const handlePDFUpload = async () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    setLoading(true);
    try {
      const name = file.name.replace('.pdf', '');
      const result = await knowledgeApiService.addPDFKnowledge(file, name);

      toast.success(`PDF "${name}" uploaded! Extracted ${result.extractedLength} characters.`);
      await loadKnowledgeItems();
    } catch (error) {
      console.error('PDF upload error:', error);
      toast.error(`Failed to upload PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // WEBSITE SCRAPING - Backend API
  const handleWebsiteScrape = async () => {
    const url = prompt('Enter website URL to scrape:');
    if (!url) return;

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast.error('Invalid URL format');
      return;
    }

    setLoading(true);
    try {
      const result = await knowledgeApiService.addWebKnowledge(url);
      toast.success(`Website scraped! Extracted ${result.item.content.length} characters.`);
      await loadKnowledgeItems();
    } catch (error) {
      console.error('Web scraping error:', error);
      toast.error(`Failed to scrape website: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // MANUAL Q&A - Backend API
  const handleManualQA = async () => {
    const question = prompt('Enter question:');
    if (!question) return;

    const answer = prompt('Enter answer:');
    if (!answer) return;

    setLoading(true);
    try {
      await knowledgeApiService.addManualKnowledge(question, question, answer);
      toast.success('Q&A added successfully!');
      await loadKnowledgeItems();
    } catch (error) {
      console.error('Manual Q&A error:', error);
      toast.error(`Failed to add Q&A: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleKnowledge = async (item) => {
    try {
      await knowledgeApiService.updateKnowledgeItem(item.id, { enabled: !item.enabled });
      setKnowledgeItems(prev => prev.map(i =>
        i.id === item.id ? { ...i, enabled: !i.enabled } : i
      ));
      toast.success(`Knowledge item ${!item.enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Failed to update knowledge item');
    }
  };

  const handleDeleteKnowledge = async (itemId) => {
    if (!confirm('Delete this knowledge item?')) return;

    try {
      await knowledgeApiService.deleteKnowledgeItem(itemId);
      setKnowledgeItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Knowledge item deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete knowledge item');
    }
  };

  const handleSavePersonality = () => {
    localStorage.setItem('crmflow_personality', personality);
    toast.success('Personality saved! This will be used in all AI interactions.');
  };

  // VOICE RECORDING - MediaRecorder API
  const handleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setVoiceBlob(audioBlob);

          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());

          toast.success(`Voice recorded (${(audioBlob.size / 1024).toFixed(2)} KB)! Add ElevenLabs API key in Settings to enable voice cloning.`);
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);

        // Timer for recording duration
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime(prev => {
            if (prev >= 30) {
              handleVoiceRecording(); // Auto-stop after 30 seconds
              return 30;
            }
            return prev + 1;
          });
        }, 1000);

      } catch (error) {
        console.error('Microphone access error:', error);
        toast.error(`Failed to access microphone: ${error.message}`);
      }
    }
  };

  const handlePreviewVoice = () => {
    if (voiceBlob) {
      const audioUrl = URL.createObjectURL(voiceBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="intelligence-hub-overlay">
      <div className="intelligence-hub">
        <div className="hub-header">
          <div>
            <h2>Intelligence Hub</h2>
            <p>Configure your AI's knowledge, personality, and voice</p>
          </div>
          <button className="close-hub-btn" onClick={onClose}>✕</button>
        </div>

        <div className="hub-tabs">
          <button
            className={`hub-tab ${activeTab === 'knowledge' ? 'active' : ''}`}
            onClick={() => setActiveTab('knowledge')}
          >
            Knowledge Base ({knowledgeItems.length})
          </button>
          <button
            className={`hub-tab ${activeTab === 'personality' ? 'active' : ''}`}
            onClick={() => setActiveTab('personality')}
          >
            Personality
          </button>
          <button
            className={`hub-tab ${activeTab === 'voice' ? 'active' : ''}`}
            onClick={() => setActiveTab('voice')}
          >
            Voice Lab
          </button>
          <button
            className={`hub-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>

        <div className="hub-content">
          {activeTab === 'knowledge' && (
            <div className="knowledge-panel">
              <div className="panel-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={handleFileSelected}
                />
                <button
                  className="add-knowledge-btn"
                  onClick={handlePDFUpload}
                  disabled={loading}
                >
                  {loading ? 'Uploading...' : '+ Upload PDF'}
                </button>
                <button
                  className="add-knowledge-btn"
                  onClick={handleWebsiteScrape}
                  disabled={loading}
                >
                  + Scrape Website
                </button>
                <button className="add-knowledge-btn" onClick={handleManualQA} disabled={loading}>
                  + Add Manual Q&A
                </button>
              </div>

              {loading && knowledgeItems.length === 0 ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading knowledge items...</p>
                </div>
              ) : (
                <div className="knowledge-list">
                  {knowledgeItems.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888' }}>
                      <h3>No knowledge items yet</h3>
                      <p>Upload PDFs, scrape websites, or add Q&A pairs to build your knowledge base.</p>
                    </div>
                  ) : (
                    knowledgeItems.map(item => (
                      <div key={item.id} className="knowledge-item">
                        <div className="item-info">
                          <span className="item-icon">
                            {item.type === 'pdf' ? '📄 PDF' : item.type === 'web' ? '🌐 WEB' : '💬 Q&A'}
                          </span>
                          <div className="item-details">
                            <span className="item-name">{item.name}</span>
                            {item.url && <span className="item-url">{item.url}</span>}
                            <span className="item-size">
                              {item.content ? `${(item.content.length / 1024).toFixed(1)} KB` : ''}
                            </span>
                          </div>
                        </div>
                        <div className="item-actions">
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={item.enabled}
                              onChange={() => handleToggleKnowledge(item)}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteKnowledge(item.id)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
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
                placeholder="Example: You are 'BistroBot,' the friendly assistant for our restaurant. You love to recommend specials and always sound upbeat!"
                rows={10}
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
              />
              <button className="save-btn" onClick={handleSavePersonality}>
                Save Personality
              </button>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="voice-panel">
              <div className="voice-cloning-section">
                <h3>Clone Your Voice</h3>
                <p className="panel-description">
                  Record 30 seconds of your voice for AI voice cloning with ElevenLabs
                </p>
                <div className="voice-recorder">
                  <div className="record-button">
                    <button
                      className={`record-btn ${isRecording ? 'recording' : ''}`}
                      onClick={handleVoiceRecording}
                    >
                      {isRecording ? `⏹ Stop (${recordingTime}s)` : '● Record'}
                    </button>
                  </div>
                  {!isRecording && (
                    <div className="recording-instructions">
                      Read this script clearly:
                      <div className="script-text">
                        "Hello, welcome to our service. How can I help you today?
                        I'm here to assist with any questions you may have about
                        our products and services. Thank you for calling."
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="voice-library">
                <h3>Voice Library</h3>
                <div className="voice-list">
                  <div className="voice-item">
                    <span>🎙️ Default Voice</span>
                    <button className="preview-btn" disabled>Preview</button>
                  </div>
                  <div className="voice-item">
                    <span>🎤 Custom Voice {voiceBlob ? '(Recorded)' : '(Not recorded)'}</span>
                    <button
                      className="preview-btn"
                      disabled={!voiceBlob}
                      onClick={handlePreviewVoice}
                    >
                      {voiceBlob ? 'Preview' : 'Not Available'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-panel">
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h4>Total Executions</h4>
                  <div className="analytics-value">—</div>
                  <div className="analytics-trend">Coming soon</div>
                </div>
                <div className="analytics-card">
                  <h4>Avg Duration</h4>
                  <div className="analytics-value">—</div>
                  <div className="analytics-trend">Coming soon</div>
                </div>
                <div className="analytics-card">
                  <h4>Sentiment</h4>
                  <div className="analytics-value">—</div>
                  <div className="analytics-trend">Coming soon</div>
                </div>
                <div className="analytics-card">
                  <h4>Success Rate</h4>
                  <div className="analytics-value">—</div>
                  <div className="analytics-trend">Coming soon</div>
                </div>
              </div>
              <div className="top-questions">
                <h3>Analytics Dashboard</h3>
                <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                  Detailed analytics will be available soon. Connect your workflows to start tracking execution metrics.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntelligenceHub;
