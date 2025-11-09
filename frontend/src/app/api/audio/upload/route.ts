import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  handleError,
  requireEnv,
  ErrorCodes,
} from '@/lib/api/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Fallback for chunked audio uploads (when WebRTC not available)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const chunkIndex = formData.get('chunkIndex') as string
    const totalChunks = formData.get('totalChunks') as string
    const sessionId = formData.get('sessionId') as string

    if (!audioFile || !sessionId) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'audio and sessionId are required',
        400
      )
    }

    const geminiKey = requireEnv('GEMINI_API_KEY')

    // Convert audio to base64
    const arrayBuffer = await audioFile.arrayBuffer()
    const audioBase64 = Buffer.from(arrayBuffer).toString('base64')

    // Send to Gemini for transcription
    // Note: Gemini doesn't support audio directly, you'd use Google Speech-to-Text
    // This is a placeholder showing the structure

    const response = {
      sessionId,
      chunkIndex: parseInt(chunkIndex || '0'),
      totalChunks: parseInt(totalChunks || '1'),
      transcript: {
        text: '[Transcribed text from chunk...]',
        confidence: 0.95,
        timestamp: Date.now(),
      },
      audioProcessed: audioFile.size,
    }

    return successResponse(response)
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
