// Workflow Generator Service
// Generates workflow nodes and edges from natural language prompts using Gemini API

import { generateWorkflowWithGemini } from './geminiService';

// Demo workflow templates for testing without API
const DEMO_WORKFLOWS = {
  pizza: {
    nodes: [
      { id: 'node-1', label: 'Inbound Call', type: 'trigger' },
      { id: 'node-2', label: 'Greet Customer', type: 'speak' },
      { id: 'node-3', label: 'Listen for Order', type: 'listen' },
      { id: 'node-4', label: 'Confirm Pizza Details', type: 'speak' },
      { id: 'node-5', label: 'Get Delivery Address', type: 'listen' },
      { id: 'node-6', label: 'Calculate Total', type: 'logic' },
      { id: 'node-7', label: 'Process Stripe Payment', type: 'integration' },
      { id: 'node-8', label: 'Confirm Order', type: 'speak' },
      { id: 'node-9', label: 'Send to Kitchen', type: 'integration' }
    ],
    edges: [
      { sourceNodeId: 'node-1', targetNodeId: 'node-2' },
      { sourceNodeId: 'node-2', targetNodeId: 'node-3' },
      { sourceNodeId: 'node-3', targetNodeId: 'node-4' },
      { sourceNodeId: 'node-4', targetNodeId: 'node-5' },
      { sourceNodeId: 'node-5', targetNodeId: 'node-6' },
      { sourceNodeId: 'node-6', targetNodeId: 'node-7' },
      { sourceNodeId: 'node-7', targetNodeId: 'node-8' },
      { sourceNodeId: 'node-8', targetNodeId: 'node-9' }
    ]
  },
  support: {
    nodes: [
      { id: 'node-1', label: 'New Ticket Webhook', type: 'trigger' },
      { id: 'node-2', label: 'Extract Ticket Info', type: 'logic' },
      { id: 'node-3', label: 'Check Urgency', type: 'condition' },
      { id: 'node-4', label: 'Urgent: Assign to Senior', type: 'integration' },
      { id: 'node-5', label: 'Normal: Assign to Team', type: 'integration' },
      { id: 'node-6', label: 'Send Notification', type: 'integration' },
      { id: 'node-7', label: 'Update Dashboard', type: 'integration' }
    ],
    edges: [
      { sourceNodeId: 'node-1', targetNodeId: 'node-2' },
      { sourceNodeId: 'node-2', targetNodeId: 'node-3' },
      { sourceNodeId: 'node-3', targetNodeId: 'node-4', label: 'Urgent' },
      { sourceNodeId: 'node-3', targetNodeId: 'node-5', label: 'Normal' },
      { sourceNodeId: 'node-4', targetNodeId: 'node-6' },
      { sourceNodeId: 'node-5', targetNodeId: 'node-6' },
      { sourceNodeId: 'node-6', targetNodeId: 'node-7' }
    ]
  },
  sales: {
    nodes: [
      { id: 'node-1', label: 'New Lead Webhook', type: 'trigger' },
      { id: 'node-2', label: 'Extract Lead Data', type: 'logic' },
      { id: 'node-3', label: 'Score Lead with AI', type: 'ai' },
      { id: 'node-4', label: 'Check Score', type: 'condition' },
      { id: 'node-5', label: 'High Score: Create Opportunity', type: 'integration' },
      { id: 'node-6', label: 'Low Score: Add to Nurture', type: 'integration' },
      { id: 'node-7', label: 'Assign to Sales Rep', type: 'integration' },
      { id: 'node-8', label: 'Send Welcome Email', type: 'integration' }
    ],
    edges: [
      { sourceNodeId: 'node-1', targetNodeId: 'node-2' },
      { sourceNodeId: 'node-2', targetNodeId: 'node-3' },
      { sourceNodeId: 'node-3', targetNodeId: 'node-4' },
      { sourceNodeId: 'node-4', targetNodeId: 'node-5', label: 'High Score' },
      { sourceNodeId: 'node-4', targetNodeId: 'node-6', label: 'Low Score' },
      { sourceNodeId: 'node-5', targetNodeId: 'node-7' },
      { sourceNodeId: 'node-6', targetNodeId: 'node-8' }
    ]
  },
  candidate: {
    nodes: [
      { id: 'node-1', label: 'Candidate Applied', type: 'trigger' },
      { id: 'node-2', label: 'Call Candidate', type: 'speak' },
      { id: 'node-3', label: 'Ask Experience Question', type: 'listen' },
      { id: 'node-4', label: 'Ask Skills Question', type: 'listen' },
      { id: 'node-5', label: 'Ask Availability', type: 'listen' },
      { id: 'node-6', label: 'Analyze Responses with AI', type: 'ai' },
      { id: 'node-7', label: 'Generate Summary', type: 'logic' },
      { id: 'node-8', label: 'Send to HR System', type: 'integration' },
      { id: 'node-9', label: 'Email HR Team', type: 'integration' }
    ],
    edges: [
      { sourceNodeId: 'node-1', targetNodeId: 'node-2' },
      { sourceNodeId: 'node-2', targetNodeId: 'node-3' },
      { sourceNodeId: 'node-3', targetNodeId: 'node-4' },
      { sourceNodeId: 'node-4', targetNodeId: 'node-5' },
      { sourceNodeId: 'node-5', targetNodeId: 'node-6' },
      { sourceNodeId: 'node-6', targetNodeId: 'node-7' },
      { sourceNodeId: 'node-7', targetNodeId: 'node-8' },
      { sourceNodeId: 'node-8', targetNodeId: 'node-9' }
    ]
  }
};

