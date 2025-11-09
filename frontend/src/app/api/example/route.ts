/**
 * Example API Route Handler
 *
 * This demonstrates how to properly use server-side secrets in API routes.
 * Server-side secrets are NEVER exposed to the client.
 */

import { NextRequest, NextResponse } from 'next/server'
import { serverSecrets, validateRequiredSecrets, isServiceConfigured } from '@/config/secrets'

/**
 * GET /api/example
 *
 * Example endpoint showing how to use server-side configuration
 */
export async function GET(request: NextRequest) {
  try {
    // Example: Check which services are configured
    const serviceStatus = {
      gemini: isServiceConfigured('gemini'),
      twilio: isServiceConfigured('twilio'),
      elevenlabs: isServiceConfigured('elevenlabs'),
      sap: isServiceConfigured('sap'),
      google: isServiceConfigured('google'),
      qlay: isServiceConfigured('qlay'),
    }

    return NextResponse.json({
      message: 'API configuration check',
      services: serviceStatus,
      note: 'API keys are never exposed to the client',
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/example
 *
 * Example endpoint showing how to validate and use secrets
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { service } = body

    // Example: Validate required secrets before using them
    if (service === 'gemini') {
      validateRequiredSecrets(['gemini'])

      // Now safe to use the secrets
      const apiKey = serverSecrets.gemini.apiKey()

      // In production, you would make actual API calls here
      // Example: const response = await callGeminiAPI(apiKey, prompt)

      return NextResponse.json({
        message: 'Gemini service configured',
        // NEVER return the actual API key
        keyConfigured: !!apiKey,
      })
    }

    if (service === 'twilio') {
      validateRequiredSecrets(['twilio'])

      const { accountSid, authToken, phoneNumber } = {
        accountSid: serverSecrets.twilio.accountSid(),
        authToken: serverSecrets.twilio.authToken(),
        phoneNumber: serverSecrets.twilio.phoneNumber(),
      }

      // In production, initialize Twilio client here
      // const client = twilio(accountSid, authToken)

      return NextResponse.json({
        message: 'Twilio service configured',
        phoneNumber, // Phone number is safe to return
        // NEVER return accountSid or authToken
      })
    }

    return NextResponse.json({
      error: 'Unknown service',
    }, { status: 400 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing required')) {
      return NextResponse.json(
        {
          error: 'Service not configured',
          message: error.message,
        },
        { status: 503 }
      )
    }

    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
