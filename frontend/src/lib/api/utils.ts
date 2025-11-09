import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// Normalized API response type
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata?: {
    timestamp: string
    requestId?: string
  }
}

// Error codes
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT: 'RATE_LIMIT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  MISSING_CONFIG: 'MISSING_CONFIG',
} as const

// Success response helper
export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  )
}

// Error response helper
export function errorResponse(
  code: string,
  message: string,
  status = 500,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  )
}

// Handle Zod validation errors
export function handleValidationError(error: ZodError): NextResponse<ApiResponse> {
  return errorResponse(
    ErrorCodes.VALIDATION_ERROR,
    'Validation failed',
    400,
    error.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }))
  )
}

// Generic error handler
export function handleError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)

  if (error instanceof ZodError) {
    return handleValidationError(error)
  }

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      return errorResponse(ErrorCodes.AUTHENTICATION_ERROR, error.message, 401)
    }

    if (error.message.includes('not found')) {
      return errorResponse(ErrorCodes.NOT_FOUND, error.message, 404)
    }

    if (error.message.includes('rate limit')) {
      return errorResponse(ErrorCodes.RATE_LIMIT, error.message, 429)
    }

    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500)
  }

  return errorResponse(ErrorCodes.INTERNAL_ERROR, 'An unexpected error occurred', 500)
}

// Check required environment variables
export function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

// Validate request method
export function validateMethod(
  request: Request,
  allowedMethods: string[]
): NextResponse<ApiResponse> | null {
  if (!allowedMethods.includes(request.method)) {
    return errorResponse(
      ErrorCodes.VALIDATION_ERROR,
      `Method ${request.method} not allowed`,
      405
    )
  }
  return null
}

// Parse and validate request body
export async function parseBody<T>(request: Request, schema: any): Promise<T> {
  const body = await request.json()
  return schema.parse(body)
}

// CORS headers for webhooks
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}
