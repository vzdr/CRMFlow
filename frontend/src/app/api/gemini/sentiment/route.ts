import { NextRequest, NextResponse } from 'next/server'
import { serverSecrets, validateRequiredSecrets } from '@/config/secrets'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text } = body || {}

    if (!text) {
      return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 })
    }

    // Ensure Gemini is configured
    validateRequiredSecrets(['gemini'])
    const apiKey = serverSecrets.gemini.apiKey()

    // Call Google Gemini API for sentiment analysis
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

    const prompt = `Analyze the sentiment of the following text and respond with ONLY a JSON object in this exact format:
{
  "sentiment": "positive" or "negative" or "neutral",
  "score": a number between 0 and 1 (0=very negative, 0.5=neutral, 1=very positive),
  "magnitude": a number between 0 and 1 indicating the strength of the sentiment,
  "analysis": a brief explanation
}

Text to analyze: "${text}"

Respond with ONLY the JSON object, no other text.`

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 1,
        topP: 1,
        maxOutputTokens: 256,
      },
    }

    const res = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Gemini API error:', errorText)
      return NextResponse.json(
        { error: `Gemini API request failed: ${res.status}` },
        { status: 502 }
      )
    }

    const data = await res.json()

    // Parse Gemini response
    const responseText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

    // Extract JSON from response (Gemini might wrap it in markdown code blocks)
    let jsonText = responseText.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '')
    }

    let result
    try {
      result = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', jsonText)
      // Fallback to basic sentiment
      result = {
        sentiment: 'neutral',
        score: 0.5,
        magnitude: 0.5,
        analysis: 'Unable to parse sentiment response',
      }
    }

    // Validate and normalize the response
    const sentiment = ['positive', 'negative', 'neutral'].includes(
      result.sentiment
    )
      ? result.sentiment
      : 'neutral'
    const score =
      typeof result.score === 'number'
        ? Math.max(0, Math.min(1, result.score))
        : 0.5
    const magnitude =
      typeof result.magnitude === 'number'
        ? Math.max(0, Math.min(1, result.magnitude))
        : 0.5
    const analysis =
      typeof result.analysis === 'string'
        ? result.analysis
        : 'No analysis available'

    return NextResponse.json({
      sentiment,
      score,
      magnitude,
      analysis,
    })
  } catch (error: any) {
    console.error('Sentiment analysis error:', error)
    const msg = error?.message || 'Sentiment analysis error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
