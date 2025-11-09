/**
 * Twilio Mock Service
 *
 * Simulates Twilio telephony services for development and testing
 */

export interface TwilioInboundCallData {
  callSid: string
  from: string
  to: string
  callStatus: string
  direction: string
  timestamp: Date
}

export interface TwilioOutboundCallData {
  callSid: string
  to: string
  from: string
  status: string
  duration: number
  timestamp: Date
}

/**
 * Simulates an inbound call from Twilio
 * Returns deterministic sample data
 */
export function twilioInboundSim(): TwilioInboundCallData {
  return {
    callSid: 'CA' + Math.random().toString(36).substring(2, 15).toUpperCase(),
    from: '+14155551234',
    to: '+14155556789',
    callStatus: 'ringing',
    direction: 'inbound',
    timestamp: new Date(),
  }
}

/**
 * Simulates making an outbound call via Twilio
 * Returns deterministic sample data
 */
export function twilioOutboundSim(phoneNumber: string): TwilioOutboundCallData {
  return {
    callSid: 'CA' + Math.random().toString(36).substring(2, 15).toUpperCase(),
    to: phoneNumber,
    from: '+14155556789',
    status: 'initiated',
    duration: 0,
    timestamp: new Date(),
  }
}

/**
 * Simulates receiving SMS via Twilio
 */
export function twilioSmsInboundSim() {
  return {
    messageSid: 'SM' + Math.random().toString(36).substring(2, 15).toUpperCase(),
    from: '+14155551234',
    to: '+14155556789',
    body: 'Hello, I would like to inquire about your services.',
    timestamp: new Date(),
  }
}

/**
 * Simulates sending SMS via Twilio
 */
export function twilioSmsOutboundSim(to: string, message: string) {
  return {
    messageSid: 'SM' + Math.random().toString(36).substring(2, 15).toUpperCase(),
    to,
    from: '+14155556789',
    body: message,
    status: 'queued',
    timestamp: new Date(),
  }
}
