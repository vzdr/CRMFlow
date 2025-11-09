import { z } from 'zod'

/**
 * Categories for organizing nodes in the library
 */
export type NodeCategory = 'Trigger' | 'Agent' | 'Logic' | 'Integrations'

/**
 * Data types that can flow through node connections
 */
export type DataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'any'
  | 'audio'
  | 'sentiment'

/**
 * Input port definition for a node
 */
export interface NodeInput {
  id: string
  label: string
  type: DataType
  required?: boolean
}

/**
 * Output port definition for a node
 */
export interface NodeOutput {
  id: string
  label: string
  type: DataType
  description?: string
}

/**
 * Complete definition of a node type
 */
export interface NodeDefinition {
  /** Unique identifier for the node type */
  id: string

  /** Display category */
  category: NodeCategory

  /** Human-readable label */
  label: string

  /** Brief description of what the node does */
  description: string

  /** Input ports for incoming connections */
  inputs: NodeInput[]

  /** Output ports for outgoing connections */
  outputs: NodeOutput[]

  /** Zod schema for validating node configuration */
  configSchema: z.ZodObject<any>

  /** Key to identify the executor function that runs this node */
  executorKey: string

  /** Optional icon identifier */
  icon?: string

  /** Optional color for visual identification */
  color?: string

  /** Default configuration values */
  defaultConfig?: Record<string, any>
}

/**
 * Runtime node data stored in React Flow
 */
export interface NodeData {
  /** Node label (can be customized by user) */
  label: string

  /** Node type ID from registry */
  nodeType: string

  /** User configuration */
  config: Record<string, any>

  /** Any other custom data */
  [key: string]: any
}
