'use client'

import React, { useState, useEffect } from 'react'
import { Node } from 'reactflow'
import FieldMappingEditor from './FieldMappingEditor'

interface ConfigurationPanelProps {
  selectedNode: Node | null
  onUpdateNode: (nodeId: string, data: any) => void
}

interface FormErrors {
  [key: string]: string
}

export default function ConfigurationPanel({
  selectedNode,
  onUpdateNode,
}: ConfigurationPanelProps) {
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<FormErrors>({})

  // Load node data when selection changes
  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data || {})
      setErrors({})
    }
  }, [selectedNode])

  if (!selectedNode) {
    return (
      <div className="w-96 h-full bg-gray-900 border-l border-gray-700 flex items-center justify-center">
        <div className="text-center p-8">
          <svg
            className="w-16 h-16 text-gray-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
          <p className="text-gray-400 text-sm">
            Select a node to configure its properties
          </p>
        </div>
      </div>
    )
  }

  const handleChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)

    // Validate
    const newErrors = { ...errors }
    if (field === 'label' && !value.trim()) {
      newErrors.label = 'Label is required'
    } else if (field === 'label') {
      delete newErrors.label
    }

    if (field === 'url' && value && !isValidUrl(value)) {
      newErrors.url = 'Please enter a valid URL'
    } else if (field === 'url') {
      delete newErrors.url
    }

    setErrors(newErrors)

    // Update node if valid
    if (Object.keys(newErrors).length === 0) {
      onUpdateNode(selectedNode.id, newFormData)
    }
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const getNodeTypeFields = () => {
    const nodeType = selectedNode.data?.label?.toLowerCase() || ''

    // Common fields for all nodes
    const commonFields = (
      <>
        <FormField
          label="Node Label"
          value={formData.label || ''}
          onChange={(value) => handleChange('label', value)}
          error={errors.label}
          helper="Display name for this node"
          required
        />
        <FormField
          label="Description"
          value={formData.description || ''}
          onChange={(value) => handleChange('description', value)}
          helper="Optional description of what this node does"
          multiline
        />
      </>
    )

    // Webhook specific fields
    if (nodeType.includes('webhook')) {
      const webhookId = formData.config?.webhookId || 'demo-webhook'
      const webhookUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/api/hooks/${webhookId}`
        : `/api/hooks/${webhookId}`

      return (
        <>
          {commonFields}
          <FormField
            label="Webhook ID"
            value={formData.config?.webhookId || webhookId}
            onChange={(value) => {
              const newConfig = { ...formData.config, webhookId: value }
              handleChange('config', newConfig)
            }}
            helper="Unique identifier for this webhook"
            placeholder="demo-webhook"
          />
          <div className="text-xs text-gray-500 space-y-2 p-3 bg-gray-800 rounded">
            <p className="font-medium text-gray-400">Webhook Endpoint:</p>
            <code className="block text-blue-400 break-all">{webhookUrl}</code>
            <p className="text-gray-500 mt-2">Configure external services to send webhooks to this URL.</p>
            <p className="text-gray-500">Optional: Add X-Webhook-Signature header with HMAC-SHA256 for validation.</p>
          </div>
          <SelectField
            label="HTTP Method"
            value={formData.config?.method || formData.method || 'POST'}
            onChange={(value) => {
              const newConfig = { ...formData.config, method: value }
              handleChange('config', newConfig)
            }}
            options={['GET', 'POST', 'PUT', 'PATCH']}
            helper="HTTP method for the webhook"
          />
        </>
      )
    }

    // Inbound Call specific fields
    if (nodeType.includes('inbound') && nodeType.includes('call')) {
      const phoneNumber = formData.config?.phoneNumber || formData.phoneNumber
      const twilioWebhookUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/api/twilio/webhook`
        : `/api/twilio/webhook`

      return (
        <>
          {commonFields}
          <FormField
            label="Phone Number"
            value={phoneNumber || ''}
            onChange={(value) => {
              const newConfig = { ...formData.config, phoneNumber: value }
              handleChange('config', newConfig)
            }}
            helper="Twilio phone number for this flow (optional)"
            placeholder="+14155551234"
          />
          <div className="text-xs text-gray-500 space-y-2 p-3 bg-gray-800 rounded">
            <p className="font-medium text-gray-400">Twilio Webhook URL:</p>
            <code className="block text-blue-400 break-all">{twilioWebhookUrl}</code>
            <p className="text-gray-500 mt-2">Configure this URL in your Twilio phone number settings.</p>
            <p className="text-gray-500">Set as: Voice & Fax → A CALL COMES IN → Webhook</p>
            <p className="text-yellow-500 mt-2">⚠️ Requires TWILIO_AUTH_TOKEN in .env.local for signature validation</p>
          </div>
        </>
      )
    }

    // SAP Create Lead fields
    if (nodeType.includes('sap') && nodeType.includes('create')) {
      const fieldMappings = formData.config?.fieldMappings || formData.fieldMappings || {}

      return (
        <>
          {commonFields}
          <FormField
            label="SAP Credentials Reference"
            value={formData.config?.credentialsRef || formData.credentialsRef || ''}
            onChange={(value) => {
              const newConfig = { ...formData.config, credentialsRef: value }
              handleChange('config', newConfig)
            }}
            helper="Reference to stored SAP credentials (optional for mock mode)"
            placeholder="sap_production_creds"
          />
          <FormField
            label="Endpoint"
            value={formData.config?.endpoint || formData.endpoint || '/api/leads'}
            onChange={(value) => {
              const newConfig = { ...formData.config, endpoint: value }
              handleChange('config', newConfig)
            }}
            helper="SAP API endpoint path"
            placeholder="/api/leads"
          />
          <FieldMappingEditor
            mappings={fieldMappings}
            onChange={(mappings) => {
              const newConfig = { ...formData.config, fieldMappings: mappings }
              handleChange('config', newConfig)
            }}
            fields={[
              { name: 'companyName', label: 'Company Name', required: true },
              { name: 'contactName', label: 'Contact Name' },
              { name: 'email', label: 'Email' },
              { name: 'phone', label: 'Phone' },
              { name: 'source', label: 'Lead Source' },
              { name: 'industry', label: 'Industry' },
              { name: 'revenue', label: 'Revenue' },
              { name: 'notes', label: 'Notes' },
            ]}
            helper="Map context variables to SAP lead fields"
          />
        </>
      )
    }

    // SAP Get Customer fields
    if (nodeType.includes('sap') && nodeType.includes('get')) {
      const searchValue = formData.config?.searchValue || formData.searchValue || ''
      const searchField = formData.config?.searchField || formData.searchField || 'customerId'

      return (
        <>
          {commonFields}
          <FormField
            label="SAP Credentials Reference"
            value={formData.config?.credentialsRef || formData.credentialsRef || ''}
            onChange={(value) => {
              const newConfig = { ...formData.config, credentialsRef: value }
              handleChange('config', newConfig)
            }}
            helper="Reference to stored SAP credentials (optional for mock mode)"
            placeholder="sap_production_creds"
          />
          <FormField
            label="Endpoint"
            value={formData.config?.endpoint || formData.endpoint || '/api/customers'}
            onChange={(value) => {
              const newConfig = { ...formData.config, endpoint: value }
              handleChange('config', newConfig)
            }}
            helper="SAP API endpoint path"
            placeholder="/api/customers"
          />
          <SelectField
            label="Search By"
            value={searchField}
            onChange={(value) => {
              const newConfig = { ...formData.config, searchField: value }
              handleChange('config', newConfig)
            }}
            options={['customerId', 'companyName', 'email', 'phone']}
            helper="Field to use for searching"
          />
          <FormField
            label="Search Value (Context Path)"
            value={searchValue}
            onChange={(value) => {
              const newConfig = { ...formData.config, searchValue: value }
              handleChange('config', newConfig)
            }}
            helper="Context path to the search value (e.g., webhookPayload.data.customerId)"
            placeholder="webhookPayload.data.customerId"
          />
          <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-800 rounded">
            <p className="font-medium text-gray-400">Output Variables:</p>
            <code className="block">customer - Full customer object</code>
            <code className="block">customerId - Customer ID</code>
            <code className="block">companyName - Company name</code>
          </div>
        </>
      )
    }

    // Google Sheets integration
    if (nodeType.includes('google') && nodeType.includes('sheet')) {
      const spreadsheetId = formData.config?.spreadsheetId || formData.spreadsheetId || ''
      const sheetName = formData.config?.sheetName || formData.sheetName || 'Sheet1'
      const range = formData.config?.range || formData.range || 'A1:Z100'
      const includeHeaders = formData.config?.includeHeaders ?? formData.includeHeaders ?? true

      return (
        <>
          {commonFields}
          <FormField
            label="Google Credentials Reference"
            value={formData.config?.credentialsRef || formData.credentialsRef || ''}
            onChange={(value) => {
              const newConfig = { ...formData.config, credentialsRef: value }
              handleChange('config', newConfig)
            }}
            helper="Reference to stored Google credentials (optional for mock mode)"
            placeholder="google_service_account"
          />
          <FormField
            label="Spreadsheet ID"
            value={spreadsheetId}
            onChange={(value) => {
              const newConfig = { ...formData.config, spreadsheetId: value }
              handleChange('config', newConfig)
            }}
            helper="ID from the Google Sheets URL (between /d/ and /edit)"
            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
          />
          <FormField
            label="Sheet Name"
            value={sheetName}
            onChange={(value) => {
              const newConfig = { ...formData.config, sheetName: value }
              handleChange('config', newConfig)
            }}
            helper="Name of the sheet tab"
            placeholder="Sheet1"
          />
          <FormField
            label="Range"
            value={range}
            onChange={(value) => {
              const newConfig = { ...formData.config, range: value }
              handleChange('config', newConfig)
            }}
            helper="Cell range to read (e.g., A1:D10, A:Z for all rows)"
            placeholder="A1:Z100"
          />
          <CheckboxField
            label="Include Headers"
            checked={includeHeaders}
            onChange={(checked) => {
              const newConfig = { ...formData.config, includeHeaders: checked }
              handleChange('config', newConfig)
            }}
            helper="First row contains column headers"
          />
          <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-800 rounded">
            <p className="font-medium text-gray-400">Output Variables:</p>
            <code className="block">sheetData - Array of rows</code>
            <code className="block">rows - Number of rows read</code>
          </div>
        </>
      )
    }

    // Google Calendar integration
    if (nodeType.includes('google') && nodeType.includes('event')) {
      const calendarId = formData.config?.calendarId || formData.calendarId || 'primary'
      const fieldMappings = formData.config?.fieldMappings || formData.fieldMappings || {}

      return (
        <>
          {commonFields}
          <FormField
            label="Google Credentials Reference"
            value={formData.config?.credentialsRef || formData.credentialsRef || ''}
            onChange={(value) => {
              const newConfig = { ...formData.config, credentialsRef: value }
              handleChange('config', newConfig)
            }}
            helper="Reference to stored Google credentials (optional for mock mode)"
            placeholder="google_service_account"
          />
          <FormField
            label="Calendar ID"
            value={calendarId}
            onChange={(value) => {
              const newConfig = { ...formData.config, calendarId: value }
              handleChange('config', newConfig)
            }}
            helper="Calendar ID (use 'primary' for default calendar)"
            placeholder="primary"
          />
          <FieldMappingEditor
            mappings={fieldMappings}
            onChange={(mappings) => {
              const newConfig = { ...formData.config, fieldMappings: mappings }
              handleChange('config', newConfig)
            }}
            fields={[
              { name: 'summary', label: 'Event Title', required: true },
              { name: 'description', label: 'Description' },
              { name: 'startTime', label: 'Start Time (ISO 8601)', required: true },
              { name: 'endTime', label: 'End Time (ISO 8601)' },
              { name: 'location', label: 'Location' },
              { name: 'attendees', label: 'Attendees (comma-separated emails)' },
            ]}
            helper="Map context variables to calendar event fields"
          />
        </>
      )
    }

    // Qlay integration
    if (nodeType.includes('qlay')) {
      const jobId = formData.config?.jobId || formData.jobId || ''
      const position = formData.config?.position || formData.position || 'Software Engineer'
      const fieldMappings = formData.config?.fieldMappings || formData.fieldMappings || {}

      return (
        <>
          {commonFields}
          <FormField
            label="Qlay API Credentials Reference"
            value={formData.config?.credentialsRef || formData.credentialsRef || ''}
            onChange={(value) => {
              const newConfig = { ...formData.config, credentialsRef: value }
              handleChange('config', newConfig)
            }}
            helper="Reference to stored Qlay API credentials (optional for mock mode)"
            placeholder="qlay_api_key"
          />
          <FormField
            label="Job ID"
            value={jobId}
            onChange={(value) => {
              const newConfig = { ...formData.config, jobId: value }
              handleChange('config', newConfig)
            }}
            helper="Unique identifier for the job posting"
            placeholder="JOB-2024-SE-001"
          />
          <FormField
            label="Position Title"
            value={position}
            onChange={(value) => {
              const newConfig = { ...formData.config, position: value }
              handleChange('config', newConfig)
            }}
            helper="Job title for the position"
            placeholder="Software Engineer"
          />
          <FieldMappingEditor
            mappings={fieldMappings}
            onChange={(mappings) => {
              const newConfig = { ...formData.config, fieldMappings: mappings }
              handleChange('config', newConfig)
            }}
            fields={[
              { name: 'name', label: 'Candidate Name', required: true },
              { name: 'email', label: 'Email' },
              { name: 'phone', label: 'Phone' },
              { name: 'resume', label: 'Resume URL' },
              { name: 'transcript', label: 'Interview Transcript' },
              { name: 'experience', label: 'Years of Experience' },
              { name: 'education', label: 'Education Level' },
              { name: 'skills', label: 'Skills (comma-separated)' },
            ]}
            helper="Map context variables to candidate fields"
          />
          <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-800 rounded">
            <p className="font-medium text-gray-400">Output Variables:</p>
            <code className="block">screeningId - Unique screening ID</code>
            <code className="block">screeningResult - Full screening report</code>
            <code className="block">overallScore - Score (0-100)</code>
            <code className="block">recommendation - strong_yes, yes, maybe, no, strong_no</code>
            <code className="block">qualified - Boolean (true if strong_yes or yes)</code>
          </div>
        </>
      )
    }

    // Speak Text node
    if (nodeType.includes('speak')) {
      return (
        <>
          {commonFields}
          <FormField
            label="Text to Speak"
            value={formData.text || ''}
            onChange={(value) => handleChange('text', value)}
            helper="Text that will be converted to speech. Use {{variable}} for dynamic values."
            multiline
            placeholder="Hello {{customerName}}, how can I help you today?"
          />
          <SelectField
            label="Voice ID"
            value={formData.voiceId || '21m00Tcm4TlvDq8ikWAM'}
            onChange={(value) => handleChange('voiceId', value)}
            options={['21m00Tcm4TlvDq8ikWAM', 'ErXwobaYiN019PkySvjV', 'MF3mGyEYCl7XYWbV9V6O', 'TxGEqnHWrfWFTfGW9XjX']}
            helper="ElevenLabs voice ID"
          />
          <FormField
            label="Stability (0-1)"
            value={String(formData.stability ?? '0.5')}
            onChange={(value) => handleChange('stability', parseFloat(value))}
            helper="Controls consistency vs. variability in speech"
            type="number"
          />
          <FormField
            label="Similarity Boost (0-1)"
            value={String(formData.similarityBoost ?? '0.75')}
            onChange={(value) => handleChange('similarityBoost', parseFloat(value))}
            helper="Controls similarity to the target voice"
            type="number"
          />

          <AudioPreview text={formData.text} voiceId={formData.voiceId} stability={formData.stability} similarityBoost={formData.similarityBoost} />
        </>
      )
    }

    // Listen & Understand node
    if (nodeType.includes('listen')) {
      return (
        <>
          {commonFields}
          <FormField
            label="Expected Response Type"
            value={formData.expectedType || ''}
            onChange={(value) => handleChange('expectedType', value)}
            helper="What kind of response to expect (e.g., yes/no, number, text)"
            placeholder="yes/no"
          />
          <FormField
            label="Timeout (seconds)"
            value={formData.timeout || '10'}
            onChange={(value) => handleChange('timeout', value)}
            helper="How long to wait for user input"
            type="number"
          />
        </>
      )
    }

    // Condition node
    if (nodeType.includes('condition') || nodeType.includes('if') || nodeType.includes('else')) {
      const fieldName = formData.config?.expression !== undefined ? 'expression' : 'condition'
      const currentValue = formData.config?.[fieldName] || formData[fieldName] || ''

      return (
        <>
          {commonFields}
          <FormField
            label="Expression"
            value={currentValue}
            onChange={(value) => {
              const newConfig = { ...formData.config, [fieldName]: value }
              handleChange('config', newConfig)
            }}
            helper="JavaScript expression to evaluate. Use context variables directly or with {{}} syntax."
            placeholder="sentiment === 'positive' || score > 0.7"
            multiline
          />
          <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-800 rounded">
            <p className="font-medium text-gray-400">Examples:</p>
            <code className="block">sentiment === &quot;positive&quot;</code>
            <code className="block">sentimentScore &gt; 0.7</code>
            <code className="block">userResponse.includes(&quot;yes&quot;)</code>
          </div>
        </>
      )
    }

    // Sentiment node
    if (nodeType.includes('sentiment')) {
      const textVariable = formData.config?.textVariable || formData.textVariable || 'transcribedText'
      const useGemini = formData.config?.useGemini || formData.useGemini || false

      return (
        <>
          {commonFields}
          <FormField
            label="Text Variable"
            value={textVariable}
            onChange={(value) => {
              const newConfig = { ...formData.config, textVariable: value }
              handleChange('config', newConfig)
            }}
            helper="Context variable containing text to analyze"
            placeholder="transcribedText"
          />
          <CheckboxField
            label="Use Gemini API"
            checked={useGemini}
            onChange={(checked) => {
              const newConfig = { ...formData.config, useGemini: checked }
              handleChange('config', newConfig)
            }}
            helper="Use Google Gemini for advanced sentiment analysis (falls back to keyword-based if disabled)"
          />
          <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-800 rounded">
            <p className="font-medium text-gray-400">Outputs:</p>
            <p><strong>positive</strong> - Routes to positive branch</p>
            <p><strong>negative</strong> - Routes to negative branch</p>
            <p><strong>neutral</strong> - Routes to neutral branch</p>
          </div>
        </>
      )
    }

    // Default fields for other nodes
    return commonFields
  }

  return (
    <div className="w-96 h-full bg-gray-900 border-l border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
        <h2 className="text-lg font-semibold text-white">Configuration</h2>
        <p className="text-sm text-gray-400 mt-1">
          {selectedNode.data?.label || 'Node Settings'}
        </p>
      </div>

      <div className="p-4 space-y-4">{getNodeTypeFields()}</div>
    </div>
  )
}