// Auto-layout algorithm for positioning nodes
const autoLayout = (nodes, edges) => {
  const HORIZONTAL_SPACING = 220;
  const VERTICAL_SPACING = 100;
  const START_X = 80;
  const START_Y = 150;

  // Build adjacency list
  const graph = new Map();
  nodes.forEach(node => graph.set(node.id, []));
  edges.forEach(edge => {
    if (graph.has(edge.sourceNodeId)) {
      graph.get(edge.sourceNodeId).push(edge.targetNodeId);
    }
  });

  // Find root nodes (no incoming edges)
  const hasIncoming = new Set(edges.map(e => e.targetNodeId));
  const roots = nodes.filter(n => !hasIncoming.has(n.id));

  // Level-based layout (BFS)
  const levels = new Map();
  const visited = new Set();
  const queue = roots.map(r => ({ id: r.id, level: 0 }));

  while (queue.length > 0) {
    const { id, level } = queue.shift();
    if (visited.has(id)) continue;

    visited.add(id);
    if (!levels.has(level)) levels.set(level, []);
    levels.get(level).push(id);

    const neighbors = graph.get(id) || [];
    neighbors.forEach(neighborId => {
      if (!visited.has(neighborId)) {
        queue.push({ id: neighborId, level: level + 1 });
      }
    });
  }

  // Position nodes by level
  const positionedNodes = nodes.map(node => {
    let level = 0;
    let indexInLevel = 0;

    for (const [lvl, nodeIds] of levels.entries()) {
      const idx = nodeIds.indexOf(node.id);
      if (idx !== -1) {
        level = lvl;
        indexInLevel = idx;
        break;
      }
    }

    const nodesInLevel = levels.get(level)?.length || 1;
    const verticalOffset = (indexInLevel - (nodesInLevel - 1) / 2) * VERTICAL_SPACING;

    return {
      ...node,
      position: {
        x: START_X + level * HORIZONTAL_SPACING,
        y: START_Y + verticalOffset
      }
    };
  });

  return positionedNodes;
};

// Match prompt to demo workflow
const matchDemoWorkflow = (prompt) => {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('pizza') || lowerPrompt.includes('delivery') || lowerPrompt.includes('restaurant')) {
    return DEMO_WORKFLOWS.pizza;
  } else if (lowerPrompt.includes('support') || lowerPrompt.includes('ticket') || lowerPrompt.includes('customer service')) {
    return DEMO_WORKFLOWS.support;
  } else if (lowerPrompt.includes('sales') || lowerPrompt.includes('lead') || lowerPrompt.includes('salesforce')) {
    return DEMO_WORKFLOWS.sales;
  } else if (lowerPrompt.includes('candidate') || lowerPrompt.includes('interview') || lowerPrompt.includes('screening') || lowerPrompt.includes('hr')) {
    return DEMO_WORKFLOWS.candidate;
  }

  // Default to pizza workflow
  return DEMO_WORKFLOWS.pizza;
};

// Generate workflow using Gemini API (delegated to geminiService)
const generateWithAI = async (prompt) => {
  return await generateWorkflowWithGemini(prompt);
};

// Main generation function
export const generateWorkflow = async (prompt, apiKey = null) => {
  let workflow;

  if (!apiKey) {
    // No API key provided - use demo mode
    console.log('No API key provided, using demo workflow');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
    workflow = matchDemoWorkflow(prompt);
  } else {
    // Use real Gemini API
    try {
      console.log('Generating workflow with Gemini API...');
      workflow = await generateWithAI(prompt);
      console.log('Successfully generated workflow with Gemini');
    } catch (error) {
      console.error('Gemini generation failed, using demo fallback:', error);
      await new Promise(resolve => setTimeout(resolve, 1500));
      workflow = matchDemoWorkflow(prompt);
    }
  }

  // Add unique IDs to edges if not present
  const edgesWithIds = workflow.edges.map((edge, idx) => ({
    id: edge.id || `edge-${Date.now()}-${idx}`,
    ...edge
  }));

  // Apply auto-layout
  const positionedNodes = autoLayout(workflow.nodes, edgesWithIds);

  return {
    nodes: positionedNodes,
    edges: edgesWithIds
  };
};

export default { generateWorkflow };
