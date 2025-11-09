import { create } from 'zustand';

const useFlowStore = create((set, get) => ({
  // State
  nodes: [],
  edges: [],
  isRunning: false,
  activeNodeId: null,
  completedNodeIds: [], // Track which nodes have been executed
  executionMode: 'auto', // 'auto' = auto-advance (Run Workflow), 'manual' = wait for user (Live Test)
  selectedNodeIds: [], // Track selected nodes for copy/paste/delete
  copiedNodes: null, // Store copied node data
  history: [], // History stack for undo/redo
  historyIndex: -1, // Current position in history
  maxHistorySize: 50, // Maximum number of undo states

  // Node management functions
  addNode: (node) => {
    get().saveHistory(); // Save state before change
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
    get().saveHistory(); // Save state before change
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
      activeNodeId: null,
      history: [{ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }],
      historyIndex: 0
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
  },

  // Selection management
  toggleNodeSelection: (nodeId, isShiftKey = false) => {
    set((state) => {
      if (isShiftKey) {
        // Shift+Click: toggle selection
        const isSelected = state.selectedNodeIds.includes(nodeId);
        return {
          selectedNodeIds: isSelected
            ? state.selectedNodeIds.filter(id => id !== nodeId)
            : [...state.selectedNodeIds, nodeId]
        };
      } else {
        // Regular click: select only this node
        return { selectedNodeIds: [nodeId] };
      }
    });
  },

  clearSelection: () => {
    set({ selectedNodeIds: [] });
  },

  // Copy/Paste functionality
  copyNodes: () => {
    const { nodes, selectedNodeIds } = get();
    if (selectedNodeIds.length === 0) return;

    // Get selected nodes data
    const nodesToCopy = nodes
      .filter(node => selectedNodeIds.includes(node.id))
      .map(node => ({
        label: node.label,
        type: node.type,
        position: node.position,
        data: node.data
      }));

    set({ copiedNodes: nodesToCopy });
  },

  pasteNodes: () => {
    const { copiedNodes, nodes } = get();
    if (!copiedNodes || copiedNodes.length === 0) return;

    get().saveHistory(); // Save state before change

    // Create new nodes with offset positions and new IDs
    const offset = { x: 50, y: 50 };
    const newNodes = copiedNodes.map((copiedNode) => ({
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: copiedNode.label + ' (Copy)',
      type: copiedNode.type,
      position: {
        x: copiedNode.position.x + offset.x,
        y: copiedNode.position.y + offset.y
      },
      data: copiedNode.data
    }));

    set((state) => ({
      nodes: [...state.nodes, ...newNodes],
      selectedNodeIds: newNodes.map(n => n.id) // Select the newly pasted nodes
    }));
  },

  deleteSelectedNodes: () => {
    const { selectedNodeIds } = get();
    if (selectedNodeIds.length === 0) return;

    get().saveHistory(); // Save state before change

    set((state) => ({
      nodes: state.nodes.filter(node => !selectedNodeIds.includes(node.id)),
      edges: state.edges.filter(edge =>
        !selectedNodeIds.includes(edge.sourceNodeId) &&
        !selectedNodeIds.includes(edge.targetNodeId)
      ),
      selectedNodeIds: []
    }));
  },

  // History management
  saveHistory: () => {
    const { nodes, edges, history, historyIndex, maxHistorySize } = get();

    // Create a snapshot of current state
    const snapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    };

    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);

    // Add new snapshot
    newHistory.push(snapshot);

    // Limit history size
    if (newHistory.length > maxHistorySize) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
  },

  undo: () => {
    const { history, historyIndex } = get();

    if (historyIndex <= 0) return; // Nothing to undo

    const newIndex = historyIndex - 1;
    const snapshot = history[newIndex];

    set({
      nodes: JSON.parse(JSON.stringify(snapshot.nodes)),
      edges: JSON.parse(JSON.stringify(snapshot.edges)),
      historyIndex: newIndex,
      selectedNodeIds: [] // Clear selection on undo
    });
  },

  redo: () => {
    const { history, historyIndex } = get();

    if (historyIndex >= history.length - 1) return; // Nothing to redo

    const newIndex = historyIndex + 1;
    const snapshot = history[newIndex];

    set({
      nodes: JSON.parse(JSON.stringify(snapshot.nodes)),
      edges: JSON.parse(JSON.stringify(snapshot.edges)),
      historyIndex: newIndex,
      selectedNodeIds: [] // Clear selection on redo
    });
  },

  canUndo: () => {
    const { historyIndex } = get();
    return historyIndex > 0;
  },

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },

  // Node alignment functions
  alignNodes: (direction) => {
    const { selectedNodeIds, nodes } = get();
    if (selectedNodeIds.length < 2) return; // Need at least 2 nodes to align

    get().saveHistory(); // Save state before alignment

    const selectedNodes = nodes.filter(node => selectedNodeIds.includes(node.id));

    let updatedNodes = [...nodes];

    switch (direction) {
      case 'left': {
        // Align all to leftmost node
        const minX = Math.min(...selectedNodes.map(n => n.position.x));
        updatedNodes = nodes.map(node =>
          selectedNodeIds.includes(node.id)
            ? { ...node, position: { ...node.position, x: minX } }
            : node
        );
        break;
      }
      case 'right': {
        // Align all to rightmost node
        const maxX = Math.max(...selectedNodes.map(n => n.position.x));
        updatedNodes = nodes.map(node =>
          selectedNodeIds.includes(node.id)
            ? { ...node, position: { ...node.position, x: maxX } }
            : node
        );
        break;
      }
      case 'top': {
        // Align all to topmost node
        const minY = Math.min(...selectedNodes.map(n => n.position.y));
        updatedNodes = nodes.map(node =>
          selectedNodeIds.includes(node.id)
            ? { ...node, position: { ...node.position, y: minY } }
            : node
        );
        break;
      }
      case 'bottom': {
        // Align all to bottommost node
        const maxY = Math.max(...selectedNodes.map(n => n.position.y));
        updatedNodes = nodes.map(node =>
          selectedNodeIds.includes(node.id)
            ? { ...node, position: { ...node.position, y: maxY } }
            : node
        );
        break;
      }
      case 'center-vertical': {
        // Align all to vertical center
        const avgX = selectedNodes.reduce((sum, n) => sum + n.position.x, 0) / selectedNodes.length;
        updatedNodes = nodes.map(node =>
          selectedNodeIds.includes(node.id)
            ? { ...node, position: { ...node.position, x: avgX } }
            : node
        );
        break;
      }
      case 'center-horizontal': {
        // Align all to horizontal center
        const avgY = selectedNodes.reduce((sum, n) => sum + n.position.y, 0) / selectedNodes.length;
        updatedNodes = nodes.map(node =>
          selectedNodeIds.includes(node.id)
            ? { ...node, position: { ...node.position, y: avgY } }
            : node
        );
        break;
      }
      default:
        return;
    }

    set({ nodes: updatedNodes });
  },

  // Distribute nodes evenly
  distributeNodes: (direction) => {
    const { selectedNodeIds, nodes } = get();
    if (selectedNodeIds.length < 3) return; // Need at least 3 nodes to distribute

    get().saveHistory();

    const selectedNodes = nodes.filter(node => selectedNodeIds.includes(node.id));

    if (direction === 'horizontal') {
      // Sort by x position
      const sorted = [...selectedNodes].sort((a, b) => a.position.x - b.position.x);
      const first = sorted[0].position.x;
      const last = sorted[sorted.length - 1].position.x;
      const gap = (last - first) / (sorted.length - 1);

      const updatedNodes = nodes.map(node => {
        const index = sorted.findIndex(n => n.id === node.id);
        if (index !== -1) {
          return { ...node, position: { ...node.position, x: first + (gap * index) } };
        }
        return node;
      });

      set({ nodes: updatedNodes });
    } else if (direction === 'vertical') {
      // Sort by y position
      const sorted = [...selectedNodes].sort((a, b) => a.position.y - b.position.y);
      const first = sorted[0].position.y;
      const last = sorted[sorted.length - 1].position.y;
      const gap = (last - first) / (sorted.length - 1);

      const updatedNodes = nodes.map(node => {
        const index = sorted.findIndex(n => n.id === node.id);
        if (index !== -1) {
          return { ...node, position: { ...node.position, y: first + (gap * index) } };
        }
        return node;
      });

      set({ nodes: updatedNodes });
    }
  }
}));

export default useFlowStore;
