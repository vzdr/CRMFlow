import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  handleError,
  requireEnv,
  parseBody,
  ErrorCodes,
} from '@/lib/api/utils'
import { googleCalendarEventSchema } from '@/lib/api/schemas'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, googleCalendarEventSchema)

    const accessToken = requireEnv('GOOGLE_CALENDAR_ACCESS_TOKEN')
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

    const eventData = {
      summary: body.summary,
      description: body.description,
      start: {
        dateTime: body.startDateTime,
        timeZone: body.timeZone || 'UTC',
      },
      end: {
        dateTime: body.endDateTime,
        timeZone: body.timeZone || 'UTC',
      },
      attendees: body.attendees?.map((email) => ({ email })),
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return errorResponse(
        ErrorCodes.EXTERNAL_API_ERROR,
        `Google Calendar API error: ${error.error?.message || 'Unknown error'}`,
        response.status
      )
    }

    const data = await response.json()

    const normalized = {
      eventId: data.id,
      summary: data.summary,
      start: data.start.dateTime,
      end: data.end.dateTime,
      link: data.htmlLink,
      status: data.status,
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
