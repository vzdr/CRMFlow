import { NextRequest } from 'next/server'
import { handleError, requireEnv, ErrorCodes, errorResponse } from '@/lib/api/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// WebSocket-style streaming for audio
// Note: Vercel Edge doesn't support WebSockets, so we use SSE (Server-Sent Events)
// For true WebSocket, you'd need a separate WebSocket server

interface StreamSession {
  sessionId: string
  audioChunks: ArrayBuffer[]
  transcripts: { text: string; isFinal: boolean; timestamp: number }[]
  startTime: number
}

const activeSessions = new Map<string, StreamSession>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, audioData, action } = body

    if (!sessionId) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'sessionId is required', 400)
    }

    // Handle different actions
    if (action === 'start') {
      // Initialize new streaming session
      activeSessions.set(sessionId, {
        sessionId,
        audioChunks: [],
        transcripts: [],
        startTime: Date.now(),
      })

      return new Response(
        JSON.stringify({
          success: true,
          data: { sessionId, status: 'started' },
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (action === 'chunk') {
      // Add audio chunk to session
      const session = activeSessions.get(sessionId)
      if (!session) {
        return errorResponse(ErrorCodes.NOT_FOUND, 'Session not found', 404)
      }

      if (audioData) {
        const buffer = Buffer.from(audioData, 'base64')
        session.audioChunks.push(buffer)

        // Process audio chunk (send to Gemini for transcription)
        try {
          const geminiKey = requireEnv('GEMINI_API_KEY')

          // For real-time transcription, you'd use Google Speech-to-Text
          // Here's a placeholder that shows the structure
          const transcript = {
            text: '[Interim transcript...]',
            isFinal: false,
            timestamp: Date.now(),
          }

          session.transcripts.push(transcript)

          return new Response(
            JSON.stringify({
              success: true,
              data: {
                sessionId,
                transcript,
                audioProcessed: session.audioChunks.length,
              },
            }),
            {
              headers: { 'Content-Type': 'application/json' },
            }
          )
        } catch (error) {
          console.error('Audio processing error:', error)
          return errorResponse(
            ErrorCodes.INTERNAL_ERROR,
            'Failed to process audio chunk',
            500
          )
        }
      }

      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'audioData is required for chunk action', 400)
    }

    if (action === 'end') {
      // Finalize session
      const session = activeSessions.get(sessionId)
      if (!session) {
        return errorResponse(ErrorCodes.NOT_FOUND, 'Session not found', 404)
      }

      const duration = Date.now() - session.startTime
      activeSessions.delete(sessionId)

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            sessionId,
            status: 'ended',
            duration,
            totalChunks: session.audioChunks.length,
            transcripts: session.transcripts,
          },
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid action', 400)
  } catch (error) {
    return handleError(error)
  }
}

// Stream transcripts (SSE endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, 'sessionId is required', 400)
    }

    const session = activeSessions.get(sessionId)
    if (!session) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Session not found', 404)
    }

    // Create SSE stream for transcripts
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Send existing transcripts
        session.transcripts.forEach((transcript) => {
          const data = `data: ${JSON.stringify(transcript)}\n\n`
          controller.enqueue(encoder.encode(data))
        })

        // Keep connection alive and send new transcripts
        const interval = setInterval(() => {
          const currentSession = activeSessions.get(sessionId)
          if (!currentSession) {
            clearInterval(interval)
            controller.close()
            return
          }

          // Send heartbeat
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        }, 5000)

        // Cleanup after 5 minutes
        setTimeout(() => {
          clearInterval(interval)
          controller.close()
        }, 5 * 60 * 1000)
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
