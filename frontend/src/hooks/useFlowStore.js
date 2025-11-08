import { create } from 'zustand';

const useFlowStore = create((set, get) => ({
  // State
  nodes: [],
  edges: [],
  isRunning: false,
  activeNodeId: null,
  completedNodeIds: [], // Track which nodes have been executed

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

  // Workflow execution functions
  startWorkflow: () => {
    const { nodes, edges } = get();

    // Find the first node (e.g., "Inbound Call" or the node with no incoming edges)
    const nodeIds = new Set(nodes.map(n => n.id));
    const targetNodeIds = new Set(edges.map(e => e.targetNodeId));
    const firstNode = nodes.find(n => !targetNodeIds.has(n.id));

    if (firstNode) {
      set({
        isRunning: true,
        activeNodeId: firstNode.id,
        completedNodeIds: [] // Reset completed nodes
      });
    } else if (nodes.length > 0) {
      // Fallback: use the first node in the array
      set({
        isRunning: true,
        activeNodeId: nodes[0].id,
        completedNodeIds: []
      });
    }
  },

  advanceWorkflow: (fromNodeId) => {
    const { edges, nodes, completedNodeIds } = get();

    // Mark current node as completed
    const updatedCompletedNodes = [...completedNodeIds, fromNodeId];

    // Find the edge connected to fromNodeId
    const nextEdge = edges.find((edge) => edge.sourceNodeId === fromNodeId);

    if (nextEdge) {
      set({
        activeNodeId: nextEdge.targetNodeId,
        completedNodeIds: updatedCompletedNodes
      });

      // Auto-advance after delay for automatic execution
      setTimeout(() => {
        const currentNode = nodes.find(n => n.id === nextEdge.targetNodeId);
        if (currentNode && get().isRunning) {
          // Auto-advance to next node
          get().advanceWorkflow(nextEdge.targetNodeId);
        }
      }, 2000); // 2 second delay per node for visibility
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
