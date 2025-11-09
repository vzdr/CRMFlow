import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Generic Webhook Handler
 *
 * Receives webhooks from external services and triggers flow execution.
 * Each webhook has a unique ID and optional signature validation.
 *
 * Usage:
 *   POST /api/hooks/{webhook-id}
 *
 * Headers (optional):
 *   X-Webhook-Signature: HMAC signature for validation
 *   X-Webhook-Timestamp: Timestamp to prevent replay attacks
 */

interface WebhookConfig {
  id: string
  name: string
  secret?: string
  enabled: boolean
  flowId?: string
}

// TODO: Move to database
const webhookConfigs: Record<string, WebhookConfig> = {
  'demo-webhook': {
    id: 'demo-webhook',
    name: 'Demo Webhook',
    enabled: true,
  },
  'customer-inquiry': {
    id: 'customer-inquiry',
    name: 'Customer Inquiry Webhook',
    secret: process.env.WEBHOOK_CUSTOMER_INQUIRY_SECRET,
    enabled: true,
  },
}

/**
 * Validate webhook signature using HMAC-SHA256
 */
function validateWebhookSignature(
  secret: string,
  signature: string,
  payload: string,
  timestamp?: string
): boolean {
  try {
    // Add timestamp to payload if provided (prevents replay attacks)
    const data = timestamp ? `${timestamp}.${payload}` : payload

    // Compute HMAC
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(data)
    const computedSignature = hmac.digest('hex')

    // Compare signatures (constant-time comparison)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    )
  } catch (error) {
    console.error('Webhook signature validation error:', error)
    return false
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const webhookId = params.id

    // Get webhook configuration
    const config = webhookConfigs[webhookId]

    if (!config) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }

    if (!config.enabled) {
      return NextResponse.json(
        { error: 'Webhook is disabled' },
        { status: 403 }
      )
    }

    // Parse payload
    const contentType = req.headers.get('content-type') || ''
    let payload: any
    let rawPayload: string

    if (contentType.includes('application/json')) {
      const text = await req.text()
      rawPayload = text
      payload = JSON.parse(text)
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData()
      payload = {}
      formData.forEach((value, key) => {
        payload[key] = value
      })
      rawPayload = JSON.stringify(payload)
    } else {
      rawPayload = await req.text()
      payload = { data: rawPayload }
    }

    // Validate signature if secret is configured
    if (config.secret) {
      const signature = req.headers.get('x-webhook-signature')
      const timestamp = req.headers.get('x-webhook-timestamp')

      if (!signature) {
        return NextResponse.json(
          { error: 'Missing webhook signature' },
          { status: 401 }
        )
      }

      // Check timestamp to prevent replay attacks (optional, 5 min window)
      if (timestamp) {
        const timestampMs = parseInt(timestamp, 10)
        const now = Date.now()
        const fiveMinutes = 5 * 60 * 1000

        if (Math.abs(now - timestampMs) > fiveMinutes) {
          return NextResponse.json(
            { error: 'Webhook timestamp too old or too far in future' },
            { status: 401 }
          )
        }
      }

      if (!validateWebhookSignature(config.secret, signature, rawPayload, timestamp || undefined)) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 403 }
        )
      }
    }

    // Extract headers for context
    const headers: Record<string, string> = {}
    req.headers.forEach((value, key) => {
      if (!key.startsWith(':')) {
        headers[key] = value
      }
    })

    // Log webhook
    console.log('Webhook received:', {
      id: webhookId,
      name: config.name,
      payload: payload,
    })

    // TODO: Trigger flow execution based on webhook configuration
    // For now, store the webhook event and return success

    // Return success response
    return NextResponse.json({
      success: true,
      webhookId,
      message: 'Webhook received successfully',
      receivedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET handler to check webhook status
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const webhookId = params.id
  const config = webhookConfigs[webhookId]

  if (!config) {
    return NextResponse.json(
      { error: 'Webhook not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    id: config.id,
    name: config.name,
    enabled: config.enabled,
    hasSecret: !!config.secret,
    endpoint: `/api/hooks/${webhookId}`,
  })
}
