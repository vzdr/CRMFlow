import { z } from 'zod'
import { NodeDefinition, NodeData } from './nodeTypes'

/**
 * Node Registry - Central source of truth for all node types
 */

// ============================================================================
// TRIGGER NODES
// ============================================================================

const webhookNode: NodeDefinition = {
  id: 'webhook',
  category: 'Trigger',
  label: 'Webhook',
  description: 'Trigger from HTTP webhook',
  inputs: [],
  outputs: [
    { id: 'payload', label: 'Payload', type: 'object' },
    { id: 'headers', label: 'Headers', type: 'object' },
  ],
  configSchema: z.object({
    label: z.string().min(1, 'Label is required'),
    description: z.string().optional(),
    webhookId: z.string().default('demo-webhook'),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH']).default('POST'),
  }),
  executorKey: 'webhook',
  defaultConfig: {
    label: 'Webhook',
    webhookId: 'demo-webhook',
    method: 'POST',
  },
}

const inboundCallNode: NodeDefinition = {
  id: 'inbound-call',
  category: 'Trigger',
  label: 'Inbound Call',
  description: 'Trigger from incoming call',
  inputs: [],
  outputs: [
    { id: 'callerId', label: 'Caller ID', type: 'string' },
    { id: 'callData', label: 'Call Data', type: 'object' },
  ],
  configSchema: z.object({
    label: z.string().min(1, 'Label is required'),
    description: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
  executorKey: 'inbound-call',
  defaultConfig: {
    label: 'Inbound Call',
  },
}

// ============================================================================
// AGENT NODES
// ============================================================================

const speakTextNode: NodeDefinition = {
  id: 'speak-text',
  category: 'Agent',
  label: 'Speak Text',
  description: 'Convert text to speech (ElevenLabs)',
  inputs: [{ id: 'text', label: 'Text Input', type: 'string', required: false }],
  outputs: [{ id: 'audio', label: 'Audio Output', type: 'audio' }],
  configSchema: z.object({
    label: z.string().min(1, 'Label is required'),
    description: z.string().optional(),
    text: z.string().min(1, 'Text is required'),
    voiceId: z.string().default('21m00Tcm4TlvDq8ikWAM'),
    stability: z.number().min(0).max(1).default(0.5),
    similarityBoost: z.number().min(0).max(1).default(0.75),
  }),
  executorKey: 'speak-text',
  defaultConfig: {
    label: 'Speak Text',
    text: '',
    voiceId: '21m00Tcm4TlvDq8ikWAM',
    stability: 0.5,
    similarityBoost: 0.75,
  },
}

const listenUnderstandNode: NodeDefinition = {
  id: 'listen-understand',
  category: 'Agent',
  label: 'Listen & Understand',
  description: 'Voice recognition and NLU',
  inputs: [{ id: 'audio', label: 'Audio Input', type: 'audio', required: false }],
  outputs: [
    { id: 'text', label: 'Transcribed Text', type: 'string' },
    { id: 'intent', label: 'Intent', type: 'object' },
    { id: 'entities', label: 'Entities', type: 'object' },
  ],
  configSchema: z.object({
    label: z.string().min(1, 'Label is required'),
    description: z.string().optional(),
    inputMode: z.enum(['voice', 'text']).default('voice'),
    language: z.string().default('en-US'),
    maxDuration: z.number().min(1).max(300).default(30),
    promptTemplate: z.string().optional(),
  }),
  executorKey: 'listen-understand',
  defaultConfig: {
    label: 'Listen & Understand',
    inputMode: 'voice',
    language: 'en-US',
    maxDuration: 30,
    promptTemplate: '',
  },
}

// ============================================================================
// LOGIC NODES
// ============================================================================

const conditionNode: NodeDefinition = {
  id: 'condition',
  category: 'Logic',
  label: 'Condition',
  description: 'Evaluate expression and branch',
  inputs: [{ id: 'input', label: 'Input', type: 'any', required: false }],
  outputs: [
    { id: 'true', label: 'True', type: 'any', description: 'Executes if condition is true' },
    { id: 'false', label: 'False', type: 'any', description: 'Executes if condition is false' },
  ],
  configSchema: z.object({
    label: z.string().min(1, 'Label is required'),
    description: z.string().optional(),
    expression: z.string().min(1, 'Expression is required'),
  }),
  executorKey: 'condition',
  defaultConfig: {
    label: 'Condition',
    expression: '',
  },
}

// Keep if-else as alias for backward compatibility
const ifElseNode: NodeDefinition = {
  id: 'if-else',
  category: 'Logic',
  label: 'If/Else',
  description: 'Conditional branching',
  inputs: [{ id: 'input', label: 'Input', type: 'any', required: false }],
  outputs: [
    { id: 'true', label: 'True', type: 'any' },
    { id: 'false', label: 'False', type: 'any' },
  ],
  configSchema: z.object({
    label: z.string().min(1, 'Label is required'),
    description: z.string().optional(),
    condition: z.string().min(1, 'Condition is required'),
  }),
  executorKey: 'condition',
  defaultConfig: {
    label: 'If/Else',
    condition: '',
  },
}

const sentimentNode: NodeDefinition = {
  id: 'sentiment',
  category: 'Logic',
  label: 'Sentiment Analysis',
  description: 'Analyze sentiment and branch on result',
  inputs: [{ id: 'text', label: 'Text', type: 'string', required: false }],
  outputs: [
    { id: 'positive', label: 'Positive', type: 'any', description: 'Executes if sentiment is positive' },
    { id: 'negative', label: 'Negative', type: 'any', description: 'Executes if sentiment is negative' },
    { id: 'neutral', label: 'Neutral', type: 'any', description: 'Executes if sentiment is neutral' },
  ],
  configSchema: z.object({
    label: z.string().min(1, 'Label is required'),
    description: z.string().optional(),
    textVariable: z.string().default('transcribedText'),
    useGemini: z.boolean().default(false),
  }),
  executorKey: 'sentiment',
  defaultConfig: {
    label: 'Sentiment Analysis',
    textVariable: 'transcribedText',
    useGemini: false,
  },
}

// ============================================================================
// INTEGRATION NODES
// ============================================================================

const sapCreateLeadNode: NodeDefinition = {
  id: 'sap-create-lead',
  category: 'Integrations',
  label: 'SAP Create Lead',
  description: 'Create lead in SAP',
  inputs: [{ id: 'leadData', label: 'Lead Data', type: 'object', required: false }],
  outputs: [
    { id: 'leadId', label: 'Lead ID', type: 'string' },
    { id: 'response', label: 'Response', type: 'object' },
  ],
  configSchema: z.object({
    label: z.string().min(1, 'Label is required'),
    description: z.string().optional(),
    credentialsRef: z.string().optional(),
    endpoint: z.string().default('/api/leads'),
    fieldMappings: z.record(z.string()).optional(),
  }),
  executorKey: 'sap-create-lead',
  defaultConfig: {
    label: 'SAP Create Lead',
    endpoint: '/api/leads',
    fieldMappings: {
      companyName: 'webhookPayload.data.customerName',
      contactName: 'callerName',
      email: 'webhookPayload.data.email',
      phone: 'callerId',
      source: '"webhook"',
    },
  },
}

const sapGetCustomerNode: NodeDefinition = {
  id: 'sap-get-customer',
  category: 'Integrations',
  label: 'SAP Get Customer',
  description: 'Retrieve customer from SAP',
  inputs: [{ id: 'customerId', label: 'Customer ID', type: 'string', required: false }],
  outputs: [{ id: 'customer', label: 'Customer Data', type: 'object' }],
  configSchema: z.object({
    label: z.string().min(1, 'Label is required'),
    description: z.string().optional(),
    credentialsRef: z.string().optional(),
    endpoint: z.string().default('/api/customers'),
    searchField: z.string().default('customerId'),
    searchValue: z.string().optional(),
  }),
  executorKey: 'sap-get-customer',
  defaultConfig: {
    label: 'SAP Get Customer',
    endpoint: '/api/customers',
    searchField: 'customerId',
    searchValue: 'webhookPayload.data.customerId',
  },
}

const googleReadSheetNode: NodeDefinition = {
  id: 'google-read-sheet',
  category: 'Integrations',
  label: 'Google Read Sheet',
  description: 'Read data from Google Sheets',
  inputs: [],
  outputs: [
    { id: 'data', label: 'Sheet Data', type: 'array' },
    { id: 'rows', label: 'Row Count', type: 'number' },
  ],
  configSchema: z.object({
    label: z.string().min(1, 'Label is required'),
    description: z.string().optional(),
    credentialsRef: z.string().optional(),
    spreadsheetId: z.string().default(''),
    sheetName: z.string().default('Sheet1'),
    range: z.string().optional(),
    includeHeaders: z.boolean().default(true),
  }),
  executorKey: 'google-read-sheet',
  defaultConfig: {
    label: 'Google Read Sheet',
    spreadsheetId: '',
    sheetName: 'Sheet1',
    range: 'A1:Z100',
    includeHeaders: true,
  },
}

const googleCreateEventNode: NodeDefinition = {
  id: 'google-create-event',
  category: 'Integrations',
  label: 'Google Create Event',
  description: 'Create calendar event',
  inputs: [{ id: 'eventData', label: 'Event Data', type: 'object', required: false }],
  outputs: [
    { id: 'eventId', label: 'Event ID', type: 'string' },
    { id: 'eventLink', label: 'Event Link', type: 'string' },
    { id: 'event', label: 'Event Object', type: 'object' },
  ],
  configSchema: z.object({
    label: z.string().min(1, 'Label is required'),
    description: z.string().optional(),
    credentialsRef: z.string().optional(),
    calendarId: z.string().default('primary'),
    fieldMappings: z.record(z.string()).optional(),
  }),
  executorKey: 'google-create-event',
  defaultConfig: {
    label: 'Google Create Event',
    calendarId: 'primary',
    fieldMappings: {
      summary: 'webhookPayload.data.subject',
      description: 'transcribedText',
      startTime: 'webhookPayload.data.startTime',
      endTime: 'webhookPayload.data.endTime',
      attendees: 'webhookPayload.data.email',
      location: '"Virtual"',
    },
  },
}

const qlayScreenCandidateNode: NodeDefinition = {
  id: 'qlay-screen-candidate',
  category: 'Integrations',
  label: 'Qlay Screen Candidate',
  description: 'AI-powered candidate screening',
  inputs: [{ id: 'candidateData', label: 'Candidate Data', type: 'object', required: false }],
  outputs: [
    { id: 'screeningId', label: 'Screening ID', type: 'string' },
    { id: 'screeningResult', label: 'Screening Result', type: 'object' },
    { id: 'overallScore', label: 'Overall Score', type: 'number' },
    { id: 'recommendation', label: 'Recommendation', type: 'string' },
  ],
  configSchema: z.object({
    label: z.string().min(1, 'Label is required'),
    description: z.string().optional(),
    credentialsRef: z.string().optional(),
    jobId: z.string().default(''),
    position: z.string().default(''),
    fieldMappings: z.record(z.string()).optional(),
  }),
  executorKey: 'qlay-screen-candidate',
  defaultConfig: {
    label: 'Qlay Screen Candidate',
    jobId: '',
    position: 'Software Engineer',
    fieldMappings: {
      name: 'callerName',
      email: 'webhookPayload.data.email',
      phone: 'callerId',
      resume: 'webhookPayload.data.resumeUrl',
      transcript: 'transcribedText',
      experience: 'webhookPayload.data.yearsExperience',
      education: 'webhookPayload.data.education',
    },
  },
}

// ============================================================================
// REGISTRY
// ============================================================================

/**
 * All registered nodes
 */
const nodes: NodeDefinition[] = [
  // Triggers
  webhookNode,
  inboundCallNode,
  // Agent
  speakTextNode,
  listenUnderstandNode,
  // Logic
  conditionNode,
  ifElseNode,
  sentimentNode,
  // Integrations
  sapCreateLeadNode,
  sapGetCustomerNode,
  googleReadSheetNode,
  googleCreateEventNode,
  qlayScreenCandidateNode,
]

/**
 * Map for quick lookup by node ID
 */
const nodeMap = new Map<string, NodeDefinition>(nodes.map((node) => [node.id, node]))

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a node definition by ID
 */
export function getNodeDefinition(nodeId: string): NodeDefinition | undefined {
  return nodeMap.get(nodeId)
}

/**
 * Get all node definitions
 */
export function getAllNodeDefinitions(): NodeDefinition[] {
  return [...nodes]
}

/**
 * Get node definitions by category
 */
export function getNodesByCategory(category: string): NodeDefinition[] {
  return nodes.filter((node) => node.category === category)
}

/**
 * Get all categories
 */
export function getCategories(): string[] {
  return Array.from(new Set(nodes.map((node) => node.category)))
}

/**
 * Create default node data for a given node type
 */
export function createDefaultNodeData(nodeId: string): NodeData | null {
  const definition = getNodeDefinition(nodeId)
  if (!definition) {
    console.error(`Node definition not found for: ${nodeId}`)
    return null
  }

  return {
    label: definition.label,
    nodeType: nodeId,
    config: definition.defaultConfig || {},
  }
}

/**
 * Validate node configuration against its schema
 */
export function validateNodeConfig(
  nodeId: string,
  config: Record<string, any>
): { success: boolean; errors?: z.ZodError; data?: any } {
  const definition = getNodeDefinition(nodeId)
  if (!definition) {
    return {
      success: false,
      errors: new z.ZodError([
        {
          code: 'custom',
          message: `Node definition not found: ${nodeId}`,
          path: [],
        },
      ]),
    }
  }

  const result = definition.configSchema.safeParse(config)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

/**
 * Get nodes organized by category for UI display
 */
export function getNodesCategorized(): Record<string, NodeDefinition[]> {
  const categorized: Record<string, NodeDefinition[]> = {}

  nodes.forEach((node) => {
    if (!categorized[node.category]) {
      categorized[node.category] = []
    }
    categorized[node.category].push(node)
  })

  return categorized
}

// Export the registry
export const nodeRegistry = {
  getNodeDefinition,
  getAllNodeDefinitions,
  getNodesByCategory,
  getCategories,
  createDefaultNodeData,
  validateNodeConfig,
  getNodesCategorized,
}

export default nodeRegistry
