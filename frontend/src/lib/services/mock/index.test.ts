import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { isMockMode, enableMockMode, disableMockMode, getMockModeStatus } from './index'

describe('Mock Mode', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('isMockMode', () => {
    it('should return true when settings store has useMocks=true', () => {
      localStorage.setItem(
        'crmflow-settings',
        JSON.stringify({ state: { useMocks: true } })
      )
      expect(isMockMode()).toBe(true)
    })

    it('should return false when settings store has useMocks=false', () => {
      localStorage.setItem(
        'crmflow-settings',
        JSON.stringify({ state: { useMocks: false } })
      )
      expect(isMockMode()).toBe(false)
    })

    it('should default to true when no settings exist', () => {
      expect(isMockMode()).toBe(true)
    })

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('crmflow-settings', 'invalid json')
      expect(isMockMode()).toBe(true)
    })

    it('should fallback to old USE_MOCK key for backwards compatibility', () => {
      localStorage.setItem('USE_MOCK', '1')
      expect(isMockMode()).toBe(true)
    })
  })

  describe('enableMockMode', () => {
    it('should set USE_MOCK to 1 in localStorage', () => {
      enableMockMode()
      expect(localStorage.setItem).toHaveBeenCalledWith('USE_MOCK', '1')
    })
  })

  describe('disableMockMode', () => {
    it('should remove USE_MOCK from localStorage', () => {
      localStorage.setItem('USE_MOCK', '1')
      disableMockMode()
      expect(localStorage.removeItem).toHaveBeenCalledWith('USE_MOCK')
    })
  })

  describe('getMockModeStatus', () => {
    it('should return settings-store source when settings exist', () => {
      localStorage.setItem(
        'crmflow-settings',
        JSON.stringify({ state: { useMocks: true } })
      )
      const status = getMockModeStatus()
      expect(status.enabled).toBe(true)
      expect(status.source).toBe('settings-store')
    })

    it('should return localStorage source when using old USE_MOCK', () => {
      localStorage.setItem('USE_MOCK', '1')
      const status = getMockModeStatus()
      expect(status.enabled).toBe(true)
      expect(status.source).toBe('localStorage')
    })

    it('should return disabled when no mock mode is set', () => {
      const status = getMockModeStatus()
      expect(status.enabled).toBe(false)
      expect(status.source).toBe('disabled')
    })
  })
})
