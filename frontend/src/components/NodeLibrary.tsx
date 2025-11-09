'use client'

import React from 'react'
import { getNodesCategorized } from '@/lib/nodeRegistry'
import { NodeDefinition } from '@/lib/nodeTypes'

// Get nodes from registry, organized by category
const nodesByCategoryMap = getNodesCategorized()

export default function NodeLibrary() {
  const onDragStart = (event: React.DragEvent, node: NodeDefinition) => {
    event.dataTransfer.setData('application/reactflow', node.id)
    event.dataTransfer.setData('nodeLabel', node.label)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="w-80 h-full bg-gray-900 border-r border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Node Library</h2>
        <p className="text-sm text-gray-400 mt-1">Drag nodes to canvas</p>
      </div>

      <div className="p-4 space-y-6">
        {Object.entries(nodesByCategoryMap).map(([category, nodes]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              {category}
            </h3>
            <div className="space-y-2">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="group bg-gray-800 rounded-lg p-3 cursor-grab active:cursor-grabbing border border-gray-700 hover:border-gray-600 hover:bg-gray-750 transition-all"
                  draggable
                  onDragStart={(event) => onDragStart(event, node)}
                >
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                        {node.label}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {node.description}
                      </div>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-500 group-hover:text-gray-400 flex-shrink-0 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
