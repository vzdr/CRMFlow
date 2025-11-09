import { NextRequest, NextResponse } from 'next/server'
import { serverSecrets } from '@/config/secrets'
import crypto from 'crypto'

/**
 * Twilio Webhook Handler
 *
 * Receives inbound calls from Twilio and triggers flow execution.
 * Validates webhook signatures to ensure authenticity.
 *
 * See: https://www.twilio.com/docs/usage/webhooks/webhooks-security
 */

/**
 * Validate Twilio webhook signature
 * https://www.twilio.com/docs/usage/webhooks/webhooks-security#validating-signatures-from-twilio
 */
function validateTwilioSignature(
  authToken: string,
  twilioSignature: string,
  url: string,
  params: Record<string, any>
): boolean {
  try {
    // Create the signature validation string
    const data = Object.keys(params)
      .sort()
      .reduce((acc, key) => acc + key + params[key], url)

    // Compute the HMAC
    const hmac = crypto.createHmac('sha1', authToken)
    hmac.update(Buffer.from(data, 'utf-8'))
    const computedSignature = hmac.digest('base64')

    // Compare signatures (constant-time comparison to prevent timing attacks)
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature),
      Buffer.from(twilioSignature)
    )
  } catch (error) {
    console.error('Signature validation error:', error)
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse form data (Twilio sends application/x-www-form-urlencoded)
    const formData = await req.formData()
    const params: Record<string, any> = {}

    formData.forEach((value, key) => {
      params[key] = value
    })

    // Get Twilio signature from headers
    const twilioSignature = req.headers.get('x-twilio-signature')

    // Validate signature in production
    if (process.env.NODE_ENV === 'production') {
      if (!twilioSignature) {
        return NextResponse.json(
          { error: 'Missing Twilio signature' },
          { status: 401 }
        )
      }

      try {
        const authToken = serverSecrets.twilio.authToken()
        const url = req.url

        if (!validateTwilioSignature(authToken, twilioSignature, url, params)) {
          return NextResponse.json(
            { error: 'Invalid Twilio signature' },
            { status: 403 }
          )
        }
      } catch (error) {
        console.error('Twilio auth token not configured:', error)
        return NextResponse.json(
          { error: 'Twilio not configured' },
          { status: 500 }
        )
      }
    }

    // Extract call information
    const callData = {
      from: params.From || params.from,
      to: params.To || params.to,
      callSid: params.CallSid || params.callSid,
      accountSid: params.AccountSid || params.accountSid,
      direction: params.Direction || params.direction,
      forwardedFrom: params.ForwardedFrom || params.forwardedFrom,
      callerCountry: params.CallerCountry || params.callerCountry,
      callerState: params.CallerState || params.callerState,
      callerCity: params.CallerCity || params.callerCity,
      callerZip: params.CallerZip || params.callerZip,
    }

    // Log the incoming call
    console.log('Twilio webhook received:', {
      callSid: callData.callSid,
      from: callData.from,
      to: callData.to,
    })

    // TODO: Trigger flow execution based on phone number mapping
    // For now, we'll return TwiML to handle the call

    // Return TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for calling. Your call has been received and will be processed by our automated system.</Say>
  <Pause length="1"/>
  <Say voice="alice">Goodbye.</Say>
  <Hangup/>
</Response>`

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error: any) {
    console.error('Twilio webhook error:', error)

    // Return TwiML error response
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're sorry, but we encountered an error processing your call. Please try again later.</Say>
  <Hangup/>
</Response>`

    return new NextResponse(errorTwiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  }
}

/**
 * GET handler for webhook status/health check
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'twilio-webhook',
    message: 'Twilio webhook endpoint is active',
  })
}
