import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  handleError,
  requireEnv,
  parseBody,
  ErrorCodes,
} from '@/lib/api/utils'
import { twilioCallSchema } from '@/lib/api/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, twilioCallSchema)

    const accountSid = requireEnv('TWILIO_ACCOUNT_SID')
    const authToken = requireEnv('TWILIO_AUTH_TOKEN')

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

    const formData = new URLSearchParams({
      To: body.to,
      From: body.from,
      ...(body.twiml ? { Twiml: body.twiml } : {}),
      ...(body.url ? { Url: body.url } : {}),
    })

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return errorResponse(
        ErrorCodes.EXTERNAL_API_ERROR,
        `Twilio API error: ${error.message}`,
        response.status
      )
    }

    const data = await response.json()

    const normalized = {
      callSid: data.sid,
      status: data.status,
      to: data.to,
      from: data.from,
      direction: data.direction,
      raw: data,
    }

    return successResponse(normalized)
  } catch (error) {
    return handleError(error)
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
