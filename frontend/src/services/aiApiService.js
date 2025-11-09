import apiClient from './apiClient';

export const aiApiService = {
  /**
   * Generate AI response (replaces direct Gemini calls)
   */
  async generate(message, options = {}) {
    const response = await apiClient.post('/ai/generate', {
      message,
      systemPrompt: options.systemPrompt,
      includeKnowledge: options.includeKnowledge ?? false,
      includePersonality: options.includePersonality ?? true,
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? 500
    });

    return response.data.data.response;
  },

  /**
   * Generate workflow from prompt
   */
  async generateWorkflow(prompt) {
    const response = await apiClient.post('/ai/generate-workflow', {
      prompt
    });

    return response.data.data;
  },

  /**
   * Save API key (encrypted on backend)
   */
  async saveApiKey(service, key) {
    const response = await apiClient.post('/keys', {
      service,
      key
    });

    return response.data.data;
  },

  /**
   * Get saved API keys (services only, no actual keys)
   */
  async getApiKeys() {
    const response = await apiClient.get('/keys');
    return response.data.data;
  },

  /**
   * Delete API key
   */
  async deleteApiKey(service) {
    const response = await apiClient.delete(`/keys/${service}`);
    return response.data;
  }
};
