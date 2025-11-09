'use client'

import React, { useState, useEffect } from 'react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onMockModeChange?: (enabled: boolean) => void
}

export default function SettingsModal({ isOpen, onClose, onMockModeChange }: SettingsModalProps) {
  const [mockMode, setMockMode] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load current mock mode setting
      const storedMockMode = localStorage.getItem('USE_MOCK')
      setMockMode(storedMockMode === '1' || storedMockMode === null) // Default to true

      // Load auto-save setting
      const storedAutoSave = localStorage.getItem('AUTO_SAVE')
      setAutoSave(storedAutoSave !== '0') // Default to true
    }
  }, [isOpen])

  const handleMockModeToggle = (enabled: boolean) => {
    setMockMode(enabled)
    if (typeof window !== 'undefined') {
      localStorage.setItem('USE_MOCK', enabled ? '1' : '0')
      console.log(`🎭 Mock mode ${enabled ? 'enabled' : 'disabled'}`)
      if (onMockModeChange) {
        onMockModeChange(enabled)
      }
    }
  }

  const handleAutoSaveToggle = (enabled: boolean) => {
    setAutoSave(enabled)
    if (typeof window !== 'undefined') {
      localStorage.setItem('AUTO_SAVE', enabled ? '1' : '0')
      console.log(`💾 Auto-save ${enabled ? 'enabled' : 'disabled'}`)
    }
  }

  const handleClearCache = () => {
    if (confirm('Clear all saved flows and settings? This cannot be undone.')) {
      localStorage.removeItem('crmflow-studio-state')
      alert('Cache cleared! The page will reload.')
      window.location.reload()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl mx-4 border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-2xl font-semibold text-white">Settings</h2>
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
          <div className="p-6 space-y-6">
            {/* Mock Mode Section */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Execution Mode</h3>

              {/* Mock Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="mockMode" className="text-sm font-medium text-white">
                      Mock Mode
                    </label>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${mockMode ? 'bg-yellow-900 text-yellow-200' : 'bg-green-900 text-green-200'}`}>
                      {mockMode ? 'DEVELOPMENT' : 'PRODUCTION'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {mockMode
                      ? 'Using simulated data. No real API calls will be made.'
                      : 'Using real API endpoints. Requires valid API keys in .env.local'}
                  </p>
                </div>
                <button
                  id="mockMode"
                  onClick={() => handleMockModeToggle(!mockMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    mockMode ? 'bg-yellow-600' : 'bg-green-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      mockMode ? 'translate-x-1' : 'translate-x-6'
                    }`}
                  />
                </button>
              </div>

              {/* Warning Box */}
              {!mockMode && (
                <div className="mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded-md">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-xs text-red-200">
                      <p className="font-medium">Production Mode Active</p>
                      <p className="mt-1">Real API calls will be made. Ensure you have valid API keys configured in your .env.local file.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Editor Settings */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Editor</h3>

              {/* Auto-Save Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex-1">
                  <label htmlFor="autoSave" className="text-sm font-medium text-white">
                    Auto-Save
                  </label>
                  <p className="text-xs text-gray-400 mt-1">
                    Automatically save flows to localStorage
                  </p>
                </div>
                <button
                  id="autoSave"
                  onClick={() => handleAutoSaveToggle(!autoSave)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    autoSave ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoSave ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Data Management */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Data</h3>

              <div className="space-y-3">
                {/* Clear Cache */}
                <button
                  onClick={handleClearCache}
                  className="w-full flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors"
                >
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">Clear Cache</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Remove all saved flows and reset settings
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                {/* Storage Info */}
                <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="text-xs text-gray-400">
                    <div className="flex justify-between mb-1">
                      <span>Mock Mode:</span>
                      <span className="text-white">{mockMode ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto-Save:</span>
                      <span className="text-white">{autoSave ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-md">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-blue-200">
                  <p className="font-medium mb-1">About Mock Mode:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-300">
                    <li>Mock mode uses simulated data for all API calls</li>
                    <li>Perfect for development and testing without API costs</li>
                    <li>To use production mode, configure API keys in .env.local</li>
                    <li>Settings are saved to browser localStorage</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
