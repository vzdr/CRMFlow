'use client'

import { useState, useCallback } from 'react'
import { useSettingsStore } from '@/lib/stores/settingsStore'

interface CallLeg {
  id: string
  timestamp: string
  speaker: 'user' | 'ai'
  text: string
  audioUrl?: string
}

export default function VoiceLabDrawer() {
  const { voiceLabOpen, closeVoiceLab, useMocks } = useSettingsStore()
  const [promptText, setPromptText] = useState('')
  const [voice, setVoice] = useState('alloy')
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [callLegs, setCallLegs] = useState<CallLeg[]>([])
  const [currentLegText, setCurrentLegText] = useState('')
  const [currentSpeaker, setCurrentSpeaker] = useState<'user' | 'ai'>('user')

  // Generate mock audio using Web Audio API
  const generateMockAudio = useCallback(async (text: string): Promise<string> => {
    return new Promise((resolve) => {
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Calculate duration based on text length (roughly 150 words per minute)
      const wordCount = text.split(/\s+/).length
      const duration = Math.max(1, (wordCount / 150) * 60) // minimum 1 second

      // Create buffer
      const sampleRate = audioContext.sampleRate
      const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate)
      const data = buffer.getChannelData(0)

      // Generate a simple tone pattern to simulate speech
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate
        // Create a varying tone to simulate speech patterns
        const freq = 200 + Math.sin(t * 3) * 50 + Math.random() * 20
        data[i] = Math.sin(2 * Math.PI * freq * t) * 0.1 * (Math.sin(t * 10) * 0.5 + 0.5)

        // Add some noise for realism
        data[i] += (Math.random() - 0.5) * 0.02

        // Fade in/out
        if (i < sampleRate * 0.1) {
          data[i] *= i / (sampleRate * 0.1)
        } else if (i > data.length - sampleRate * 0.1) {
          data[i] *= (data.length - i) / (sampleRate * 0.1)
        }
      }

      // Convert to WAV blob
      const wavBlob = audioBufferToWav(buffer)
      const url = URL.createObjectURL(wavBlob)
      resolve(url)
    })
  }, [])

  // Convert AudioBuffer to WAV blob
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44
    const arrayBuffer = new ArrayBuffer(length)
    const view = new DataView(arrayBuffer)
    const channels = []
    let offset = 0
    let pos = 0

    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true)
      pos += 2
    }
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true)
      pos += 4
    }

    // "RIFF" chunk descriptor
    setUint32(0x46464952) // "RIFF"
    setUint32(length - 8) // file length - 8
    setUint32(0x45564157) // "WAVE"

    // "fmt " sub-chunk
    setUint32(0x20746d66) // "fmt "
    setUint32(16) // chunk length
    setUint16(1) // audio format (PCM)
    setUint16(buffer.numberOfChannels)
    setUint32(buffer.sampleRate)
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels) // byte rate
    setUint16(buffer.numberOfChannels * 2) // block align
    setUint16(16) // bits per sample

    // "data" sub-chunk
    setUint32(0x61746164) // "data"
    setUint32(length - pos - 4) // chunk length

    // Write interleaved data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i))
    }

    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        const sample = Math.max(-1, Math.min(1, channels[i][offset]))
        view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
        pos += 2
      }
      offset++
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }

  // Handle TTS preview
  const handleGenerateTTS = useCallback(async () => {
    if (!promptText.trim()) return

    setIsGenerating(true)
    setAudioUrl(null)

    try {
      if (useMocks) {
        // Mock mode: generate synthetic audio
        await new Promise((resolve) => setTimeout(resolve, 500))
        const mockUrl = await generateMockAudio(promptText)
        setAudioUrl(mockUrl)
        console.log('🎤 [Mock] TTS generated:', promptText)
      } else {
        // Real mode: call actual API
        const response = await fetch('/api/elevenlabs/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: promptText,
            voice: voice,
          }),
        })

        if (!response.ok) {
          throw new Error('TTS generation failed')
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        console.log('🎤 TTS generated successfully')
      }
    } catch (error) {
      console.error('TTS generation error:', error)
      alert('Failed to generate TTS. Check console for details.')
    } finally {
      setIsGenerating(false)
    }
  }, [promptText, voice, useMocks, generateMockAudio])

  // Handle prompt file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setPromptText(text)
    }
    reader.readAsText(file)
  }, [])

  // Add call leg to simulation
  const handleAddCallLeg = useCallback(() => {
    if (!currentLegText.trim()) return

    const newLeg: CallLeg = {
      id: `leg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      speaker: currentSpeaker,
      text: currentLegText,
    }

    setCallLegs((prev) => [...prev, newLeg])
    setCurrentLegText('')
  }, [currentLegText, currentSpeaker])

  // Play entire call simulation
  const handlePlaySimulation = useCallback(async () => {
    if (callLegs.length === 0) return

    console.log('🎯 Playing call simulation with', callLegs.length, 'legs')

    for (const leg of callLegs) {
      console.log(`[${leg.timestamp}] ${leg.speaker.toUpperCase()}: ${leg.text}`)

      try {
        if (useMocks) {
          // Mock: generate and play synthetic audio
          const mockUrl = await generateMockAudio(leg.text)
          const audio = new Audio(mockUrl)
          await audio.play()
          await new Promise((resolve) => {
            audio.onended = resolve
          })
        } else {
          // Real: generate TTS for each leg
          const response = await fetch('/api/elevenlabs/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: leg.text,
              voice: leg.speaker === 'ai' ? voice : 'echo',
            }),
          })

          if (response.ok) {
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const audio = new Audio(url)
            await audio.play()
            await new Promise((resolve) => {
              audio.onended = resolve
            })
          }
        }
      } catch (error) {
        console.error('Error playing leg:', error)
      }
    }

    console.log('✅ Call simulation completed')
  }, [callLegs, voice, useMocks, generateMockAudio])

  // Clear call simulation
  const handleClearSimulation = useCallback(() => {
    setCallLegs([])
  }, [])

  if (!voiceLabOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeVoiceLab}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[500px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🎙️ Voice Lab
          </h2>
          <button
            onClick={closeVoiceLab}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* TTS Preview Section */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              🔊 TTS Preview
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prompt Text
              </label>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Enter text to preview TTS..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-300">Voice:</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="alloy">Alloy (Neutral)</option>
                <option value="echo">Echo (Male)</option>
                <option value="fable">Fable (British)</option>
                <option value="onyx">Onyx (Deep)</option>
                <option value="nova">Nova (Female)</option>
                <option value="shimmer">Shimmer (Soft)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleGenerateTTS}
                disabled={isGenerating || !promptText.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
              >
                {isGenerating ? 'Generating...' : 'Generate TTS'}
              </button>

              <label className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium cursor-pointer transition-colors flex items-center justify-center">
                📁 Upload
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {audioUrl && (
              <div className="pt-2">
                <audio
                  src={audioUrl}
                  controls
                  className="w-full"
                  style={{ height: '40px' }}
                />
              </div>
            )}

            {useMocks && (
              <div className="text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-700/50 rounded px-2 py-1">
                🧪 Mock mode active - TTS simulation only
              </div>
            )}
          </div>

          {/* Call Simulation Section */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              📞 Call Simulation
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Add Call Leg
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setCurrentSpeaker('user')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    currentSpeaker === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  👤 User
                </button>
                <button
                  onClick={() => setCurrentSpeaker('ai')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    currentSpeaker === 'ai'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🤖 AI
                </button>
              </div>
              <textarea
                value={currentLegText}
                onChange={(e) => setCurrentLegText(e.target.value)}
                placeholder={`Enter ${currentSpeaker} message...`}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
              />
              <button
                onClick={handleAddCallLeg}
                disabled={!currentLegText.trim()}
                className="w-full mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
              >
                + Add Leg
              </button>
            </div>

            {/* Call legs list */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {callLegs.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No call legs added yet
                </div>
              ) : (
                callLegs.map((leg, index) => (
                  <div
                    key={leg.id}
                    className={`p-3 rounded border ${
                      leg.speaker === 'user'
                        ? 'bg-green-900/20 border-green-700/50'
                        : 'bg-purple-900/20 border-purple-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-400">
                        #{index + 1} - {leg.speaker === 'user' ? '👤 User' : '🤖 AI'} - {leg.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-white">{leg.text}</p>
                  </div>
                ))
              )}
            </div>

            {callLegs.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handlePlaySimulation}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                >
                  ▶️ Play Simulation
                </button>
                <button
                  onClick={handleClearSimulation}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
                >
                  🗑️ Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
