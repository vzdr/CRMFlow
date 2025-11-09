import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  handleError,
  requireEnv,
  parseBody,
  ErrorCodes,
} from '@/lib/api/utils'
import { sapCreateOrderSchema } from '@/lib/api/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, sapCreateOrderSchema)

    const sapUrl = requireEnv('SAP_SERVICE_LAYER_URL')
    const sapUser = requireEnv('SAP_USERNAME')
    const sapPassword = requireEnv('SAP_PASSWORD')

    // Login to SAP
    const loginResponse = await fetch(`${sapUrl}/Login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        UserName: sapUser,
        Password: sapPassword,
      }),
    })

    if (!loginResponse.ok) {
      throw new Error('SAP authentication failed')
    }

    const loginData = await loginResponse.json()
    const sessionId = loginData.SessionId

    // Create order
    const orderData = {
      CardCode: body.customerId,
      DocDate: new Date().toISOString().split('T')[0],
      DocDueDate: body.deliveryDate || new Date().toISOString().split('T')[0],
      DocumentLines: body.items.map((item) => ({
        ItemCode: item.itemCode,
        Quantity: item.quantity,
        UnitPrice: item.price,
      })),
    }

    const response = await fetch(`${sapUrl}/Orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `B1SESSION=${sessionId}`,
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const error = await response.json()
      return errorResponse(
        ErrorCodes.EXTERNAL_API_ERROR,
        `SAP API error: ${error.error?.message?.value || 'Unknown error'}`,
        response.status
      )
    }

    const data = await response.json()

    const normalized = {
      orderId: data.DocEntry,
      orderNumber: data.DocNum,
      customerId: data.CardCode,
      total: data.DocTotal,
      status: data.DocumentStatus,
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
