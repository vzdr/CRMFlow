'use client'

import React, { useState } from 'react'
import { Node } from 'reactflow'

interface NodeTestModalProps {
  node: Node | null
  isOpen: boolean
  onClose: () => void
  onTest: (node: Node, input: any) => Promise<void>
}

export default function NodeTestModal({ node, isOpen, onClose, onTest }: NodeTestModalProps) {
  const [inputJson, setInputJson] = useState('{}')
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !node) return null

  const handleTest = async () => {
    setError(null)
    setIsExecuting(true)

    try {
      const input = JSON.parse(inputJson)
      await onTest(node, input)
      onClose()
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format')
      } else {
        setError((err as Error).message || 'Test execution failed')
      }
    } finally {
      setIsExecuting(false)
    }
  }

  const getSampleInput = () => {
    const nodeType = node.data.nodeType || 'unknown'

    const samples: Record<string, any> = {
      'trigger.twilio.inbound': {
        callerId: '+14155551234',
        callerName: 'John Doe',
        callData: {
          from: '+14155551234',
          to: '+14155556789',
          callSid: 'CA1234567890',
          direction: 'inbound',
        },
      },
      'trigger.webhook': {
        webhookPayload: {
          event: 'customer.inquiry',
          data: { email: 'test@example.com', message: 'Hello' },
        },
      },
      'voice.speak': {
        context: { message: 'Hello, welcome to our service!' },
      },
      'voice.listen': {
        context: { audioUrl: 'https://example.com/audio.mp3' },
      },
      'ai.gemini.sentiment': {
        context: {
          conversationText: 'I am very happy with your service!',
        },
      },
      'crm.sap.get-customer': {
        context: { companyName: 'Acme Corporation' },
      },
      'crm.sap.create-lead': {
        context: {
          companyName: 'NewCo Inc',
          contactName: 'Jane Smith',
          email: 'jane@newco.com',
          phone: '+14155559999',
        },
      },
      'integration.google.sheets-read': {
        context: { spreadsheetId: '1234567890', range: 'Sheet1!A1:D10' },
      },
      'integration.google.calendar-create': {
        context: {
          eventTitle: 'Sales Call Follow-up',
          eventDate: '2024-01-15T10:00:00Z',
          attendeeEmail: 'customer@example.com',
        },
      },
    }

    return samples[nodeType] || { context: {} }
  }

  const handleUseSample = () => {
    const sample = getSampleInput()
    setInputJson(JSON.stringify(sample, null, 2))
    setError(null)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-3xl mx-4 border border-gray-700 max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
              <div>
                <h2 className="text-xl font-semibold text-white">Test Node</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {node.data.label || node.data.nodeType}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Test Input (JSON)
                </label>
                <button
                  onClick={handleUseSample}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Use Sample Input
                </button>
              </div>
              <textarea
                value={inputJson}
                onChange={(e) => {
                  setInputJson(e.target.value)
                  setError(null)
                }}
                placeholder='{"context": {}}'
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm min-h-[300px]"
              />
              {error && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </p>
              )}
            </div>

            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs text-blue-200">
                  <p className="font-medium mb-1">About Node Testing:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-300">
                    <li>Tests execute the node in isolation</li>
                    <li>Provide input data matching expected node context</li>
                    <li>Results appear in the Run Console below</li>
                    <li>Use "Sample Input" for a starting point</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleTest}
              disabled={isExecuting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isExecuting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Run Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
