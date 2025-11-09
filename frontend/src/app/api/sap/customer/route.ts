import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  handleError,
  requireEnv,
  parseBody,
  ErrorCodes,
} from '@/lib/api/utils'
import { sapGetCustomerSchema } from '@/lib/api/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, sapGetCustomerSchema)

    const sapUrl = requireEnv('SAP_SERVICE_LAYER_URL')
    const sapUser = requireEnv('SAP_USERNAME')
    const sapPassword = requireEnv('SAP_PASSWORD')

    // First, login to get session
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

    // Build query
    let query = ''
    if (body.customerId) {
      query = `?$filter=CardCode eq '${body.customerId}'`
    } else if (body.companyName) {
      query = `?$filter=contains(CardName, '${body.companyName}')`
    }

    // Get customer data
    const response = await fetch(`${sapUrl}/BusinessPartners${query}`, {
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

    // Normalize response
    const customers = data.value || [data]
    const normalized = {
      customers: customers.map((customer: any) => ({
        id: customer.CardCode,
        name: customer.CardName,
        email: customer.EmailAddress,
        phone: customer.Phone1,
        address: {
          street: customer.Address,
          city: customer.City,
          country: customer.Country,
          zipCode: customer.ZipCode,
        },
        balance: customer.CurrentAccountBalance,
        creditLimit: customer.CreditLimit,
        raw: customer,
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
