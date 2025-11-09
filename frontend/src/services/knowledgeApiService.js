import apiClient from './apiClient';

export const knowledgeApiService = {
  /**
   * Get all knowledge items
   */
  async getKnowledgeItems() {
    const response = await apiClient.get('/knowledge');
    return response.data.data;
  },

  /**
   * Upload PDF file
   */
  async uploadPDF(file, name) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name || file.name);

    const response = await apiClient.post('/knowledge/pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.data;
  },

  /**
   * Scrape website
   */
  async scrapeWebsite(url) {
    const response = await apiClient.post('/knowledge/scrape', { url });
    return response.data.data;
  },

  /**
   * Add manual Q&A
   */
  async addManualQA(question, answer) {
    const response = await apiClient.post('/knowledge/manual', {
      question,
      answer
    });

    return response.data.data;
  },

  /**
   * Update knowledge item (toggle enabled)
   */
  async updateKnowledgeItem(itemId, enabled) {
    const response = await apiClient.put(`/knowledge/${itemId}`, {
      enabled
    });

    return response.data.data;
  },

  /**
   * Delete knowledge item
   */
  async deleteKnowledgeItem(itemId) {
    const response = await apiClient.delete(`/knowledge/${itemId}`);
    return response.data;
  }
};
