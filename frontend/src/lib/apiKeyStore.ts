/**
 * API Key Store
 *
 * Manages user-provided API keys stored in browser localStorage.
 * This allows users to configure their own API keys without editing .env files.
 */

export interface ApiKeys {
  gemini?: string
  twilio?: {
    accountSid?: string
    authToken?: string
    phoneNumber?: string
  }
  elevenlabs?: {
    apiKey?: string
    voiceId?: string
  }
  sap?: {
    apiUrl?: string
    clientId?: string
    clientSecret?: string
    username?: string
    password?: string
  }
  google?: {
    serviceAccountEmail?: string
    serviceAccountPrivateKey?: string
    projectId?: string
  }
  qlay?: {
    apiKey?: string
    apiUrl?: string
  }
}

const STORAGE_KEY = 'crmflow_api_keys'

/**
 * Get all stored API keys
 */
export function getApiKeys(): ApiKeys {
  if (typeof window === 'undefined') return {}

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error reading API keys from storage:', error)
    return {}
  }
}

/**
 * Save API keys to localStorage
 */
export function saveApiKeys(keys: ApiKeys): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  } catch (error) {
    console.error('Error saving API keys to storage:', error)
  }
}

/**
 * Clear all stored API keys
 */
export function clearApiKeys(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing API keys from storage:', error)
  }
}

/**
 * Get a specific API key
 */
export function getApiKey(service: 'gemini'): string | undefined
export function getApiKey(service: 'twilio'): ApiKeys['twilio'] | undefined
export function getApiKey(service: 'elevenlabs'): ApiKeys['elevenlabs'] | undefined
export function getApiKey(service: 'sap'): ApiKeys['sap'] | undefined
export function getApiKey(service: 'google'): ApiKeys['google'] | undefined
export function getApiKey(service: 'qlay'): ApiKeys['qlay'] | undefined
export function getApiKey(service: keyof ApiKeys): any {
  const keys = getApiKeys()
  return keys[service]
}

/**
 * Check if user has configured any API keys
 */
export function hasApiKeys(): boolean {
  const keys = getApiKeys()
  return Object.keys(keys).length > 0
}

/**
 * Export API keys as HTTP headers for API requests
 */
export function getApiKeyHeaders(): Record<string, string> {
  const keys = getApiKeys()
  const headers: Record<string, string> = {}

  if (keys.gemini) {
    headers['X-Gemini-API-Key'] = keys.gemini
  }

  if (keys.twilio?.accountSid) {
    headers['X-Twilio-Account-SID'] = keys.twilio.accountSid
  }
  if (keys.twilio?.authToken) {
    headers['X-Twilio-Auth-Token'] = keys.twilio.authToken
  }
  if (keys.twilio?.phoneNumber) {
    headers['X-Twilio-Phone-Number'] = keys.twilio.phoneNumber
  }

  if (keys.elevenlabs?.apiKey) {
    headers['X-ElevenLabs-API-Key'] = keys.elevenlabs.apiKey
  }
  if (keys.elevenlabs?.voiceId) {
    headers['X-ElevenLabs-Voice-ID'] = keys.elevenlabs.voiceId
  }

  if (keys.sap?.apiUrl) {
    headers['X-SAP-API-URL'] = keys.sap.apiUrl
  }
  if (keys.sap?.clientId) {
    headers['X-SAP-Client-ID'] = keys.sap.clientId
  }
  if (keys.sap?.clientSecret) {
    headers['X-SAP-Client-Secret'] = keys.sap.clientSecret
  }

  if (keys.google?.serviceAccountEmail) {
    headers['X-Google-Service-Account-Email'] = keys.google.serviceAccountEmail
  }
  if (keys.google?.projectId) {
    headers['X-Google-Project-ID'] = keys.google.projectId
  }

  if (keys.qlay?.apiKey) {
    headers['X-Qlay-API-Key'] = keys.qlay.apiKey
  }

  return headers
}
