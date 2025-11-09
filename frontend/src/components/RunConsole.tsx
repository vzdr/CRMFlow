'use client'

import React, { useRef, useEffect, useState } from 'react'
import { ExecutionLog, ExecutionContext } from '@/lib/flowExecutor'

interface RunConsoleProps {
  logs: ExecutionLog[]
  isExecuting: boolean
  lastNodeOutput: any
  currentContext: ExecutionContext
  onClear: () => void
}

type TabType = 'logs' | 'output' | 'context'

export default function RunConsole({
  logs,
  isExecuting,
  lastNodeOutput,
  currentContext,
  onClear,
}: RunConsoleProps) {
  const logsEndRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<TabType>('logs')
  const [isExpanded, setIsExpanded] = useState(true)

  // Auto-scroll to bottom when new logs appear
  useEffect(() => {
    if (activeTab === 'logs') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, activeTab])

  const getLogIcon = (level: ExecutionLog['level']) => {
    switch (level) {
      case 'success':
        return (
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        )
    }
  }

  const getLogTextColor = (level: ExecutionLog['level']) => {
    switch (level) {
      case 'success':
        return 'text-green-300'
      case 'error':
        return 'text-red-300'
      case 'warning':
        return 'text-yellow-300'
      default:
        return 'text-blue-300'
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date)
  }

  return (
    <div className={`bg-gray-900 border-t border-gray-700 flex flex-col transition-all duration-300 ${isExpanded ? 'h-80' : 'h-10'}`}>
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-700 flex items-center justify-between bg-gray-800">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-0' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-sm font-semibold text-white">Run Console</h3>
            {isExecuting && (
              <div className="flex items-center space-x-1 text-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs">Running...</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          {isExpanded && (
            <div className="flex items-center space-x-1 ml-4">
              <TabButton
                active={activeTab === 'logs'}
                onClick={() => setActiveTab('logs')}
                label="Logs"
                badge={logs.length}
              />
              <TabButton
                active={activeTab === 'output'}
                onClick={() => setActiveTab('output')}
                label="Last Output"
              />
              <TabButton
                active={activeTab === 'context'}
                onClick={() => setActiveTab('context')}
                label="Context"
                badge={Object.keys(currentContext).length}
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'logs' && isExpanded && (
            <>
              <span className="text-xs text-gray-400">{logs.length} log(s)</span>
              <button
                onClick={onClear}
                disabled={logs.length === 0}
                className="px-2 py-1 text-xs text-gray-300 bg-gray-700 border border-gray-600 rounded hover:bg-gray-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="flex-1 overflow-hidden">
          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="h-full overflow-y-auto p-3 space-y-1 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  No execution logs yet. Click "Run" to execute the flow.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start space-x-2 p-2 rounded hover:bg-gray-800/50 transition-colors"
                  >
                    <span className="text-gray-500 text-xs flex-shrink-0 mt-0.5">
                      {formatTime(log.timestamp)}
                    </span>
                    <div className="flex-shrink-0 mt-0.5">{getLogIcon(log.level)}</div>
                    <div className="flex-1 min-w-0">
                      {log.nodeLabel && (
                        <span className="text-gray-400 mr-2">[{log.nodeLabel}]</span>
                      )}
                      <span className={getLogTextColor(log.level)}>{log.message}</span>
                      {log.data && (
                        <pre className="mt-1 text-gray-500 text-xs overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                      {log.data && (log.data as any).audioUrl && (
                        <div className="mt-2">
                          <audio controls src={(log.data as any).audioUrl} />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          )}

          {/* Last Output Tab */}
          {activeTab === 'output' && (
            <div className="h-full overflow-y-auto p-4">
              {lastNodeOutput ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">Last Node Output</h4>
                    {lastNodeOutput.nodeLabel && (
                      <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        {lastNodeOutput.nodeLabel}
                      </span>
                    )}
                  </div>
                  <pre className="bg-gray-800 rounded p-3 text-xs text-gray-300 overflow-x-auto font-mono">
                    {JSON.stringify(lastNodeOutput.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  No output yet. Run a flow to see the last node output.
                </div>
              )}
            </div>
          )}

          {/* Context Tab */}
          {activeTab === 'context' && (
            <div className="h-full overflow-y-auto p-4">
              {Object.keys(currentContext).length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">Execution Context</h4>
                    <span className="text-xs text-gray-400">
                      {Object.keys(currentContext).length} variable(s)
                    </span>
                  </div>
                  <pre className="bg-gray-800 rounded p-3 text-xs text-gray-300 overflow-x-auto font-mono">
                    {JSON.stringify(currentContext, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  No context data yet. Run a flow to see the execution context.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  label: string
  badge?: number
}

function TabButton({ active, onClick, label, badge }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
        active
          ? 'bg-gray-700 text-white'
          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
      }`}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="ml-1.5 px-1.5 py-0.5 bg-gray-600 rounded text-xs">
          {badge}
        </span>
      )}
    </button>
  )
}
