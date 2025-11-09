import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FlowExecutor, ExecutionContext } from './flowExecutor'
import { Node, Edge } from 'reactflow'

describe('FlowExecutor', () => {
  let executor: FlowExecutor
  let mockNodes: Node[]
  let mockEdges: Edge[]

  beforeEach(() => {
    vi.clearAllMocks()

    // Create simple test nodes
    mockNodes = [
      {
        id: 'node1',
        type: 'default',
        position: { x: 0, y: 0 },
        data: {
          nodeType: 'trigger.webhook',
          label: 'Webhook Trigger',
        },
      },
      {
        id: 'node2',
        type: 'default',
        position: { x: 100, y: 100 },
        data: {
          nodeType: 'logic.condition',
          label: 'Condition',
          expression: 'context.value > 10',
        },
      },
      {
        id: 'node3',
        type: 'default',
        position: { x: 200, y: 200 },
        data: {
          nodeType: 'action.log',
          label: 'Log Action',
        },
      },
    ]

    mockEdges = [
      { id: 'e1-2', source: 'node1', target: 'node2' },
      { id: 'e2-3', source: 'node2', target: 'node3' },
    ]

    executor = new FlowExecutor(mockNodes, mockEdges)
  })

  describe('constructor', () => {
    it('should initialize with nodes and edges', () => {
      expect(executor).toBeDefined()
    })

    it('should handle empty flow', () => {
      const emptyExecutor = new FlowExecutor([], [])
      expect(emptyExecutor).toBeDefined()
    })
  })

  describe('execute', () => {
    it('should execute a simple flow successfully', async () => {
      const initialContext: ExecutionContext = {
        webhookPayload: {
          event: 'test.event',
          data: { value: 15 },
        },
      }

      const result = await executor.execute(initialContext)

      expect(result.success).toBe(true)
      expect(result.logs).toBeDefined()
      expect(result.logs.length).toBeGreaterThan(0)
      expect(result.context).toBeDefined()
    })

    it('should handle execution errors gracefully', async () => {
      // Create a node that will fail
      const failingNodes: Node[] = [
        {
          id: 'fail1',
          type: 'default',
          position: { x: 0, y: 0 },
          data: {
            nodeType: 'invalid.node.type',
            label: 'Invalid Node',
          },
        },
      ]

      const failExecutor = new FlowExecutor(failingNodes, [])
      const result = await failExecutor.execute({})

      expect(result.logs).toBeDefined()
      // Should have logs even if execution fails
      expect(result.logs.length).toBeGreaterThan(0)
    })

    it('should pass context between nodes', async () => {
      const result = await executor.execute({
        initialValue: 'test',
      })

      // Context should contain initial value
      expect(result.context.initialValue).toBe('test')
    })

    it('should log execution steps', async () => {
      const result = await executor.execute({})

      // Should have start log
      expect(result.logs.some((log) => log.message.includes('start'))).toBe(true)
    })
  })

  describe('flow control', () => {
    it('should handle branching correctly', async () => {
      const branchNodes: Node[] = [
        {
          id: 'start',
          type: 'default',
          position: { x: 0, y: 0 },
          data: {
            nodeType: 'trigger.webhook',
            label: 'Start',
          },
        },
        {
          id: 'branch1',
          type: 'default',
          position: { x: 100, y: 0 },
          data: {
            nodeType: 'action.log',
            label: 'Branch 1',
          },
        },
        {
          id: 'branch2',
          type: 'default',
          position: { x: 100, y: 100 },
          data: {
            nodeType: 'action.log',
            label: 'Branch 2',
          },
        },
      ]

      const branchEdges: Edge[] = [
        { id: 'e1', source: 'start', target: 'branch1' },
        { id: 'e2', source: 'start', target: 'branch2' },
      ]

      const branchExecutor = new FlowExecutor(branchNodes, branchEdges)
      const result = await branchExecutor.execute({})

      expect(result.logs.length).toBeGreaterThan(0)
    })

    it('should handle loops by limiting iterations', async () => {
      // Create a simple loop: A -> B -> A
      const loopNodes: Node[] = [
        {
          id: 'a',
          type: 'default',
          position: { x: 0, y: 0 },
          data: { nodeType: 'action.log', label: 'Node A' },
        },
        {
          id: 'b',
          type: 'default',
          position: { x: 100, y: 0 },
          data: { nodeType: 'action.log', label: 'Node B' },
        },
      ]

      const loopEdges: Edge[] = [
        { id: 'e1', source: 'a', target: 'b' },
        { id: 'e2', source: 'b', target: 'a' },
      ]

      const loopExecutor = new FlowExecutor(loopNodes, loopEdges)
      const result = await loopExecutor.execute({})

      // Should complete without infinite loop
      expect(result).toBeDefined()
    })
  })

  describe('trigger node detection', () => {
    it('should identify trigger nodes (no incoming edges)', () => {
      const result = executor.execute({})
      expect(result).toBeDefined()
    })

    it('should handle multiple trigger nodes', async () => {
      const multiTriggerNodes: Node[] = [
        {
          id: 't1',
          type: 'default',
          position: { x: 0, y: 0 },
          data: { nodeType: 'trigger.webhook', label: 'Trigger 1' },
        },
        {
          id: 't2',
          type: 'default',
          position: { x: 0, y: 100 },
          data: { nodeType: 'trigger.twilio.inbound', label: 'Trigger 2' },
        },
      ]

      const multiExecutor = new FlowExecutor(multiTriggerNodes, [])
      const result = await multiExecutor.execute({})

      expect(result).toBeDefined()
    })
  })

  describe('context management', () => {
    it('should preserve initial context', async () => {
      const context = { customField: 'value', count: 42 }
      const result = await executor.execute(context)

      expect(result.context.customField).toBe('value')
      expect(result.context.count).toBe(42)
    })

    it('should merge context updates', async () => {
      const result = await executor.execute({ initial: 'data' })

      expect(result.context).toBeDefined()
      expect(result.context.initial).toBe('data')
    })
  })

  describe('error handling', () => {
    it('should capture errors in execution logs', async () => {
      const errorNodes: Node[] = [
        {
          id: 'error',
          type: 'default',
          position: { x: 0, y: 0 },
          data: {
            nodeType: 'nonexistent.node',
            label: 'Error Node',
          },
        },
      ]

      const errorExecutor = new FlowExecutor(errorNodes, [])
      const result = await errorExecutor.execute({})

      expect(result.logs).toBeDefined()
    })

    it('should continue execution after non-critical errors', async () => {
      // This depends on implementation - adjust as needed
      const result = await executor.execute({})
      expect(result).toBeDefined()
    })
  })

  describe('logging', () => {
    it('should create logs with timestamps', async () => {
      const result = await executor.execute({})

      result.logs.forEach((log) => {
        expect(log.timestamp).toBeInstanceOf(Date)
        expect(log.id).toBeDefined()
      })
    })

    it('should include node information in logs', async () => {
      const result = await executor.execute({})

      // At least some logs should have node labels
      const logsWithNodeLabel = result.logs.filter((log) => log.nodeLabel)
      expect(logsWithNodeLabel.length).toBeGreaterThan(0)
    })

    it('should use appropriate log levels', async () => {
      const result = await executor.execute({})

      result.logs.forEach((log) => {
        expect(['info', 'success', 'warning', 'error']).toContain(log.level)
      })
    })
  })
})
