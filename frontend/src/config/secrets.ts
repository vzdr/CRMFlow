/**
 * CRMFlow Configuration and Secrets Management
 *
 * This file handles environment variable access with proper separation between:
 * - Client-safe variables (NEXT_PUBLIC_*) - accessible in browser
 * - Server-side secrets - only accessible in API routes and server components
 *
 * SECURITY NOTES:
 * - NEVER use server-side secrets in client components
 * - NEVER expose API keys, tokens, or passwords with NEXT_PUBLIC_ prefix
 * - Always validate environment variables are set before use
 */

// =============================================================================
// CLIENT-SAFE CONFIGURATION (accessible in browser)
// =============================================================================

/**
 * Public configuration that can be safely exposed to the browser
 * These are embedded in the client bundle at build time
 */
export const publicConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
} as const

// =============================================================================
// SERVER-SIDE SECRETS (NEVER send to client)
// =============================================================================

/**
 * Get server-side environment variable with validation
 * Throws error if variable is not set (in production)
 */
function getServerSecret(key: string, required: boolean = true): string {
  const value = process.env[key]

  if (!value && required && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value || ''
}

/**
 * Server-side secrets - ONLY use in API routes or server components
 * These are never sent to the client
 */
export const serverSecrets = {
  // Google Gemini
  gemini: {
    apiKey: () => getServerSecret('GOOGLE_GEMINI_API_KEY'),
  },

  // Twilio
  twilio: {
    accountSid: () => getServerSecret('TWILIO_ACCOUNT_SID'),
    authToken: () => getServerSecret('TWILIO_AUTH_TOKEN'),
    phoneNumber: () => getServerSecret('TWILIO_PHONE_NUMBER'),
  },

  // ElevenLabs
  elevenlabs: {
    apiKey: () => getServerSecret('ELEVENLABS_API_KEY'),
    voiceId: () => getServerSecret('ELEVENLABS_VOICE_ID', false) || '21m00Tcm4TlvDq8ikWAM',
  },

  // SAP
  sap: {
    apiUrl: () => getServerSecret('SAP_API_URL'),
    clientId: () => getServerSecret('SAP_CLIENT_ID'),
    clientSecret: () => getServerSecret('SAP_CLIENT_SECRET'),
    username: () => getServerSecret('SAP_USERNAME'),
    password: () => getServerSecret('SAP_PASSWORD'),
  },

  // Google Cloud
  google: {
    serviceAccountEmail: () => getServerSecret('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
    serviceAccountPrivateKey: () => getServerSecret('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'),
    projectId: () => getServerSecret('GOOGLE_PROJECT_ID'),
  },

  // Qlay
  qlay: {
    apiKey: () => getServerSecret('QLAY_API_KEY'),
    apiUrl: () => getServerSecret('QLAY_API_URL', false) || 'https://api.qlay.ai/v1',
  },
} as const

// =============================================================================
// CONFIGURATION VALIDATION
// =============================================================================

/**
 * Validate that all required environment variables are set
 * Call this in API routes before using secrets
 */
export function validateRequiredSecrets(services: (keyof typeof serverSecrets)[]) {
  const missing: string[] = []

  for (const service of services) {
    const config = serverSecrets[service]
    try {
      // Attempt to access each secret to trigger validation
      Object.values(config).forEach(getter => getter())
    } catch (error) {
      if (error instanceof Error) {
        missing.push(error.message)
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\n` +
      'Please check your .env.local file. See .env.local.example for reference.'
    )
  }
}

// =============================================================================
// HELPER UTILITIES
// =============================================================================

/**
 * Check if running in development mode
 */
export const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Check if running in production mode
 */
export const isProduction = process.env.NODE_ENV === 'production'

/**
 * Check if running on server side
 */
export const isServer = typeof window === 'undefined'

/**
 * Safe way to check if a service is configured (for optional features)
 */
export function isServiceConfigured(service: keyof typeof serverSecrets): boolean {
  if (!isServer) {
    console.warn(`isServiceConfigured('${service}') should only be called server-side`)
    return false
  }

  try {
    const config = serverSecrets[service]
    // Try to access the first secret - if it throws, service is not configured
    const firstGetter = Object.values(config)[0]
    firstGetter()
    return true
  } catch {
    return false
  }
}

// =============================================================================
// EXPORT TYPES
// =============================================================================

export type ServerSecret = typeof serverSecrets
export type PublicConfig = typeof publicConfig
