'use client'

import React, { useState } from 'react'

interface VoiceLabProps {
  isOpen: boolean
  onClose: () => void
}

const SAMPLE_PROMPTS = [
  {
    name: 'Sales Greeting',
    text: 'Hello! Thank you for calling Acme Sales. My name is Sarah, your AI sales assistant. How can I help you today?',
  },
  {
    name: 'Candidate Screening',
    text: 'Hi! Thank you for applying to our Software Engineer position. I\'m Alex, an AI screening assistant. Are you ready to begin the interview?',
  },
  {
    name: 'Customer Support',
    text: 'Thank you for contacting our support team. I\'m here to help resolve your issue as quickly as possible. Can you describe the problem you\'re experiencing?',
  },
  {
    name: 'Appointment Confirmation',
    text: 'This is a reminder about your upcoming appointment scheduled for tomorrow at 2 PM. Please reply to confirm or call us if you need to reschedule.',
  },
]

const VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Female, American)' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Male, American)' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Female, American)' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Male, American)' },
]

export default function VoiceLab({ isOpen, onClose }: VoiceLabProps) {
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id)
  const [stability, setStability] = useState(0.5)
  const [similarityBoost, setSimilarityBoost] = useState(0.75)
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      alert('Please enter some text to convert to speech')
      return
    }

    setIsGenerating(true)
    setAudioUrl(null)

    try {
      // Call the TTS API (in mock mode, this will return a mock URL)
      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: selectedVoice,
          stability,
          similarityBoost,
        }),
      })

      if (!response.ok) {
        throw new Error(`TTS API failed: ${response.status}`)
      }

      const result = await response.json()
      setAudioUrl(result.audioUrl || result.audio_url)
    } catch (error) {
      console.error('TTS generation error:', error)
      alert('Failed to generate speech. Check console for details.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlay = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleLoadSample = (sampleText: string) => {
    setText(sampleText)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[500px] bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-white">Voice Lab</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Sample Prompts */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Prompts
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt.name}
                  onClick={() => handleLoadSample(prompt.text)}
                  className="px-3 py-2 text-xs text-left text-gray-300 bg-gray-800 border border-gray-700 rounded hover:bg-gray-750 hover:border-gray-600 transition-colors"
                >
                  {prompt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Text to Speak
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to convert to speech..."
              rows={6}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="mt-1 text-xs text-gray-500">
              {text.length} characters
            </div>
          </div>

          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Voice
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {VOICES.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stability Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stability: {stability.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={stability}
              onChange={(e) => setStability(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>More Variable</span>
              <span>More Stable</span>
            </div>
          </div>

          {/* Similarity Boost Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Similarity Boost: {similarityBoost.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={similarityBoost}
              onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateSpeech}
            disabled={isGenerating || !text.trim()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span>Generate Speech</span>
              </>
            )}
          </button>

          {/* Audio Player */}
          {audioUrl && (
            <div className="p-4 bg-gray-800 border border-gray-700 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Audio Preview</span>
                <div className="flex space-x-2">
                  {!isPlaying ? (
                    <button
                      onClick={handlePlay}
                      className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                      title="Play"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={handlePause}
                      className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                      title="Pause"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="w-full"
                controls
              />
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-md">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs text-blue-200">
                <p className="font-medium mb-1">Voice Lab Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-300">
                  <li>Experiment with stability for more/less variation</li>
                  <li>Higher similarity boost = closer to original voice</li>
                  <li>Use sample prompts as starting templates</li>
                  <li>In mock mode, returns simulated audio URLs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
