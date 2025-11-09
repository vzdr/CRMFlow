import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  // Global Mocks toggle
  useMocks: boolean
  autoSave: boolean

  // Voice Lab state
  voiceLabOpen: boolean

  // Settings modal state
  settingsModalOpen: boolean

  // Actions
  setUseMocks: (useMocks: boolean) => void
  setAutoSave: (autoSave: boolean) => void
  toggleVoiceLab: () => void
  openVoiceLab: () => void
  closeVoiceLab: () => void
  toggleSettingsModal: () => void
  openSettingsModal: () => void
  closeSettingsModal: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Default values
      useMocks: true, // Start with mocks on for development
      autoSave: true,
      voiceLabOpen: false,
      settingsModalOpen: false,

      // Actions
      setUseMocks: (useMocks) => set({ useMocks }),
      setAutoSave: (autoSave) => set({ autoSave }),
      toggleVoiceLab: () => set((state) => ({ voiceLabOpen: !state.voiceLabOpen })),
      openVoiceLab: () => set({ voiceLabOpen: true }),
      closeVoiceLab: () => set({ voiceLabOpen: false }),
      toggleSettingsModal: () => set((state) => ({ settingsModalOpen: !state.settingsModalOpen })),
      openSettingsModal: () => set({ settingsModalOpen: true }),
      closeSettingsModal: () => set({ settingsModalOpen: false }),
    }),
    {
      name: 'crmflow-settings',
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate settings store:', error)
          // Clear corrupted data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('crmflow-settings')
          }
        }
      },
    }
  )
)
