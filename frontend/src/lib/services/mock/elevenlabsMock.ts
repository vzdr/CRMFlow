/**
 * ElevenLabs Mock Service
 *
 * Simulates ElevenLabs text-to-speech services for development and testing
 */

export interface SpeakTextSimResult {
  audioUrl: string
  audioData: string
  duration: number
  characterCount: number
  voiceId: string
  voiceName: string
  timestamp: Date
}

/**
 * Simulates text-to-speech conversion via ElevenLabs
 * Returns deterministic sample data
 */
export function speakTextSim(text: string, voiceId?: string): SpeakTextSimResult {
  const voices = {
    '21m00Tcm4TlvDq8ikWAM': 'Rachel',
    'ErXwobaYiN019PkySvjV': 'Antoni',
    'MF3mGyEYCl7XYWbV9V6O': 'Elli',
    'TxGEqnHWrfWFTfGW9XjX': 'Josh',
  }

  const selectedVoiceId = voiceId || '21m00Tcm4TlvDq8ikWAM'
  const voiceName = voices[selectedVoiceId as keyof typeof voices] || 'Rachel'

  // Simulate audio generation
  const characterCount = text.length
  const estimatedDuration = Math.ceil(characterCount / 15) // ~15 chars per second

  return {
    audioUrl: `https://mock-elevenlabs.com/audio/${Math.random().toString(36).substring(7)}.mp3`,
    audioData: `[AUDIO DATA: "${text.substring(0, 50)}..." spoken in ${voiceName}'s voice]`,
    duration: estimatedDuration,
    characterCount,
    voiceId: selectedVoiceId,
    voiceName,
    timestamp: new Date(),
  }
}

/**
 * Simulates voice cloning via ElevenLabs
 */
export function cloneVoiceSim(name: string, audioSamples: string[]) {
  return {
    voiceId: 'CV' + Math.random().toString(36).substring(2, 15).toUpperCase(),
    name,
    status: 'ready',
    samplesProcessed: audioSamples.length,
    timestamp: new Date(),
  }
}

/**
 * Simulates getting available voices
 */
export function getVoicesSim() {
  return {
    voices: [
      { voiceId: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', category: 'premade' },
      { voiceId: 'ErXwobaYiN019PkySvjV', name: 'Antoni', category: 'premade' },
      { voiceId: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', category: 'premade' },
      { voiceId: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', category: 'premade' },
    ],
  }
}
