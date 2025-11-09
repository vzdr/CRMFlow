import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  handleError,
  requireEnv,
  parseBody,
  ErrorCodes,
} from '@/lib/api/utils'
import { geminiGenerateSchema } from '@/lib/api/schemas'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await parseBody(request, geminiGenerateSchema)

    // Check API key
    const apiKey = requireEnv('GEMINI_API_KEY')

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: body.context
                    ? `Context: ${JSON.stringify(body.context)}\n\n${body.prompt}`
                    : body.prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: body.temperature ?? 0.7,
            maxOutputTokens: body.maxTokens ?? 1024,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return errorResponse(
        ErrorCodes.EXTERNAL_API_ERROR,
        `Gemini API error: ${error.error?.message || 'Unknown error'}`,
        response.status
      )
    }

    const data = await response.json()

    // Normalize response to match node executor expectations
    const normalized = {
      text: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
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
