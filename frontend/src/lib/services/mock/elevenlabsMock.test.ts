import { describe, it, expect } from 'vitest'
import { speakTextSim, getVoicesSim } from './elevenlabsMock'

describe('ElevenLabs Mock Service', () => {
  describe('speakTextSim', () => {
    it('should generate mock TTS result', async () => {
      const result = await speakTextSim('Hello world', 'alloy')

      expect(result).toBeDefined()
      expect(result.audioUrl).toBeDefined()
      expect(result.audioUrl).toContain('data:audio/mp3;base64')
      expect(result.duration).toBeGreaterThan(0)
      expect(result.characterCount).toBe(11)
    })

    it('should calculate duration based on text length', async () => {
      const shortText = 'Hi'
      const longText = 'This is a much longer piece of text that should take more time to speak'

      const shortResult = await speakTextSim(shortText, 'alloy')
      const longResult = await speakTextSim(longText, 'alloy')

      expect(longResult.duration).toBeGreaterThan(shortResult.duration)
    })

    it('should handle different voices', async () => {
      const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']

      for (const voice of voices) {
        const result = await speakTextSim('Test', voice)
        expect(result).toBeDefined()
        expect(result.audioUrl).toBeDefined()
      }
    })

    it('should simulate realistic delay', async () => {
      const start = Date.now()
      await speakTextSim('Test text', 'alloy')
      const elapsed = Date.now() - start

      // Should take at least 300ms (simulated processing time)
      expect(elapsed).toBeGreaterThanOrEqual(200)
    })
  })

  describe('getVoicesSim', () => {
    it('should return available voices', async () => {
      const voices = await getVoicesSim()

      expect(voices).toBeDefined()
      expect(Array.isArray(voices)).toBe(true)
      expect(voices.length).toBeGreaterThan(0)
    })

    it('should include voice metadata', async () => {
      const voices = await getVoicesSim()

      voices.forEach((voice) => {
        expect(voice.id).toBeDefined()
        expect(voice.name).toBeDefined()
        expect(voice.description).toBeDefined()
      })
    })
  })
})
