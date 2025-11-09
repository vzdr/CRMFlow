'use client'

import React, { useState } from 'react'

interface FieldMapping {
  [key: string]: string
}

interface FieldMappingEditorProps {
  mappings: FieldMapping
  onChange: (mappings: FieldMapping) => void
  fields: Array<{ name: string; label: string; required?: boolean }>
  helper?: string
}

export default function FieldMappingEditor({
  mappings,
  onChange,
  fields,
  helper,
}: FieldMappingEditorProps) {
  const [showHelp, setShowHelp] = useState(false)

  const handleFieldChange = (fieldName: string, value: string) => {
    onChange({
      ...mappings,
      [fieldName]: value,
    })
  }

  const handleRemoveField = (fieldName: string) => {
    const newMappings = { ...mappings }
    delete newMappings[fieldName]
    onChange(newMappings)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          Field Mappings
        </label>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          {showHelp ? 'Hide Help' : 'Show Help'}
        </button>
      </div>

      {helper && <p className="text-xs text-gray-500">{helper}</p>}

      {showHelp && (
        <div className="text-xs text-gray-500 space-y-2 p-3 bg-gray-800 rounded border border-gray-700">
          <p className="font-medium text-gray-400">Context Path Examples:</p>
          <code className="block">callerId</code>
          <code className="block">webhookPayload.data.email</code>
          <code className="block">customer.companyName</code>
          <p className="font-medium text-gray-400 mt-2">Static Values:</p>
          <code className="block">&quot;webhook&quot;</code>
          <code className="block">&quot;High Priority&quot;</code>
          <p className="text-gray-500 mt-2">
            Use dot notation to access nested properties. Wrap static strings in quotes.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {!field.required && mappings[field.name] && (
                <button
                  type="button"
                  onClick={() => handleRemoveField(field.name)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              type="text"
              value={mappings[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={`e.g., ${field.name === 'companyName' ? 'webhookPayload.data.customerName' : field.name === 'source' ? '"webhook"' : 'context.' + field.name}`}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            />
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-800/50 rounded">
        <p className="font-medium text-gray-400">Available Context Variables:</p>
        <div className="grid grid-cols-2 gap-1 mt-1">
          <code className="text-blue-400">callerId</code>
          <code className="text-blue-400">callerName</code>
          <code className="text-blue-400">webhookPayload</code>
          <code className="text-blue-400">sentiment</code>
          <code className="text-blue-400">transcribedText</code>
          <code className="text-blue-400">customer</code>
          <code className="text-blue-400">leadId</code>
          <code className="text-blue-400">and more...</code>
        </div>
      </div>
    </div>
  )
}

/**
 * Helper function to resolve a context path value
 * Used by executors to get values from context
 */
export function resolveContextPath(context: any, path: string): any {
  // Handle static strings (wrapped in quotes)
  if (path.startsWith('"') && path.endsWith('"')) {
    return path.slice(1, -1)
  }
  if (path.startsWith("'") && path.endsWith("'")) {
    return path.slice(1, -1)
  }

  // Handle empty path
  if (!path || path.trim() === '') {
    return undefined
  }

  // Split path and navigate through object
  const parts = path.split('.')
  let value = context

  for (const part of parts) {
    if (value === null || value === undefined) {
      return undefined
    }
    value = value[part]
  }

  return value
}

/**
 * Apply field mappings to context
 * Returns an object with resolved values
 */
export function applyFieldMappings(
  context: any,
  mappings: FieldMapping
): Record<string, any> {
  const result: Record<string, any> = {}

  for (const [field, path] of Object.entries(mappings)) {
    if (path) {
      result[field] = resolveContextPath(context, path)
    }
  }

  return result
}