interface FormFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  helper?: string
  required?: boolean
  placeholder?: string
  multiline?: boolean
  type?: string
}

function FormField({
  label,
  value,
  onChange,
  error,
  helper,
  required,
  placeholder,
  multiline,
  type = 'text',
}: FormFieldProps) {
  const InputComponent = multiline ? 'textarea' : 'input'

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <InputComponent
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-gray-800 border ${
          error ? 'border-red-500' : 'border-gray-700'
        } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          multiline ? 'min-h-[100px] resize-y' : ''
        }`}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {helper && !error && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  )
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  helper?: string
}

function SelectField({ label, value, onChange, options, helper }: SelectFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {helper && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  )
}

interface CheckboxFieldProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  helper?: string
}

function CheckboxField({ label, checked, onChange, helper }: CheckboxFieldProps) {
  return (
    <div className="space-y-1">
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500 focus:ring-2"
        />
        <span className="text-sm font-medium text-gray-300">{label}</span>
      </label>
      {helper && <p className="text-xs text-gray-500 ml-6">{helper}</p>}
    </div>
  )
}

interface AudioPreviewProps {
  text?: string
  voiceId?: string
  stability?: number
  similarityBoost?: number
}

function AudioPreview({ text = '', voiceId = '21m00Tcm4TlvDq8ikWAM', stability = 0.5, similarityBoost = 0.75 }: AudioPreviewProps) {
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handlePreview = async () => {
    setLoading(true)
    setError(null)
    setAudioUrl(null)
    try {
      const res = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId, stability, similarityBoost }),
      })
      if (!res.ok) throw new Error(`TTS failed (${res.status})`)
      const data = await res.json()
      if (data?.audioUrl) setAudioUrl(data.audioUrl)
      else throw new Error('No audioUrl returned')
    } catch (e: any) {
      setError(e?.message || 'Failed to generate preview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handlePreview}
        disabled={!text || loading}
        className="px-3 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? 'Generating…' : 'Preview Audio'}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {audioUrl && (
        <audio controls src={audioUrl} className="w-full" />
      )}
    </div>
  )
}
