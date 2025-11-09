import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  handleError,
  requireEnv,
  parseBody,
  ErrorCodes,
} from '@/lib/api/utils'
import { sapGetInventorySchema } from '@/lib/api/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, sapGetInventorySchema)

    const sapUrl = requireEnv('SAP_SERVICE_LAYER_URL')
    const sapUser = requireEnv('SAP_USERNAME')
    const sapPassword = requireEnv('SAP_PASSWORD')

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

    let query = ''
    if (body.itemCode) {
      query = `?$filter=ItemCode eq '${body.itemCode}'`
    }
    if (body.warehouseCode) {
      query += query ? ` and WarehouseCode eq '${body.warehouseCode}'` : `?$filter=WarehouseCode eq '${body.warehouseCode}'`
    }

    const response = await fetch(`${sapUrl}/Items${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `B1SESSION=${sessionId}`,
      },
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

    const items = data.value || [data]
    const normalized = {
      items: items.map((item: any) => ({
        itemCode: item.ItemCode,
        itemName: item.ItemName,
        quantity: item.QuantityOnStock,
        committed: item.IsCommited,
        available: item.QuantityOnStock - (item.IsCommited || 0),
        price: item.Price,
        raw: item,
      })),
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
