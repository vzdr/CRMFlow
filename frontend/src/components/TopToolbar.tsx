'use client'

import React, { useRef, useState } from 'react'
import { Node, Edge } from 'reactflow'

interface TopToolbarProps {
  onNew: () => void
  onSave: () => void
  onExport: () => void
  onImport: (data: { nodes: Node[]; edges: Edge[] }) => void
  onRun: () => void
  onSimulateCall?: () => void
  onSimulateWebhook?: () => void
  onLoadTemplate?: (templateId: string) => void
  isRunning?: boolean
}

export default function TopToolbar({
  onNew,
  onSave,
  onExport,
  onImport,
  onRun,
  onSimulateCall,
  onSimulateWebhook,
  onLoadTemplate,
  isRunning
}: TopToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showTemplates, setShowTemplates] = useState(false)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.nodes && data.edges) {
          onImport(data)
        } else {
          alert('Invalid file format. Expected nodes and edges.')
        }
      } catch (error) {
        alert('Failed to parse file. Please upload a valid JSON file.')
        console.error('Import error:', error)
      }
    }
    reader.readAsText(file)

    // Reset input so same file can be imported again
    event.target.value = ''
  }

  return (
    <div className="h-14 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-white">CRMFlow Studio</h1>
        <div className="flex items-center space-x-2">
          <ToolbarButton
            onClick={onNew}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
            label="New"
          />
          <ToolbarButton
            onClick={onSave}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
            }
            label="Save"
          />
          <ToolbarButton
            onClick={onExport}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            }
            label="Export"
          />
          <ToolbarButton
            onClick={handleImportClick}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            }
            label="Import"
          />
          {onLoadTemplate && (
            <div className="relative">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-750 hover:text-white hover:border-gray-600 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a2 2 0 012-2h4.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 13h8m-8 4h6" />
                </svg>
                <span>Templates</span>
                <svg className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showTemplates && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div className="fixed inset-0 z-10" onClick={() => setShowTemplates(false)}></div>
                  {/* Dropdown menu */}
                  <div className="absolute left-0 top-full mt-1 w-72 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">
                        Sales Templates
                      </div>
                      <button
                        onClick={() => {
                          onLoadTemplate('sap-sales-qualifier')
                          setShowTemplates(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <div className="font-medium">SAP Sales Qualifier</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Automate lead qualification with SAP integration
                        </div>
                      </button>

                      <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase mt-3">
                        Recruitment Templates
                      </div>
                      <button
                        onClick={() => {
                          onLoadTemplate('qlay-candidate-screener')
                          setShowTemplates(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <div className="font-medium">Qlay Candidate Screener</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          AI-powered candidate screening with interview Q&A
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <div className="w-px h-6 bg-gray-700"></div>
          <button
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-4 py-1.5 text-sm text-white bg-blue-600 border border-blue-500 rounded-md hover:bg-blue-700 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isRunning ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Running...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {onSimulateCall && (
          <button
            onClick={onSimulateCall}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-750 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Simulate Call</span>
          </button>
        )}
        {onSimulateWebhook && (
          <button
            onClick={onSimulateWebhook}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-750 hover:text-white hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Simulate Webhook</span>
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Auto-saved</span>
        </div>
        <div className="w-px h-6 bg-gray-700"></div>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              const event = new CustomEvent('openVoiceLab')
              window.dispatchEvent(event)
            }
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-750 hover:text-white hover:border-gray-600 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span>Voice Lab</span>
        </button>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              const event = new CustomEvent('openSettings')
              window.dispatchEvent(event)
            }
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-750 hover:text-white hover:border-gray-600 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings</span>
        </button>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}

interface ToolbarButtonProps {
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function ToolbarButton({ onClick, icon, label }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-750 hover:text-white hover:border-gray-600 transition-all"
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
