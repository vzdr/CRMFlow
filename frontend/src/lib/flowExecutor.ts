import { Node, Edge } from 'reactflow'
import { getNodeDefinition } from './nodeRegistry'
import {
  isMockMode,
  twilioInboundSim,
  speakTextSim,
  geminiListenSim,
  geminiSentimentSim,
  sapCreateLeadMock,
  sapGetCustomerMock,
  googleReadSheetMock,
  googleCreateEventMock,
  qlayScreenCandidateMock,
} from './services/mock'
import { resolveContextPath, applyFieldMappings } from '@/components/FieldMappingEditor'

/**
 * Execution context passed between nodes
 */
export interface ExecutionContext {
  [key: string]: any
  _activeOutputs?: string[] // Special property to control which outputs are active for branching
}

/**
 * Log entry for execution tracking
 */
export interface ExecutionLog {
  id: string
  timestamp: Date
  level: 'info' | 'success' | 'warning' | 'error'
  nodeId?: string
  nodeLabel?: string
  message: string
  data?: any
}

/**
 * Execution result
 */
export interface ExecutionResult {
  success: boolean
  logs: ExecutionLog[]
  context: ExecutionContext
  error?: Error
}

/**
 * Node executor function type
 */
export type NodeExecutor = (
  node: Node,
  context: ExecutionContext,
  addLog: (log: Omit<ExecutionLog, 'id' | 'timestamp'>) => void
) => Promise<ExecutionContext>

/**
 * Flow Executor - Executes a flow from trigger nodes
 */
export class FlowExecutor {
  private nodes: Node[]
  private edges: Edge[]
  private logs: ExecutionLog[] = []
  private executedNodes: Set<string> = new Set()
  private logCounter = 0

  constructor(nodes: Node[], edges: Edge[]) {
    this.nodes = nodes
    this.edges = edges
  }

  /**
   * Add a log entry
   */
  private addLog(log: Omit<ExecutionLog, 'id' | 'timestamp'>): void {
    this.logs.push({
      ...log,
      id: `log-${this.logCounter++}`,
      timestamp: new Date(),
    })
  }

  /**
   * Get all edges coming out of a node
   */
  private getOutgoingEdges(nodeId: string): Edge[] {
    return this.edges.filter((edge) => edge.source === nodeId)
  }

  /**
   * Get all edges coming into a node
   */
  private getIncomingEdges(nodeId: string): Edge[] {
    return this.edges.filter((edge) => edge.target === nodeId)
  }

  /**
   * Find all trigger nodes (nodes with no incoming edges)
   */
  private findTriggerNodes(): Node[] {
    return this.nodes.filter((node) => {
      const definition = getNodeDefinition(node.data.nodeType)
      return definition?.category === 'Trigger'
    })
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    node: Node,
    context: ExecutionContext
  ): Promise<ExecutionContext> {
    const definition = getNodeDefinition(node.data.nodeType)
    if (!definition) {
      throw new Error(`Unknown node type: ${node.data.nodeType}`)
    }

    this.addLog({
      level: 'info',
      nodeId: node.id,
      nodeLabel: node.data.label,
      message: `Executing node: ${node.data.label}`,
    })

    try {
      // Get the executor function for this node type
      const executor = getNodeExecutor(definition.executorKey)

      // Execute the node
      const newContext = await executor(node, context, (log) =>
        this.addLog({
          ...log,
          nodeId: node.id,
          nodeLabel: node.data.label,
        })
      )

      this.addLog({
        level: 'success',
        nodeId: node.id,
        nodeLabel: node.data.label,
        message: `Completed: ${node.data.label}`,
      })

      this.executedNodes.add(node.id)
      return newContext
    } catch (error) {
      this.addLog({
        level: 'error',
        nodeId: node.id,
        nodeLabel: node.data.label,
        message: `Error in ${node.data.label}: ${error instanceof Error ? error.message : String(error)}`,
        data: error,
      })
      throw error
    }
  }

