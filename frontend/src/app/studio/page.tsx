'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeTypes,
  ReactFlowInstance,
} from 'reactflow'
import 'reactflow/dist/style.css'
import NodeLibrary from '@/components/NodeLibrary'
import ConfigurationPanel from '@/components/ConfigurationPanel'
import TopToolbar from '@/components/TopToolbar'
import ExecutionPanel from '@/components/ExecutionPanel'
import { createDefaultNodeData } from '@/lib/nodeRegistry'
import { FlowExecutor, ExecutionLog } from '@/lib/flowExecutor'
import { getTemplate } from '@/lib/flowTemplates'

// Empty node registry - ready for custom node types
const nodeTypes: NodeTypes = {}

// Placeholder initial nodes
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    data: { label: 'Start Node' },
    position: { x: 250, y: 100 },
  },
  {
    id: '2',
    type: 'default',
    data: { label: 'Process Node' },
    position: { x: 250, y: 250 },
  },
  {
    id: '3',
    type: 'default',
    data: { label: 'End Node' },
    position: { x: 250, y: 400 },
  },
]

// Placeholder initial edges
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
]

const STORAGE_KEY = 'crmflow-studio-state'

let id = 0
const getId = () => `dndnode_${id++}`

export default function StudioPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isClient, setIsClient] = useState(false)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true)
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedState)
        setNodes(savedNodes || initialNodes)
        setEdges(savedEdges || initialEdges)
      } catch (error) {
        console.error('Failed to load saved state:', error)
        setNodes(initialNodes)
        setEdges(initialEdges)
      }
    } else {
      setNodes(initialNodes)
      setEdges(initialEdges)
    }
  }, [setNodes, setEdges])

  // Save to localStorage whenever nodes or edges change
  useEffect(() => {
    if (isClient && nodes.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }))
    }
  }, [nodes, edges, isClient])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const nodeType = event.dataTransfer.getData('application/reactflow')

      if (typeof nodeType === 'undefined' || !nodeType || !reactFlowInstance) {
        return
      }

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!reactFlowBounds) return

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      // Create node data from registry
      const nodeData = createDefaultNodeData(nodeType)
      if (!nodeData) {
        console.error(`Failed to create node data for type: ${nodeType}`)
        return
      }

      const newNode: Node = {
        id: getId(),
        type: 'default',
        position,
        data: nodeData,
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes]
  )

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node)
    },
    []
  )

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const onUpdateNode = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data }
          }
          return node
        })
      )

      // Update selected node to reflect changes
      setSelectedNode((current) => {
        if (current?.id === nodeId) {
          return { ...current, data }
        }
        return current
      })
    },
    [setNodes]
  )

  // Toolbar handlers
  const handleNew = useCallback(() => {
    if (confirm('Create a new flow? This will clear the current canvas.')) {
      setNodes([])
      setEdges([])
      setSelectedNode(null)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [setNodes, setEdges])

  const handleSave = useCallback(() => {
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }))
      // Could add a toast notification here
      console.log('Flow saved to localStorage')
    }
  }, [nodes, edges, isClient])

  const handleExport = useCallback(() => {
    const flowData = {
      nodes,
      edges,
      metadata: {
        version: '1.0',
        createdAt: new Date().toISOString(),
        name: 'CRMFlow Workflow',
      },
    }

    const dataStr = JSON.stringify(flowData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `crmflow-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [nodes, edges])

  const handleImport = useCallback(
    (data: { nodes: Node[]; edges: Edge[] }) => {
      setNodes(data.nodes || [])
      setEdges(data.edges || [])
      setSelectedNode(null)
      // Save to localStorage after import
      if (isClient) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      }
    },
    [setNodes, setEdges, isClient]
  )

  // Execute flow with optional initial context
  const handleRun = useCallback(async (initialContext = {}) => {
    if (isExecuting) return

    setIsExecuting(true)
    setExecutionLogs([])

    try {
      const executor = new FlowExecutor(nodes, edges)
      const result = await executor.execute(initialContext)
      setExecutionLogs(result.logs)
    } catch (error) {
      console.error('Execution error:', error)
    } finally {
      setIsExecuting(false)
    }
  }, [nodes, edges, isExecuting])

  // Simulate inbound call with realistic company data
  const handleSimulateCall = useCallback(async () => {
    // Rotate through different company scenarios
    const companies = [
      { name: 'Acme Corporation', caller: 'John Smith' }, // High-value existing customer
      { name: 'TechStart Inc', caller: 'Emily Chen' }, // High-value existing customer
      { name: 'SmallBiz Solutions', caller: 'Lisa Anderson' }, // Low-value existing customer
      { name: 'NewCompany Inc', caller: 'Mike Johnson' }, // New prospect (not in SAP)
    ]

    const randomIndex = Math.floor(Math.random() * companies.length)
    const company = companies[randomIndex]

    const callPayload = {
      callerId: '+14155551234',
      callerName: company.caller,
      callData: {
        from: '+14155551234',
        to: '+14155556789',
        callSid: 'CA' + Math.random().toString(36).substr(2, 32),
        accountSid: 'AC' + Math.random().toString(36).substr(2, 32),
        direction: 'inbound',
        forwardedFrom: null,
        callerCountry: 'US',
        callerState: 'CA',
        callerCity: 'San Francisco',
      },
      // Pre-populate entities that would come from Listen & Understand node
      extractedEntities: {
        companyName: company.name,
      },
    }

    console.log(`🎯 Simulating call from ${company.caller} at ${company.name}`)
    await handleRun(callPayload)
  }, [handleRun])

  // Simulate webhook with different scenarios
  const handleSimulateWebhook = useCallback(async () => {
    // Rotate through different webhook scenarios
    const scenarios = [
      // Customer Inquiry
      {
        event: 'customer.inquiry',
        data: {
          customerId: 'CUST-' + Math.floor(Math.random() * 10000),
          customerName: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+14155559876',
          subject: 'Product inquiry',
          message: 'I am interested in learning more about your enterprise solution.',
          source: 'website',
        },
      },
      // Candidate Application
      {
        event: 'candidate.application',
        data: {
          candidateName: 'Alex Johnson',
          email: 'alex.johnson@email.com',
          phone: '+14155558888',
          position: 'Software Engineer',
          resumeUrl: 'https://example.com/resumes/alex-johnson.pdf',
          yearsExperience: 5,
          education: 'BS Computer Science, MIT',
          skills: 'React, TypeScript, Node.js, Python, AWS',
          source: 'linkedin',
        },
      },
    ]

    const randomIndex = Math.floor(Math.random() * scenarios.length)
    const scenario = scenarios[randomIndex]

    const webhookPayload = {
      webhookPayload: {
        event: scenario.event,
        timestamp: new Date().toISOString(),
        data: scenario.data,
      },
      headers: {
        'content-type': 'application/json',
        'x-webhook-signature': 'simulated-signature',
        'user-agent': 'WebhookSimulator/1.0',
      },
    }

    console.log(`🎯 Simulating webhook: ${scenario.event}`)
    await handleRun(webhookPayload)
  }, [handleRun])

  const handleClearLogs = useCallback(() => {
    setExecutionLogs([])
  }, [])

  // Load template
  const handleLoadTemplate = useCallback((templateId: string) => {
    const template = getTemplate(templateId)
    if (!template) {
      console.error(`Template not found: ${templateId}`)
      return
    }

    // Confirm before replacing current flow
    if (nodes.length > 0) {
      if (!confirm(`Load "${template.name}" template? This will replace your current flow.`)) {
        return
      }
    }

    setNodes(template.nodes)
    setEdges(template.edges)
    setSelectedNode(null)

    // Save to localStorage
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes: template.nodes, edges: template.edges }))
    }

    console.log(`Template loaded: ${template.name}`)
  }, [nodes.length, setNodes, setEdges, isClient])

  if (!isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#141414] text-white">
        Loading...
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-[#141414] flex flex-col">
      <TopToolbar
        onNew={handleNew}
        onSave={handleSave}
        onExport={handleExport}
        onImport={handleImport}
        onRun={() => handleRun()}
        onSimulateCall={handleSimulateCall}
        onSimulateWebhook={handleSimulateWebhook}
        onLoadTemplate={handleLoadTemplate}
        isRunning={isExecuting}
      />
      <div className="flex-1 flex overflow-hidden">
        <NodeLibrary />
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[#1a1a1a]"
          >
            <Controls className="bg-gray-800 border border-gray-700" />
            <MiniMap
              className="bg-gray-800 border border-gray-700"
              nodeColor="#4b5563"
              maskColor="rgba(0, 0, 0, 0.6)"
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={12}
              size={1}
              color="#333"
            />
          </ReactFlow>
        </div>
        <ConfigurationPanel selectedNode={selectedNode} onUpdateNode={onUpdateNode} />
      </div>
      <ExecutionPanel logs={executionLogs} isExecuting={isExecuting} onClear={handleClearLogs} />
    </div>
  )
}
