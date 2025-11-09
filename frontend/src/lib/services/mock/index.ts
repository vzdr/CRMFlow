/**
 * Mock Services Index
 *
 * Central export for all mock service functions
 * Use these when USE_MOCK=1 environment variable is set
 */

// Twilio Mocks
export {
  twilioInboundSim,
  twilioOutboundSim,
  twilioSmsInboundSim,
  twilioSmsOutboundSim,
  type TwilioInboundCallData,
  type TwilioOutboundCallData,
} from './twilioMock'

// ElevenLabs Mocks
export {
  speakTextSim,
  cloneVoiceSim,
  getVoicesSim,
  type SpeakTextSimResult,
} from './elevenlabsMock'

// Gemini Mocks
export {
  geminiListenSim,
  geminiSentimentSim,
  geminiGenerateSim,
  geminiExtractEntitiesSim,
  type GeminiListenSimResult,
  type GeminiSentimentResult,
} from './geminiMock'

// SAP Mocks
export {
  sapCreateLeadMock,
  sapGetCustomerMock,
  sapUpdateLeadMock,
  sapConvertLeadMock,
  sapGetLeadAnalyticsMock,
  type SAPLead,
  type SAPCustomer,
} from './sapMock'

// Google Services Mocks
export {
  googleReadSheetMock,
  googleWriteSheetMock,
  googleCreateEventMock,
  googleListEventsMock,
  googleUpdateEventMock,
  googleAppendSheetMock,
  type GoogleSheetRow,
  type GoogleCalendarEvent,
} from './googleMock'

// Qlay Mocks
export {
  qlayScreenCandidateMock,
  qlayCreateCandidateMock,
  qlayGetCandidateMock,
  qlayGetAnalyticsMock,
  type QlayCandidate,
  type QlayScreeningResult,
} from './qlayMock'

/**
 * Check if mock mode is enabled
 * Set USE_MOCK=1 in environment or localStorage
 */
export function isMockMode(): boolean {
  // Check environment variable (server-side or build-time)
  if (typeof process !== 'undefined' && process.env?.USE_MOCK === '1') {
    return true
  }

  // Check localStorage (client-side)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('USE_MOCK') === '1'
  }

  return false
}

/**
 * Enable mock mode (client-side only)
 */
export function enableMockMode(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('USE_MOCK', '1')
    console.log('✓ Mock mode enabled. All API calls will use simulated data.')
  }
}

/**
 * Disable mock mode (client-side only)
 */
export function disableMockMode(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('USE_MOCK')
    console.log('✓ Mock mode disabled. API calls will use real services.')
  }
}

/**
 * Get mock mode status
 */
export function getMockModeStatus(): {
  enabled: boolean
  source: 'environment' | 'localStorage' | 'disabled'
} {
  if (typeof process !== 'undefined' && process.env?.USE_MOCK === '1') {
    return { enabled: true, source: 'environment' }
  }

  if (typeof window !== 'undefined' && localStorage.getItem('USE_MOCK') === '1') {
    return { enabled: true, source: 'localStorage' }
  }

  return { enabled: false, source: 'disabled' }
}