  /**
   * Execute nodes in sequence following the graph
   */
  private async executeFromNode(
    node: Node,
    context: ExecutionContext
  ): Promise<ExecutionContext> {
    // Skip if already executed (prevent cycles)
    if (this.executedNodes.has(node.id)) {
      return context
    }

    // Execute current node
    const newContext = await this.executeNode(node, context)

    // Get outgoing edges
    const outgoingEdges = this.getOutgoingEdges(node.id)

    // Filter edges based on active outputs (for conditional branching)
    const activeOutputs = newContext._activeOutputs
    const edgesToFollow = activeOutputs
      ? outgoingEdges.filter((edge) => {
          // If edge has a sourceHandle, check if it's in activeOutputs
          const edgeWithHandle = edge as Edge & { sourceHandle?: string }
          if (edgeWithHandle.sourceHandle) {
            return activeOutputs.includes(edgeWithHandle.sourceHandle)
          }
          // If no sourceHandle, follow the edge (backward compatibility)
          return true
        })
      : outgoingEdges

    // Clear activeOutputs for next node
    const contextForNext = { ...newContext }
    delete contextForNext._activeOutputs

    // Execute connected nodes
    for (const edge of edgesToFollow) {
      const nextNode = this.nodes.find((n) => n.id === edge.target)
      if (nextNode) {
        await this.executeFromNode(nextNode, contextForNext)
      }
    }

    return contextForNext
  }

  /**
   * Execute the entire flow
   */
  async execute(initialContext: ExecutionContext = {}): Promise<ExecutionResult> {
    this.logs = []
    this.executedNodes = new Set()
    this.logCounter = 0

    this.addLog({
      level: 'info',
      message: '🚀 Starting flow execution...',
    })

    try {
      // Find trigger nodes
      const triggerNodes = this.findTriggerNodes()

      if (triggerNodes.length === 0) {
        this.addLog({
          level: 'warning',
          message: 'No trigger nodes found in the flow',
        })
        return {
          success: false,
          logs: this.logs,
          context: initialContext,
        }
      }

      this.addLog({
        level: 'info',
        message: `Found ${triggerNodes.length} trigger node(s)`,
      })

      // Execute from each trigger
      let context = { ...initialContext }
      for (const trigger of triggerNodes) {
        context = await this.executeFromNode(trigger, context)
      }

      this.addLog({
        level: 'success',
        message: `✅ Flow execution completed successfully! Executed ${this.executedNodes.size} node(s).`,
      })

      return {
        success: true,
        logs: this.logs,
        context,
      }
    } catch (error) {
      this.addLog({
        level: 'error',
        message: `❌ Flow execution failed: ${error instanceof Error ? error.message : String(error)}`,
      })

      return {
        success: false,
        logs: this.logs,
        context: initialContext,
        error: error instanceof Error ? error : new Error(String(error)),
      }
    }
  }
}

/**
 * Get executor function for a node type
 */
