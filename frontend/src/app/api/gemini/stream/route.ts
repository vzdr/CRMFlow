import { NextRequest } from 'next/server'
import { handleError, requireEnv, parseBody } from '@/lib/api/utils'
import { geminiStreamSchema } from '@/lib/api/schemas'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await parseBody(request, geminiStreamSchema)

    // Check API key
    const apiKey = requireEnv('GEMINI_API_KEY')

    // Call Gemini API with streaming
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?key=${apiKey}`,
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
        }),
      }
    )

    if (!response.ok) {
      return handleError(new Error(`Gemini API error: ${response.statusText}`))
    }

    // Stream the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader()
          if (!reader) {
            controller.close()
            return
          }

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            // Parse and forward chunks
            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split('\n').filter((line) => line.trim())

            for (const line of lines) {
              try {
                const json = JSON.parse(line)
                const text = json.candidates?.[0]?.content?.parts?.[0]?.text
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }

          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
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
