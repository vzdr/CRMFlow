import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  handleError,
  requireEnv,
  parseBody,
  ErrorCodes,
} from '@/lib/api/utils'
import { elevenlabsTtsSchema } from '@/lib/api/schemas'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await parseBody(request, elevenlabsTtsSchema)

    // Check API key
    const apiKey = requireEnv('ELEVENLABS_API_KEY')

    const voiceId = body.voiceId || 'pNInz6obpgDQGcFmaJgB' // Default voice (Adam)
    const modelId = body.modelId || 'eleven_turbo_v2_5'

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: body.text,
          model_id: modelId,
          voice_settings: {
            stability: body.stability ?? 0.5,
            similarity_boost: body.similarityBoost ?? 0.75,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return errorResponse(
        ErrorCodes.EXTERNAL_API_ERROR,
        `ElevenLabs API error: ${error}`,
        response.status
      )
    }

    // Get audio data
    const audioBuffer = await response.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString('base64')

    // Normalize response
    const normalized = {
      audioUrl: `data:audio/mpeg;base64,${audioBase64}`,
      audioBase64,
      format: 'mp3',
      voiceId,
      modelId,
      charactersUsed: body.text.length,
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
