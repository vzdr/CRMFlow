/**
 * Google Services Mock
 *
 * Simulates Google Sheets and Calendar API services for development and testing
 */

export interface GoogleSheetRow {
  [column: string]: string | number
}

export interface GoogleCalendarEvent {
  id: string
  summary: string
  description: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees: Array<{
    email: string
    responseStatus: string
  }>
  status: string
  htmlLink: string
  created: Date
}

/**
 * Simulates reading data from a Google Sheet
 * Returns deterministic sample data
 */
export function googleReadSheetMock(
  spreadsheetId: string,
  range: string = 'A1:Z100',
  sheetName?: string
): GoogleSheetRow[] {
  // Return interview questions if sheetName indicates screening questions
  if (sheetName?.toLowerCase().includes('screening') || sheetName?.toLowerCase().includes('question')) {
    return [
      {
        Question: 'Can you tell me about your experience with modern web development frameworks like React, Vue, or Angular?',
        Category: 'Technical',
        Weight: 3,
      },
      {
        Question: 'Describe a challenging technical problem you\'ve solved recently. What was the problem, and how did you approach finding a solution?',
        Category: 'Problem Solving',
        Weight: 4,
      },
      {
        Question: 'Tell me about your experience working in a team. How do you handle code reviews and collaborate with other developers?',
        Category: 'Teamwork',
        Weight: 3,
      },
      {
        Question: 'What interests you most about this position and our company?',
        Category: 'Culture Fit',
        Weight: 2,
      },
      {
        Question: 'How do you stay current with new technologies and best practices in software development?',
        Category: 'Learning',
        Weight: 2,
      },
    ]
  }

  // Default mock data for general spreadsheets
  const mockData: GoogleSheetRow[] = [
    {
      Name: 'John Smith',
      Email: 'john@example.com',
      Phone: '+1-555-0101',
      Company: 'Acme Corp',
      Status: 'Active',
      Score: 85,
    },
    {
      Name: 'Sarah Johnson',
      Email: 'sarah@techstart.io',
      Phone: '+1-555-0202',
      Company: 'TechStart Inc',
      Status: 'Pending',
      Score: 92,
    },
    {
      Name: 'Michael Chen',
      Email: 'mchen@logistics.com',
      Phone: '+1-555-0303',
      Company: 'Global Logistics',
      Status: 'Active',
      Score: 78,
    },
    {
      Name: 'Emily Rodriguez',
      Email: 'emily.r@innovative.com',
      Phone: '+1-555-0404',
      Company: 'Innovative Solutions',
      Status: 'Active',
      Score: 88,
    },
  ]

  return mockData
}

/**
 * Simulates writing data to a Google Sheet
 */
export function googleWriteSheetMock(
  spreadsheetId: string,
  range: string,
  values: any[][]
): { updatedCells: number; updatedRows: number } {
  return {
    updatedCells: values.reduce((sum, row) => sum + row.length, 0),
    updatedRows: values.length,
  }
}

/**
 * Simulates creating a Google Calendar event
 * Returns deterministic sample data
 */
export function googleCreateEventMock(eventDetails: {
  summary: string
  description?: string
  startDateTime: string
  endDateTime?: string
  attendees?: string[]
  timeZone?: string
}): GoogleCalendarEvent {
  const eventId = 'evt_' + Math.random().toString(36).substring(2, 15)
  const timeZone = eventDetails.timeZone || 'America/Los_Angeles'

  // If end time not provided, default to 1 hour after start
  const startTime = new Date(eventDetails.startDateTime)
  const endTime = eventDetails.endDateTime
    ? new Date(eventDetails.endDateTime)
    : new Date(startTime.getTime() + 60 * 60 * 1000)

  return {
    id: eventId,
    summary: eventDetails.summary,
    description: eventDetails.description || '',
    start: {
      dateTime: startTime.toISOString(),
      timeZone,
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone,
    },
    attendees:
      eventDetails.attendees?.map((email) => ({
        email,
        responseStatus: 'needsAction',
      })) || [],
    status: 'confirmed',
    htmlLink: `https://calendar.google.com/event?eid=${eventId}`,
    created: new Date(),
  }
}

/**
 * Simulates listing Google Calendar events
 */
export function googleListEventsMock(
  calendarId: string = 'primary',
  timeMin?: string,
  timeMax?: string
): GoogleCalendarEvent[] {
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  return [
    {
      id: 'evt_001',
      summary: 'Team Standup',
      description: 'Daily team sync',
      start: {
        dateTime: tomorrow.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: new Date(tomorrow.getTime() + 30 * 60 * 1000).toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      attendees: [
        { email: 'team@company.com', responseStatus: 'accepted' },
      ],
      status: 'confirmed',
      htmlLink: 'https://calendar.google.com/event?eid=evt_001',
      created: new Date(),
    },
    {
      id: 'evt_002',
      summary: 'Client Demo',
      description: 'Product demonstration for Acme Corp',
      start: {
        dateTime: nextWeek.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: new Date(nextWeek.getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      attendees: [
        { email: 'john@acme.com', responseStatus: 'needsAction' },
      ],
      status: 'confirmed',
      htmlLink: 'https://calendar.google.com/event?eid=evt_002',
      created: new Date(),
    },
  ]
}

/**
 * Simulates updating a Google Calendar event
 */
export function googleUpdateEventMock(
  eventId: string,
  updates: Partial<GoogleCalendarEvent>
): GoogleCalendarEvent {
  const now = new Date()
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)

  return {
    id: eventId,
    summary: updates.summary || 'Updated Event',
    description: updates.description || '',
    start: updates.start || {
      dateTime: now.toISOString(),
      timeZone: 'America/Los_Angeles',
    },
    end: updates.end || {
      dateTime: oneHourLater.toISOString(),
      timeZone: 'America/Los_Angeles',
    },
    attendees: updates.attendees || [],
    status: updates.status || 'confirmed',
    htmlLink: `https://calendar.google.com/event?eid=${eventId}`,
    created: new Date(),
  }
}

/**
 * Simulates appending data to a Google Sheet
 */
export function googleAppendSheetMock(
  spreadsheetId: string,
  range: string,
  values: any[][]
) {
  return {
    spreadsheetId,
    tableRange: range,
    updates: {
      updatedCells: values.reduce((sum, row) => sum + row.length, 0),
      updatedRows: values.length,
      updatedRange: `${range}!A${values.length + 1}:Z${values.length + values.length}`,
    },
  }
}
