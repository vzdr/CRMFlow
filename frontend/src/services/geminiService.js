// Centralized Gemini API Service
// Handles all AI interactions with Google Gemini 1.5 Flash

/**
 * Get knowledge base context from Intelligence Hub
 */
export const getKnowledgeContext = () => {
  const saved = localStorage.getItem('crmflow_intelligence_hub');
  if (!saved) return '';

  try {
    const data = JSON.parse(saved);
    const enabledItems = (data.knowledgeItems || []).filter(item => item.enabled);

    if (enabledItems.length === 0) return '';

    const knowledgeText = enabledItems.map(item => {
      const preview = item.content ? item.content.substring(0, 1000) : '';
      return `[${item.type.toUpperCase()}] ${item.name}:\n${preview}`;
    }).join('\n\n');

    return `\n\n=== KNOWLEDGE BASE ===\n${knowledgeText}\n=== END KNOWLEDGE BASE ===\n`;
  } catch (e) {
    console.error('Failed to load knowledge context:', e);
    return '';
  }
};

/**
 * Get personality from Intelligence Hub
 */
export const getPersonality = () => {
  const saved = localStorage.getItem('crmflow_intelligence_hub');
  if (!saved) {
    return 'You are a helpful and professional AI assistant.';
  }

  try {
    const data = JSON.parse(saved);
    return data.personality || 'You are a helpful and professional AI assistant.';
  } catch (e) {
    return 'You are a helpful and professional AI assistant.';
  }
};

/**
 * Get Gemini API key from localStorage
 */
export const getGeminiApiKey = () => {
  const saved = localStorage.getItem('crmflow_api_keys');
  if (!saved) return null;

  try {
    const keys = JSON.parse(saved);
    return keys.gemini || null;
  } catch (e) {
    return null;
  }
};

/**
 * Call Gemini API with context
 */
export const callGemini = async (userMessage, options = {}) => {
  const {
    systemPrompt = '',
    includeKnowledge = true,
    includePersonality = true,
    maxTokens = 500,
    temperature = 0.7
  } = options;

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please add it in Settings.');
  }

  // Build full prompt
  let fullPrompt = '';

  // Add personality
  if (includePersonality) {
    const personality = getPersonality();
    fullPrompt += `${personality}\n\n`;
  }

  // Add system prompt
  if (systemPrompt) {
    fullPrompt += `${systemPrompt}\n\n`;
  }

  // Add knowledge base
  if (includeKnowledge) {
    const knowledge = getKnowledgeContext();
    if (knowledge) {
      fullPrompt += `${knowledge}\n`;
    }
  }

  // Add user message
  fullPrompt += `User: ${userMessage}\n\nAssistant:`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: temperature,
            maxOutputTokens: maxTokens
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API call failed');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

/**
 * Generate workflow from prompt
 */
export const generateWorkflowWithGemini = async (prompt) => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('API key required');
  }

  const systemPrompt = `You are a workflow designer. Generate a workflow as JSON with this structure:
{
  "nodes": [{"id": "node-1", "label": "Node Name", "type": "trigger|speak|listen|ai|logic|condition|integration"}],
  "edges": [{"sourceNodeId": "node-1", "targetNodeId": "node-2", "label": "optional"}]
}

STRICT RULES:
1. Return ONLY valid JSON, no markdown, no explanation
2. Use exactly these node types: trigger, speak, listen, ai, logic, condition, integration
3. Create 6-10 nodes minimum
4. Every node must have id, label, type
5. Edges must connect nodes in logical order
6. First node MUST be type: trigger
7. IDs must be sequential: node-1, node-2, node-3, etc.
8. Make workflows practical and realistic

Node Types:
- trigger: Starts the workflow (webhooks, calls, etc.)
- speak: AI speaks/outputs text to user
- listen: AI listens/waits for user input
- ai: AI processing/decision making
- logic: Data manipulation, calculations
- condition: If/else branching logic
- integration: External API calls (Stripe, Salesforce, etc.)`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser request: ${prompt}\n\nGenerate workflow JSON:`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API call failed');
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    // Parse JSON from response (strip markdown if present)
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error('Invalid response:', content);
      throw new Error('Could not parse workflow JSON from response');
    }

    const workflow = JSON.parse(jsonMatch[0]);

    // Validate workflow structure
    if (!workflow.nodes || !Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
      throw new Error('Invalid workflow: missing or empty nodes array');
    }

    if (!workflow.edges || !Array.isArray(workflow.edges)) {
      throw new Error('Invalid workflow: missing or empty edges array');
    }

    return workflow;
  } catch (error) {
    console.error('Workflow generation error:', error);
    throw error;
  }
};

export default {
  callGemini,
  generateWorkflowWithGemini,
  getKnowledgeContext,
  getPersonality,
  getGeminiApiKey
};
