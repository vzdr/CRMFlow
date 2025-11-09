import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../config/prisma';
import { decrypt } from '../utils/crypto.util';
import { AppError } from '../middleware/errorHandler';

export class GeminiService {
  /**
   * Get user's decrypted Gemini API key
   */
  private async getApiKey(userId: string): Promise<string> {
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        userId_service: {
          userId,
          service: 'gemini'
        }
      }
    });

    if (!apiKey) {
      throw new AppError('Gemini API key not configured', 400);
    }

    return decrypt(apiKey.encryptedKey);
  }

  /**
   * Get user's personality settings
   */
  private async getPersonality(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { personality: true }
    });

    return user?.personality || 'You are a helpful AI assistant.';
  }

  /**
   * Get enabled knowledge items for context
   */
  private async getKnowledgeContext(userId: string): Promise<string> {
    const knowledgeItems = await prisma.knowledgeItem.findMany({
      where: {
        userId,
        enabled: true
      },
      select: {
        name: true,
        content: true
      }
    });

    if (knowledgeItems.length === 0) {
      return '';
    }

    return '\n\nKNOWLEDGE BASE:\n' +
      knowledgeItems.map(item =>
        `- ${item.name}: ${item.content.substring(0, 500)}${item.content.length > 500 ? '...' : ''}`
      ).join('\n');
  }

  /**
   * Call Gemini API with full context
   */
  async generate(
    userId: string,
    userMessage: string,
    options?: {
      systemPrompt?: string;
      includeKnowledge?: boolean;
      includePersonality?: boolean;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    // Get API key
    const apiKey = await this.getApiKey(userId);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build full prompt
    let fullPrompt = '';

    // Add system prompt if provided
    if (options?.systemPrompt) {
      fullPrompt += options.systemPrompt + '\n\n';
    }

    // Add personality
    if (options?.includePersonality !== false) {
      const personality = await this.getPersonality(userId);
      fullPrompt += personality + '\n\n';
    }

    // Add knowledge base
    if (options?.includeKnowledge) {
      const knowledge = await this.getKnowledgeContext(userId);
      fullPrompt += knowledge + '\n\n';
    }

    // Add user message
    fullPrompt += `User: ${userMessage}`;

    // Generate response
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: options?.temperature || 0.7,
        maxOutputTokens: options?.maxTokens || 500
      }
    });

    const response = result.response;
    return response.text();
  }

  /**
   * Generate workflow from prompt
   */
  async generateWorkflow(userId: string, prompt: string): Promise<any> {
    const systemPrompt = `You are a workflow generator. Given a user's description, generate a JSON workflow with nodes and edges.

RULES:
1. Return ONLY valid JSON, no other text
2. Include 6-10 nodes
3. Node types: trigger, speak, listen, ai, logic, integration
4. Each node needs: id, label, type
5. Edges connect nodes: sourceNodeId → targetNodeId

Example structure:
{
  "nodes": [
    {"id": "node1", "label": "Inbound Call", "type": "trigger"},
    {"id": "node2", "label": "Greet Customer", "type": "speak"}
  ],
  "edges": [
    {"sourceNodeId": "node1", "targetNodeId": "node2"}
  ]
}`;

    const response = await this.generate(userId, prompt, {
      systemPrompt,
      includeKnowledge: false,
      includePersonality: false,
      temperature: 0.8,
      maxTokens: 1500
    });

    // Parse JSON response
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const workflow = JSON.parse(jsonMatch[0]);

      // Validate structure
      if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
        throw new Error('Invalid workflow structure');
      }

      return workflow;
    } catch (error) {
      throw new AppError('Failed to generate valid workflow', 500);
    }
  }

  /**
   * Generate streaming response (for live test mode)
   */
  async *generateStream(
    userId: string,
    userMessage: string,
    options?: {
      systemPrompt?: string;
      includeKnowledge?: boolean;
      includePersonality?: boolean;
    }
  ): AsyncGenerator<string> {
    const apiKey = await this.getApiKey(userId);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build full prompt
    let fullPrompt = '';

    if (options?.systemPrompt) {
      fullPrompt += options.systemPrompt + '\n\n';
    }

    if (options?.includePersonality !== false) {
      const personality = await this.getPersonality(userId);
      fullPrompt += personality + '\n\n';
    }

    if (options?.includeKnowledge) {
      const knowledge = await this.getKnowledgeContext(userId);
      fullPrompt += knowledge + '\n\n';
    }

    fullPrompt += `User: ${userMessage}`;

    // Stream response
    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      yield text;
    }
  }
}

export const geminiService = new GeminiService();