function getNodeExecutor(executorKey: string): NodeExecutor {
  const executors: Record<string, NodeExecutor> = {
    // Trigger nodes
    webhook: async (node, context, addLog) => {
      addLog({ level: 'info', message: 'Webhook triggered' })
      return {
        ...context,
        webhookPayload: { message: 'Simulated webhook data' },
        headers: { 'content-type': 'application/json' },
      }
    },

    'inbound-call': async (node, context, addLog) => {
      addLog({ level: 'info', message: 'Inbound call received' })

      if (isMockMode()) {
        const callData = twilioInboundSim()
        addLog({
          level: 'info',
          message: `Call from ${callData.from} to ${callData.to}`,
          data: callData
        })
        return {
          ...context,
          callerId: callData.from,
          callData,
        }
      }

      // Real implementation would go here
      return {
        ...context,
        callerId: '+1234567890',
        callData: { duration: 0, status: 'connected' },
      }
    },

    // Agent nodes
    'speak-text': async (node, context, addLog) => {
      const text = node.data.config?.text || 'Hello'
      const voiceId = node.data.config?.voiceId || '21m00Tcm4TlvDq8ikWAM'
      const stability = typeof node.data.config?.stability === 'number' ? node.data.config.stability : 0.5
      const similarityBoost = typeof node.data.config?.similarityBoost === 'number' ? node.data.config.similarityBoost : 0.75

      // Replace variables in text
      let processedText = text
      Object.keys(context).forEach((key) => {
        processedText = processedText.replace(
          new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
          String(context[key])
        )
      })

      if (isMockMode()) {
        const result = speakTextSim(processedText, voiceId)
        addLog({
          level: 'info',
          message: `SpeakText (mock): "${processedText}"`,
          data: { duration: result.duration, characterCount: result.characterCount, audioUrl: result.audioUrl }
        })

        return {
          ...context,
          lastSpokenText: processedText,
          audioOutput: result.audioData,
          audioUrl: result.audioUrl,
        }
      }

      // Non-mock: request audio URL from API route
      addLog({
        level: 'info',
        message: `SpeakText: requesting TTS for voice ${voiceId}`,
      })

      try {
        const res = await fetch('/api/elevenlabs/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: processedText, voiceId, stability, similarityBoost }),
        })

        if (!res.ok) {
          throw new Error(`TTS request failed (${res.status})`)
        }
        const data = await res.json()
        const audioUrl = data?.audioUrl as string | undefined

        if (!audioUrl) {
          throw new Error('No audioUrl returned from TTS API')
        }

        addLog({ level: 'success', message: 'SpeakText: audio ready', data: { audioUrl } })

        return {
          ...context,
          lastSpokenText: processedText,
          audioUrl,
        }
      } catch (error) {
        addLog({ level: 'error', message: `SpeakText error: ${error instanceof Error ? error.message : String(error)}` })
        throw error
      }
    },

    'listen-understand': async (node, context, addLog) => {
      const timeout = node.data.config?.timeout || 10
      addLog({ level: 'info', message: `Listening for ${timeout} seconds...` })

      if (isMockMode()) {
        const result = geminiListenSim(undefined, context)
        addLog({
          level: 'info',
          message: `Heard: "${result.transcript}"`,
          data: { intent: result.intent, confidence: result.confidence }
        })

        return {
          ...context,
          userResponse: result.transcript,
          transcribedText: result.transcript,
          intent: { action: result.intent, confidence: result.confidence },
          entities: result.entities,
        }
      }

      // Simulate voice input
      const simulatedInput = 'Yes, I would like to proceed'

      addLog({ level: 'info', message: `Heard: "${simulatedInput}"` })

      return {
        ...context,
        userResponse: simulatedInput,
        transcribedText: simulatedInput,
        intent: { action: 'proceed', confidence: 0.95 },
      }
    },

    // Logic nodes
    condition: async (node, context, addLog) => {
      const expression = node.data.config?.expression || node.data.config?.condition || ''

      addLog({ level: 'info', message: `Evaluating expression: ${expression}` })

      let result = false
      try {
        // Replace variables with their values from context
        let processedExpression = expression

        // Replace {{variable}} syntax
        Object.keys(context).forEach((key) => {
          if (key.startsWith('_')) return // Skip internal properties
          const value = context[key]
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
          processedExpression = processedExpression.replace(regex, JSON.stringify(value))
        })

        // Also support direct variable names (without {{}} )
        Object.keys(context).forEach((key) => {
          if (key.startsWith('_')) return
          const value = context[key]
          // Match whole words only to avoid partial replacements
          const regex = new RegExp(`\\b${key}\\b`, 'g')
          processedExpression = processedExpression.replace(regex, JSON.stringify(value))
        })

        addLog({ level: 'info', message: `Processed expression: ${processedExpression}` })

        // Safe evaluation using Function constructor (safer than eval)
        // Still basic - in production use a proper expression parser
        try {
          const evalFunc = new Function(`return ${processedExpression}`)
          result = Boolean(evalFunc())
        } catch (e) {
          // Fallback: simple string matching
          const lower = processedExpression.toLowerCase()
          result = lower.includes('true') || lower.includes('"positive"') || lower.includes('"yes"')
        }
      } catch (error) {
        addLog({
          level: 'warning',
          message: `Expression evaluation failed: ${error instanceof Error ? error.message : String(error)}`
        })
        result = false
      }

      addLog({
        level: 'success',
        message: `Condition result: ${result ? 'TRUE' : 'FALSE'}`
      })

      return {
        ...context,
        conditionResult: result,
        _activeOutputs: result ? ['true'] : ['false'],
      }
    },

    'if-else': async (node, context, addLog) => {
      // Delegate to condition executor
      return executors['condition'](node, context, addLog)
    },

    sentiment: async (node, context, addLog) => {
      const textVariable = node.data.config?.textVariable || 'transcribedText'
      const inputText = context[textVariable] || context.userResponse || ''
      const useGemini = node.data.config?.useGemini || false

      addLog({ level: 'info', message: `Analyzing sentiment of: "${inputText}"` })

      let sentiment = 'neutral'
      let score = 0.5
      let analysis = ''
      let magnitude = 0.5

      if (useGemini && !isMockMode()) {
        // Call Gemini API
        try {
          const response = await fetch('/api/gemini/sentiment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: inputText }),
          })

          if (!response.ok) {
            throw new Error(`Gemini API failed: ${response.status}`)
          }

          const result = await response.json()
          sentiment = result.sentiment
          score = result.score
          analysis = result.analysis
          magnitude = result.magnitude || 0.5

          addLog({
            level: 'success',
            message: `Sentiment (Gemini): ${sentiment} (score: ${score.toFixed(2)})`,
            data: { analysis, magnitude }
          })
        } catch (error) {
          addLog({
            level: 'warning',
            message: `Gemini API failed, falling back to mock: ${error instanceof Error ? error.message : String(error)}`
          })
          // Fall back to mock
          const mockResult = geminiSentimentSim(String(inputText))
          sentiment = mockResult.sentiment
          score = mockResult.score
          analysis = mockResult.analysis
          magnitude = mockResult.magnitude
        }
      } else if (isMockMode() || useGemini) {
        // Use mock sentiment
        const result = geminiSentimentSim(String(inputText))
        sentiment = result.sentiment
        score = result.score
        analysis = result.analysis
        magnitude = result.magnitude

        addLog({
          level: 'success',
          message: `Sentiment (mock): ${sentiment} (score: ${score.toFixed(2)})`,
          data: { analysis, magnitude }
        })
      } else {
        // Simple keyword-based sentiment analysis
        const positiveWords = ['yes', 'good', 'great', 'excellent', 'proceed', 'happy', 'love', 'wonderful', 'amazing']
        const negativeWords = ['no', 'bad', 'terrible', 'sad', 'angry', 'hate', 'awful', 'horrible']

        const lowerText = String(inputText).toLowerCase()
        const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length
        const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length

        if (positiveCount > negativeCount) {
          sentiment = 'positive'
          score = Math.min(0.5 + (positiveCount * 0.15), 1.0)
        } else if (negativeCount > positiveCount) {
          sentiment = 'negative'
          score = Math.max(0.5 - (negativeCount * 0.15), 0.0)
        } else {
          sentiment = 'neutral'
          score = 0.5
        }

        magnitude = (positiveCount + negativeCount) * 0.2

        addLog({
          level: 'success',
          message: `Sentiment (keyword): ${sentiment} (score: ${score.toFixed(2)})`
        })
      }

      // Determine which output to activate based on sentiment
      let activeOutput = sentiment
      if (sentiment === 'positive') {
        activeOutput = 'positive'
      } else if (sentiment === 'negative') {
        activeOutput = 'negative'
      } else {
        activeOutput = 'neutral'
      }

      return {
        ...context,
        sentiment,
        sentimentScore: score,
        sentimentMagnitude: magnitude,
        sentimentAnalysis: analysis,
        _activeOutputs: [activeOutput],
      }
    },

    // Integration nodes
    'sap-create-lead': async (node, context, addLog) => {
      const endpoint = node.data.config?.endpoint || '/api/leads'
      const fieldMappings = node.data.config?.fieldMappings || {}

      addLog({ level: 'info', message: `Creating SAP lead at ${endpoint}` })

      // Apply field mappings to get lead data from context
      const leadData = applyFieldMappings(context, fieldMappings)

      // Log mapped fields
      addLog({
        level: 'info',
        message: `Mapped fields from context`,
        data: leadData
      })

      // Validate required fields
      if (!leadData.companyName) {
        addLog({
          level: 'warning',
          message: 'Missing required field: companyName. Using fallback value.',
        })
        leadData.companyName = 'Unknown Company'
      }

      if (isMockMode()) {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const result = sapCreateLeadMock(leadData)
        addLog({
          level: 'success',
          message: `Lead created: ${result.leadId} for ${result.companyName}`,
          data: result
        })

        return {
          ...context,
          leadId: result.leadId,
          sapLead: result,
          sapResponse: { success: true, id: result.leadId },
        }
      }

      // Real implementation would call SAP API here
      await new Promise((resolve) => setTimeout(resolve, 500))

      const leadId = `LEAD-${Date.now()}`
      addLog({ level: 'success', message: `Lead created with ID: ${leadId}` })

      return {
        ...context,
        leadId,
        sapLead: leadData,
        sapResponse: { success: true, id: leadId },
      }
    },

    'sap-get-customer': async (node, context, addLog) => {
      const endpoint = node.data.config?.endpoint || '/api/customers'
      const searchField = node.data.config?.searchField || 'customerId'
      const searchValuePath = node.data.config?.searchValue || 'customerId'

      // Resolve search value from context
      const searchValue = resolveContextPath(context, searchValuePath)

      if (!searchValue) {
        addLog({
          level: 'warning',
          message: `Search value not found in context at path: ${searchValuePath}`,
        })
        return {
          ...context,
          customer: null,
        }
      }

      addLog({
        level: 'info',
        message: `Fetching customer by ${searchField}: ${searchValue}`,
      })

      if (isMockMode()) {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const customer = sapGetCustomerMock(String(searchValue))

        if (customer) {
          addLog({
            level: 'success',
            message: `Customer found: ${customer.companyName}`,
            data: customer
          })

          return {
            ...context,
            customer,
            customerId: customer.customerId,
            companyName: customer.companyName,
          }
        } else {
          addLog({
            level: 'warning',
            message: `Customer not found for ${searchField}: ${searchValue}`,
          })

          return {
            ...context,
            customer: null,
          }
        }
      }

      // Real implementation would call SAP API here
      await new Promise((resolve) => setTimeout(resolve, 500))

      const customer = {
        customerId: 'CUST-' + Date.now(),
        companyName: 'Sample Customer',
        email: 'customer@example.com',
        phone: '+1234567890',
      }

      addLog({ level: 'success', message: `Customer retrieved: ${customer.companyName}` })

      return {
        ...context,
        customer,
        customerId: customer.customerId,
        companyName: customer.companyName,
      }
    },

    'google-read-sheet': async (node, context, addLog) => {
      const spreadsheetId = node.data.config?.spreadsheetId || 'demo-sheet'
      const sheetName = node.data.config?.sheetName || 'Sheet1'
      const range = node.data.config?.range || 'A1:Z100'
      const includeHeaders = node.data.config?.includeHeaders ?? true

      addLog({
        level: 'info',
        message: `Reading Google Sheet ${spreadsheetId} (${sheetName}!${range})`
      })

      if (isMockMode()) {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const sheetData = googleReadSheetMock(spreadsheetId, range, sheetName)
        addLog({
          level: 'success',
          message: `Read ${sheetData.length} rows from Google Sheet`,
          data: { rowCount: sheetData.length, spreadsheetId, sheetName }
        })

        return {
          ...context,
          sheetData,
          rows: sheetData.length,
        }
      }

      // Real implementation - call API endpoint
      try {
        const response = await fetch('/api/google/sheets/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spreadsheetId,
            sheetName,
            range,
            includeHeaders,
            credentialsRef: node.data.config?.credentialsRef,
          }),
        })

        if (!response.ok) {
          throw new Error(`Google Sheets API failed: ${response.status}`)
        }

        const data = await response.json()
        const sheetData = data.values || []

        addLog({
          level: 'success',
          message: `Read ${sheetData.length} rows from Google Sheet`
        })

        return {
          ...context,
          sheetData,
          rows: sheetData.length,
        }
      } catch (error) {
        addLog({
          level: 'error',
          message: `Google Sheets error: ${error instanceof Error ? error.message : String(error)}`
        })
        throw error
      }
    },

    'google-create-event': async (node, context, addLog) => {
      const calendarId = node.data.config?.calendarId || 'primary'
      const fieldMappings = node.data.config?.fieldMappings || {}

      addLog({ level: 'info', message: `Creating calendar event in ${calendarId}` })

      // Apply field mappings to get event data from context
      const eventData = applyFieldMappings(context, fieldMappings)

      // Log mapped fields
      addLog({
        level: 'info',
        message: `Mapped event fields from context`,
        data: eventData
      })

      // Validate required fields
      if (!eventData.summary) {
        addLog({
          level: 'warning',
          message: 'Missing required field: summary. Using fallback value.',
        })
        eventData.summary = 'CRMFlow Event'
      }

      if (!eventData.startTime) {
        addLog({
          level: 'warning',
          message: 'Missing required field: startTime. Using default (1 day from now).',
        })
        eventData.startTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }

      // Set end time if not provided (1 hour after start)
      if (!eventData.endTime && eventData.startTime) {
        const start = new Date(eventData.startTime)
        eventData.endTime = new Date(start.getTime() + 60 * 60 * 1000).toISOString()
      }

      if (isMockMode()) {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const event = googleCreateEventMock({
          summary: eventData.summary,
          description: eventData.description || '',
          startDateTime: eventData.startTime,
          endDateTime: eventData.endTime,
          location: eventData.location,
          attendees: eventData.attendees,
        })

        addLog({
          level: 'success',
          message: `Event created: ${event.summary}`,
          data: { eventId: event.id, htmlLink: event.htmlLink }
        })

        return {
          ...context,
          eventId: event.id,
          eventLink: event.htmlLink,
          event: event,
          calendarEvent: event,
        }
      }

      // Real implementation - call API endpoint
      try {
        const response = await fetch('/api/google/calendar/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            calendarId,
            eventData,
            credentialsRef: node.data.config?.credentialsRef,
          }),
        })

        if (!response.ok) {
          throw new Error(`Google Calendar API failed: ${response.status}`)
        }

        const result = await response.json()

        addLog({
          level: 'success',
          message: `Event created: ${result.summary}`,
          data: result
        })

        return {
          ...context,
          eventId: result.id,
          eventLink: result.htmlLink,
          event: result,
          calendarEvent: result,
        }
      } catch (error) {
        addLog({
          level: 'error',
          message: `Google Calendar error: ${error instanceof Error ? error.message : String(error)}`
        })
        throw error
      }
    },

    'qlay-screen-candidate': async (node, context, addLog) => {
      const jobId = node.data.config?.jobId || 'JOB-123'
      const position = node.data.config?.position || 'Software Engineer'
      const fieldMappings = node.data.config?.fieldMappings || {}

      addLog({
        level: 'info',
        message: `Screening candidate for ${position} (Job ID: ${jobId})`
      })

      // Apply field mappings to get candidate data from context
      const candidateData = applyFieldMappings(context, fieldMappings)

      // Log mapped fields
      addLog({
        level: 'info',
        message: `Mapped candidate fields from context`,
        data: candidateData
      })

      // Validate required fields
      if (!candidateData.name) {
        addLog({
          level: 'warning',
          message: 'Missing required field: name. Using fallback value.',
        })
        candidateData.name = 'Unknown Candidate'
      }

      // Add position and jobId to candidate data
      candidateData.position = position
      candidateData.jobId = jobId

      if (isMockMode()) {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const result = qlayScreenCandidateMock(candidateData)

        addLog({
          level: 'success',
          message: `Screening complete for ${result.candidateName}: ${result.recommendation.toUpperCase()} (score: ${result.overallScore})`,
          data: {
            screeningId: result.screeningId,
            overallScore: result.overallScore,
            recommendation: result.recommendation,
            competencies: result.competencies
          }
        })

        return {
          ...context,
          screeningId: result.screeningId,
          screeningResult: result,
          overallScore: result.overallScore,
          recommendation: result.recommendation,
          qualified: result.recommendation === 'strong_yes' || result.recommendation === 'yes',
          screeningScore: result.overallScore, // Backward compatibility
        }
      }

      // Real implementation - call API endpoint
      try {
        const response = await fetch('/api/qlay/screen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId,
            position,
            candidateData,
            credentialsRef: node.data.config?.credentialsRef,
          }),
        })

        if (!response.ok) {
          throw new Error(`Qlay API failed: ${response.status}`)
        }

        const result = await response.json()

        addLog({
          level: 'success',
          message: `Screening complete: ${result.recommendation.toUpperCase()} (score: ${result.overallScore})`,
          data: result
        })

        return {
          ...context,
          screeningId: result.screeningId,
          screeningResult: result,
          overallScore: result.overallScore,
          recommendation: result.recommendation,
          qualified: result.recommendation === 'strong_yes' || result.recommendation === 'yes',
          screeningScore: result.overallScore,
        }
      } catch (error) {
        addLog({
          level: 'error',
          message: `Qlay screening error: ${error instanceof Error ? error.message : String(error)}`
        })
        throw error
      }
    },
  }

  return executors[executorKey] || defaultExecutor
}

/**
 * Default executor for unknown node types
 */
const defaultExecutor: NodeExecutor = async (node, context, addLog) => {
  addLog({
    level: 'warning',
    message: `No executor found for node type: ${node.data.nodeType}`,
  })
  return context
}
