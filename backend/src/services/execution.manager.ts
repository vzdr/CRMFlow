import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from '../config/prisma';
import { geminiService } from './gemini.service';

interface ExecutionSession {
  socketId: string;
  userId: string;
  workflowId: string;
  activeNodeId: string | null;
  completedNodeIds: string[];
  conversationHistory: Array<{
    role: 'user' | 'ai' | 'system';
    content: string;
    timestamp: Date;
  }>;
}

export class ExecutionManager {
  private sessions: Map<string, ExecutionSession> = new Map();

  constructor(private io: SocketIOServer) {
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[Socket] Client connected: ${socket.id}`);

      // Session start
      socket.on('session:start', async (data: { workflowId: string; userId: string }) => {
        try {
          await this.handleSessionStart(socket, data.workflowId, data.userId);
        } catch (error: any) {
          socket.emit('error:api', { message: error.message });
        }
      });

      // Node execution
      socket.on('node:execute', async (data: { nodeId: string }) => {
        try {
          await this.handleNodeExecution(socket, data.nodeId);
        } catch (error: any) {
          socket.emit('error:api', { message: error.message });
        }
      });

      // User message
      socket.on('user:message', async (data: { message: string }) => {
        try {
          await this.handleUserMessage(socket, data.message);
        } catch (error: any) {
          socket.emit('error:api', { message: error.message });
        }
      });

      // Workflow advance
      socket.on('workflow:advance', async (data: { fromNodeId: string }) => {
        try {
          await this.handleWorkflowAdvance(socket, data.fromNodeId);
        } catch (error: any) {
          socket.emit('error:api', { message: error.message });
        }
      });

      // Session end
      socket.on('session:end', () => {
        this.handleSessionEnd(socket);
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
        this.handleSessionEnd(socket);
      });
    });
  }

  /**
   * Start a new execution session
   */
  private async handleSessionStart(socket: Socket, workflowId: string, userId: string) {
    console.log(`[Session] Starting workflow ${workflowId} for user ${userId}`);

    // Fetch workflow with nodes and edges
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        nodes: true,
        edges: true
      }
    });

    if (!workflow || workflow.userId !== userId) {
      throw new Error('Workflow not found or unauthorized');
    }

    // Find starting node (node with no incoming edges)
    const targetNodeIds = new Set(workflow.edges.map(e => e.targetNodeId));
    const startNode = workflow.nodes.find(n => !targetNodeIds.has(n.id));

    if (!startNode) {
      throw new Error('No starting node found');
    }

    // Create session
    const session: ExecutionSession = {
      socketId: socket.id,
      userId,
      workflowId,
      activeNodeId: startNode.id,
      completedNodeIds: [],
      conversationHistory: []
    };

    this.sessions.set(socket.id, session);

    // Log session start
    await prisma.executionLog.create({
      data: {
        userId,
        workflowId,
        eventType: 'session_start',
        nodeId: startNode.id,
        nodeType: startNode.type,
        data: {
          totalNodes: workflow.nodes.length
        }
      }
    });

    // Send session started event
    socket.emit('session:started', {
      workflowId,
      activeNode: {
        id: startNode.id,
        label: startNode.label,
        type: startNode.type,
        position: {
          x: startNode.positionX,
          y: startNode.positionY
        },
        data: startNode.data
      },
      totalNodes: workflow.nodes.length
    });

    console.log(`[Session] Started with node: ${startNode.label} (${startNode.type})`);
  }

  /**
   * Execute a node based on its type
   */
  private async handleNodeExecution(socket: Socket, nodeId: string) {
    const session = this.sessions.get(socket.id);
    if (!session) {
      throw new Error('No active session');
    }

    // Fetch node
    const node = await prisma.node.findUnique({
      where: { id: nodeId }
    });

    if (!node) {
      throw new Error('Node not found');
    }

    console.log(`[Execution] Executing node: ${node.label} (${node.type})`);

    // Log execution start
    await prisma.executionLog.create({
      data: {
        userId: session.userId,
        workflowId: session.workflowId,
        eventType: 'node_execute',
        nodeId: node.id,
        nodeType: node.type,
        data: { label: node.label }
      }
    });

    // Execute based on type
    switch (node.type) {
      case 'trigger':
        socket.emit('node:execution_complete', { nodeId: node.id });
        break;

      case 'speak':
        await this.executeSpeakNode(socket, session, node);
        break;

      case 'listen':
      case 'ai':
        socket.emit('system:waiting_for_input', {
          nodeId: node.id,
          label: node.label
        });
        break;

      case 'logic':
      case 'integration':
        await this.executeGenericNode(socket, session, node);
        break;

      default:
        socket.emit('node:execution_complete', { nodeId: node.id });
    }
  }

  /**
   * Execute speak node - AI speaks to user
   */
  private async executeSpeakNode(socket: Socket, session: ExecutionSession, node: any) {
    socket.emit('ai:processing_start');

    try {
      const message = `Say this to the user in a natural way: "${node.label}"`;

      // Stream AI response
      const generator = geminiService.generateStream(session.userId, message, {
        systemPrompt: 'You are speaking to a user. Be friendly and conversational.',
        includePersonality: true,
        includeKnowledge: false
      });

      let fullResponse = '';

      for await (const chunk of generator) {
        fullResponse += chunk;
        socket.emit('ai:chunk', { chunk });
      }

      // Add to history
      session.conversationHistory.push({
        role: 'ai',
        content: fullResponse,
        timestamp: new Date()
      });

      // Log
      await prisma.executionLog.create({
        data: {
          userId: session.userId,
          workflowId: session.workflowId,
          eventType: 'ai_response',
          nodeId: node.id,
          nodeType: node.type,
          data: { response: fullResponse }
        }
      });

      socket.emit('ai:processing_end');
      socket.emit('node:execution_complete', { nodeId: node.id });

    } catch (error: any) {
      socket.emit('ai:processing_end');
      socket.emit('error:api', { message: `AI error: ${error.message}` });
      socket.emit('node:execution_complete', { nodeId: node.id });
    }
  }

  /**
   * Execute generic node (logic, integration)
   */
  private async executeGenericNode(socket: Socket, session: ExecutionSession, node: any) {
    socket.emit('system:processing', { nodeId: node.id, label: node.label });

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    socket.emit('node:execution_complete', { nodeId: node.id });
  }

  /**
   * Handle user message (for listen/ai nodes)
   */
  private async handleUserMessage(socket: Socket, message: string) {
    const session = this.sessions.get(socket.id);
    if (!session) {
      throw new Error('No active session');
    }

    if (!session.activeNodeId) {
      throw new Error('No active node');
    }

    // Add to history
    session.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Log
    await prisma.executionLog.create({
      data: {
        userId: session.userId,
        workflowId: session.workflowId,
        eventType: 'message_sent',
        nodeId: session.activeNodeId,
        data: { message }
      }
    });

    // Get active node
    const node = await prisma.node.findUnique({
      where: { id: session.activeNodeId }
    });

    if (!node) {
      throw new Error('Active node not found');
    }

    // Process with AI
    socket.emit('ai:processing_start');

    try {
      // Build context from conversation
      const conversationContext = session.conversationHistory
        .slice(-5)
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n');

      const systemPrompt = `You are processing this workflow step: "${node.label}"

Recent conversation:
${conversationContext}

Respond naturally to the user's message.`;

      // Stream response
      const generator = geminiService.generateStream(session.userId, message, {
        systemPrompt,
        includePersonality: true,
        includeKnowledge: true
      });

      let fullResponse = '';

      for await (const chunk of generator) {
        fullResponse += chunk;
        socket.emit('ai:chunk', { chunk });
      }

      // Add to history
      session.conversationHistory.push({
        role: 'ai',
        content: fullResponse,
        timestamp: new Date()
      });

      // Log
      await prisma.executionLog.create({
        data: {
          userId: session.userId,
          workflowId: session.workflowId,
          eventType: 'ai_response',
          nodeId: node.id,
          nodeType: node.type,
          data: { response: fullResponse }
        }
      });

      socket.emit('ai:processing_end');
      socket.emit('node:execution_complete', { nodeId: node.id });

    } catch (error: any) {
      socket.emit('ai:processing_end');
      socket.emit('error:api', { message: `AI error: ${error.message}` });
    }
  }

  /**
   * Advance workflow to next node
   */
  private async handleWorkflowAdvance(socket: Socket, fromNodeId: string) {
    const session = this.sessions.get(socket.id);
    if (!session) {
      throw new Error('No active session');
    }

    // Mark current node as completed
    if (!session.completedNodeIds.includes(fromNodeId)) {
      session.completedNodeIds.push(fromNodeId);
    }

    // Find next node
    const nextEdge = await prisma.edge.findFirst({
      where: {
        workflowId: session.workflowId,
        sourceNodeId: fromNodeId
      }
    });

    if (!nextEdge) {
      // Workflow finished
      session.activeNodeId = null;

      // Log
      await prisma.executionLog.create({
        data: {
          userId: session.userId,
          workflowId: session.workflowId,
          eventType: 'session_end',
          data: {
            completedNodes: session.completedNodeIds.length
          }
        }
      });

      socket.emit('workflow:finished', {
        completedNodes: session.completedNodeIds.length
      });

      console.log(`[Workflow] Finished for ${session.workflowId}`);
      return;
    }

    // Get next node
    const nextNode = await prisma.node.findUnique({
      where: { id: nextEdge.targetNodeId }
    });

    if (!nextNode) {
      throw new Error('Next node not found');
    }

    session.activeNodeId = nextNode.id;

    // Log
    await prisma.executionLog.create({
      data: {
        userId: session.userId,
        workflowId: session.workflowId,
        eventType: 'node_advance',
        nodeId: nextNode.id,
        nodeType: nextNode.type,
        data: { label: nextNode.label }
      }
    });

    socket.emit('workflow:node_activated', {
      node: {
        id: nextNode.id,
        label: nextNode.label,
        type: nextNode.type,
        position: {
          x: nextNode.positionX,
          y: nextNode.positionY
        },
        data: nextNode.data
      }
    });

    console.log(`[Workflow] Advanced to: ${nextNode.label} (${nextNode.type})`);
  }

  /**
   * End execution session
   */
  private handleSessionEnd(socket: Socket) {
    const session = this.sessions.get(socket.id);
    if (session) {
      console.log(`[Session] Ended for workflow ${session.workflowId}`);
      this.sessions.delete(socket.id);
    }
  }
}
