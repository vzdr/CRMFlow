import { create } from 'zustand';

const useFlowStore = create((set, get) => ({
  // State
  nodes: [],
  edges: [],
  isRunning: false,
  activeNodeId: null,
  completedNodeIds: [], // Track which nodes have been executed
  executionMode: 'auto', // 'auto' = auto-advance (Run Workflow), 'manual' = wait for user (Live Test)

  // Node management functions
  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node]
    }));
  },

  updateNodePosition: (nodeId, newPosition) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, position: newPosition }
          : node
      )
    }));
  },

  // Edge management functions
  addEdge: (edge) => {
    set((state) => ({
      edges: [...state.edges, edge]
    }));
  },

  // Set execution mode
  setExecutionMode: (mode) => {
    set({ executionMode: mode });
  },

  // Workflow execution functions
  startWorkflow: (mode = 'auto') => {
    const { nodes, edges } = get();

    // Find the first node (e.g., "Inbound Call" or the node with no incoming edges)
    const nodeIds = new Set(nodes.map(n => n.id));
    const targetNodeIds = new Set(edges.map(e => e.targetNodeId));
    const firstNode = nodes.find(n => !targetNodeIds.has(n.id));

    if (firstNode) {
      set({
        isRunning: true,
        activeNodeId: firstNode.id,
        completedNodeIds: [], // Reset completed nodes
        executionMode: mode // Set mode on start
      });
    } else if (nodes.length > 0) {
      // Fallback: use the first node in the array
      set({
        isRunning: true,
        activeNodeId: nodes[0].id,
        completedNodeIds: [],
        executionMode: mode
      });
    }
  },

  advanceWorkflow: (fromNodeId) => {
    const { edges, nodes, completedNodeIds, executionMode } = get();

    // Prevent double-advancement: only advance if fromNodeId is currently active
    // This prevents conflicts between auto-advance and manual LiveTestMode advancement
    const currentActiveId = get().activeNodeId;
    if (currentActiveId !== null && currentActiveId !== fromNodeId) {
      console.log(`Skipping advance from ${fromNodeId}, current active is ${currentActiveId}`);
      return;
    }

    // Mark current node as completed (avoid duplicates)
    const updatedCompletedNodes = completedNodeIds.includes(fromNodeId)
      ? completedNodeIds
      : [...completedNodeIds, fromNodeId];

    // Find the edge connected to fromNodeId
    const nextEdge = edges.find((edge) => edge.sourceNodeId === fromNodeId);

    if (nextEdge) {
      set({
        activeNodeId: nextEdge.targetNodeId,
        completedNodeIds: updatedCompletedNodes
      });

      // ONLY auto-advance in 'auto' mode (Run Workflow button)
      // In 'manual' mode (Live Test), LiveTestMode controls advancement
      if (executionMode === 'auto') {
        setTimeout(() => {
          const currentNode = nodes.find(n => n.id === nextEdge.targetNodeId);
          // Only auto-advance if we're still on this node and still in auto mode
          if (currentNode && get().isRunning && get().activeNodeId === nextEdge.targetNodeId && get().executionMode === 'auto') {
            get().advanceWorkflow(nextEdge.targetNodeId);
          }
        }, 2000); // 2 second delay per node for visibility
      }
    } else {
      // No more nodes to execute - workflow complete
      set({
        isRunning: false,
        activeNodeId: null,
        completedNodeIds: updatedCompletedNodes // Mark last node as completed
      });
    }
  },

  stopWorkflow: () => {
    set({
      isRunning: false,
      activeNodeId: null,
      completedNodeIds: []
    });
  },

  // Workflow management functions
  setWorkflow: (nodes, edges) => {
    set({
      nodes: nodes,
      edges: edges,
      isRunning: false,
      activeNodeId: null
    });
  },

  clearWorkflow: () => {
    set({
      nodes: [],
      edges: [],
      isRunning: false,
      activeNodeId: null,
      completedNodeIds: []
    });
  }
}));

export default useFlowStore;
