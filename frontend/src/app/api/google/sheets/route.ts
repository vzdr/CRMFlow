import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  handleError,
  requireEnv,
  parseBody,
  ErrorCodes,
} from '@/lib/api/utils'
import { googleSheetsReadSchema, googleSheetsWriteSchema } from '@/lib/api/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const spreadsheetId = searchParams.get('spreadsheetId')
    const range = searchParams.get('range')

    if (!spreadsheetId || !range) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'spreadsheetId and range are required',
        400
      )
    }

    const accessToken = requireEnv('GOOGLE_SHEETS_ACCESS_TOKEN')

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return errorResponse(
        ErrorCodes.EXTERNAL_API_ERROR,
        `Google Sheets API error: ${error.error?.message || 'Unknown error'}`,
        response.status
      )
    }

    const data = await response.json()

    const normalized = {
      range: data.range,
      values: data.values || [],
      rowCount: data.values?.length || 0,
      raw: data,
    }

    return successResponse(normalized)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, googleSheetsWriteSchema)

    const accessToken = requireEnv('GOOGLE_SHEETS_ACCESS_TOKEN')

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${body.spreadsheetId}/values/${body.range}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: body.values,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return errorResponse(
        ErrorCodes.EXTERNAL_API_ERROR,
        `Google Sheets API error: ${error.error?.message || 'Unknown error'}`,
        response.status
      )
    }

    const data = await response.json()

    const normalized = {
      updatedRange: data.updatedRange,
      updatedRows: data.updatedRows,
      updatedColumns: data.updatedColumns,
      updatedCells: data.updatedCells,
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
