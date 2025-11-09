import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  handleError,
  requireEnv,
  parseBody,
  ErrorCodes,
} from '@/lib/api/utils'
import { qlayExecuteSchema } from '@/lib/api/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, qlayExecuteSchema)

    const apiKey = requireEnv('QLAY_API_KEY')
    const apiUrl = process.env.QLAY_API_URL || 'https://api.qlay.ai/v1'

    const response = await fetch(`${apiUrl}/workflows/${body.workflowId}/execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: body.input,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return errorResponse(
        ErrorCodes.EXTERNAL_API_ERROR,
        `Qlay API error: ${error.message || 'Unknown error'}`,
        response.status
      )
    }

    const data = await response.json()

    const normalized = {
      executionId: data.id || data.executionId,
      status: data.status,
      output: data.output,
      startedAt: data.startedAt,
      completedAt: data.completedAt,
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
