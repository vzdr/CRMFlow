import apiClient from './apiClient';

export const workflowApiService = {
  /**
   * Get all workflows for current user
   */
  async getWorkflows() {
    const response = await apiClient.get('/workflows');
    return response.data.data;
  },

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId) {
    const response = await apiClient.get(`/workflows/${workflowId}`);
    return response.data.data;
  },

  /**
   * Create new workflow
   */
  async createWorkflow(name = 'Untitled Workflow') {
    const response = await apiClient.post('/workflows', { name });
    return response.data.data;
  },

  /**
   * Update workflow (auto-save)
   */
  async updateWorkflow(workflowId, data) {
    const response = await apiClient.put(`/workflows/${workflowId}`, data);
    return response.data.data;
  },

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId) {
    const response = await apiClient.delete(`/workflows/${workflowId}`);
    return response.data;
  },

  /**
   * Clone template
   */
  async cloneTemplate(templateId) {
    const response = await apiClient.post(`/workflows/${templateId}/clone`);
    return response.data.data;
  },

  /**
   * Get all templates
   */
  async getTemplates() {
    const response = await apiClient.get('/templates');
    return response.data.data;
  }
};
