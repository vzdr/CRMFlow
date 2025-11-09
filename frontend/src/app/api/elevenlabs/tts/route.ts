import { NextRequest, NextResponse } from 'next/server'
import { serverSecrets, validateRequiredSecrets, isServiceConfigured } from '@/config/secrets'

// POST: returns a playable URL for generated audio
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text, voiceId, stability, similarityBoost } = body || {}

    if (!text || !voiceId) {
      return NextResponse.json({ error: 'Missing text or voiceId' }, { status: 400 })
    }

    // Build a URL to our streaming GET endpoint
    const params = new URLSearchParams({
      text: String(text),
      voiceId: String(voiceId),
      stability: String(typeof stability === 'number' ? stability : 0.5),
      similarityBoost: String(typeof similarityBoost === 'number' ? similarityBoost : 0.75),
    })

    const audioUrl = `/api/elevenlabs/tts?${params.toString()}`
    return NextResponse.json({ audioUrl })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// GET: streams ElevenLabs audio (audio/mpeg) for use as <audio src>
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const text = searchParams.get('text')
    const voiceId = searchParams.get('voiceId')
    const stability = Number(searchParams.get('stability') ?? '0.5')
    const similarityBoost = Number(searchParams.get('similarityBoost') ?? '0.75')

    if (!text || !voiceId) {
      return new NextResponse('Missing text or voiceId', { status: 400 })
    }

    // Ensure ElevenLabs is configured
    validateRequiredSecrets(['elevenlabs'])
    const apiKey = serverSecrets.elevenlabs.apiKey()

    // Call ElevenLabs TTS and stream the response
    const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`
    const payload = {
      text,
      voice_settings: {
        stability: isFinite(stability) ? stability : 0.5,
        similarity_boost: isFinite(similarityBoost) ? similarityBoost : 0.75,
      },
    }

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      return new NextResponse(`TTS request failed: ${res.status} ${text}`, { status: 502 })
    }

    const readable = res.body
    if (!readable) {
      return new NextResponse('No audio stream', { status: 502 })
    }

    return new NextResponse(readable as any, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error: any) {
    const msg = error?.message || 'TTS error'
    return new NextResponse(msg, { status: 500 })
  }
}

