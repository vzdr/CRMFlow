/**
 * Centralized error handling utility
 * Provides user-friendly error messages for common error scenarios
 */

export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect to server. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',

  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  AUTH_EMAIL_EXISTS: 'An account with this email already exists.',
  AUTH_WEAK_PASSWORD: 'Password must be at least 8 characters long.',
  AUTH_INVALID_EMAIL: 'Please enter a valid email address.',
  AUTH_SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  AUTH_UNAUTHORIZED: 'You are not authorized to perform this action.',

  // Workflow errors
  WORKFLOW_NOT_FOUND: 'Workflow not found. It may have been deleted.',
  WORKFLOW_SAVE_FAILED: 'Failed to save workflow. Please try again.',
  WORKFLOW_DELETE_FAILED: 'Failed to delete workflow. Please try again.',
  WORKFLOW_LOAD_FAILED: 'Failed to load workflow. Please refresh the page.',

  // API Key errors
  API_KEY_INVALID: 'Invalid API key. Please check and try again.',
  API_KEY_REQUIRED: 'Please configure your API key in Settings first.',
  API_KEY_SAVE_FAILED: 'Failed to save API key. Please try again.',

  // AI errors
  AI_GENERATION_FAILED: 'AI generation failed. Please try again.',
  AI_RATE_LIMIT: 'Rate limit exceeded. Please wait a moment and try again.',
  AI_QUOTA_EXCEEDED: 'API quota exceeded. Please check your account.',

  // Knowledge base errors
  KNOWLEDGE_UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  KNOWLEDGE_INVALID_FILE: 'Invalid file type. Please upload a PDF file.',
  KNOWLEDGE_FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  KNOWLEDGE_DELETE_FAILED: 'Failed to delete knowledge item.',

  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.'
};

/**
 * Parse error and return user-friendly message
 */
export function getErrorMessage(error) {
  // Network errors
  if (!error.response && error.message === 'Network Error') {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (error.code === 'ECONNABORTED') {
    return ERROR_MESSAGES.TIMEOUT_ERROR;
  }

  // Backend error response
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.error?.message || data?.message || error.message;

    // Authentication errors
    if (status === 401) {
      if (message.includes('Invalid credentials') || message.includes('password')) {
        return ERROR_MESSAGES.AUTH_INVALID_CREDENTIALS;
      }
      if (message.includes('expired') || message.includes('token')) {
        return ERROR_MESSAGES.AUTH_SESSION_EXPIRED;
      }
      return ERROR_MESSAGES.AUTH_UNAUTHORIZED;
    }

    // Validation errors
    if (status === 400) {
      if (message.includes('email') && message.includes('exists')) {
        return ERROR_MESSAGES.AUTH_EMAIL_EXISTS;
      }
      if (message.includes('password')) {
        return ERROR_MESSAGES.AUTH_WEAK_PASSWORD;
      }
      if (message.includes('email') && message.includes('invalid')) {
        return ERROR_MESSAGES.AUTH_INVALID_EMAIL;
      }
      if (message.includes('API key')) {
        return ERROR_MESSAGES.API_KEY_REQUIRED;
      }
      return `${ERROR_MESSAGES.VALIDATION_ERROR} ${message}`;
    }

    // Not found errors
    if (status === 404) {
      if (message.includes('workflow') || message.includes('Workflow')) {
        return ERROR_MESSAGES.WORKFLOW_NOT_FOUND;
      }
      return message;
    }

    // Rate limiting
    if (status === 429) {
      return ERROR_MESSAGES.AI_RATE_LIMIT;
    }

    // Server errors
    if (status >= 500) {
      return ERROR_MESSAGES.SERVER_ERROR;
    }

    // Return backend message if available
    if (message && message !== 'Request failed') {
      return message;
    }
  }

  // Error message directly from error object
  if (error.message && error.message !== 'Request failed with status code') {
    // Map common error messages to friendly versions
    if (error.message.includes('API key') || error.message.includes('not configured')) {
      return ERROR_MESSAGES.API_KEY_REQUIRED;
    }
    if (error.message.includes('quota') || error.message.includes('Quota')) {
      return ERROR_MESSAGES.AI_QUOTA_EXCEEDED;
    }
    if (error.message.includes('rate limit')) {
      return ERROR_MESSAGES.AI_RATE_LIMIT;
    }

    return error.message;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Get error type for specific styling/handling
 */
export function getErrorType(error) {
  if (!error.response) {
    return 'network';
  }

  const { status } = error.response;

  if (status === 401) return 'auth';
  if (status === 400) return 'validation';
  if (status === 404) return 'notFound';
  if (status === 429) return 'rateLimit';
  if (status >= 500) return 'server';

  return 'general';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error) {
  if (!error.response) {
    return true; // Network errors are retryable
  }

  const { status } = error.response;

  // Don't retry auth or validation errors
  if (status === 401 || status === 400 || status === 404) {
    return false;
  }

  // Retry rate limits and server errors
  return status === 429 || status >= 500;
}

/**
 * Get suggested action for error
 */
export function getErrorAction(error) {
  const type = getErrorType(error);

  switch (type) {
    case 'network':
      return 'Check your internet connection and try again.';
    case 'auth':
      return 'Please log in again.';
    case 'validation':
      return 'Please check your input and try again.';
    case 'rateLimit':
      return 'Please wait a moment before trying again.';
    case 'server':
      return 'Please try again in a few minutes.';
    default:
      return 'Please try again or contact support if the problem persists.';
  }
}
