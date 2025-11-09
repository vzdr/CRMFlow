import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

interface NodeInput {
  id: string;
  label: string;
  type: string;
  position: { x: number; y: number };
  data?: any;
}

interface EdgeInput {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
}

export class WorkflowService {
  /**
   * Get all workflows for a user
   */
  async getWorkflows(userId: string) {
    const workflows = await prisma.workflow.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        isPublic: true,
        isTemplate: false,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            nodes: true,
            edges: true
          }
        }
      }
    });

    return workflows;
  }

  /**
   * Get a single workflow by ID
   */
  async getWorkflowById(workflowId: string, userId: string) {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        nodes: {
          orderBy: { id: 'asc' }
        },
        edges: {
          orderBy: { id: 'asc' }
        }
      }
    });

    if (!workflow) {
      throw new AppError('Workflow not found', 404);
    }

    // Check ownership
    if (workflow.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    // Transform nodes to match frontend format
    const nodes = workflow.nodes.map(node => ({
      id: node.id,
      label: node.label,
      type: node.type,
      position: {
        x: node.positionX,
        y: node.positionY
      },
      data: node.data
    }));

    return {
      ...workflow,
      nodes,
      edges: workflow.edges
    };
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(userId: string, name?: string) {
    const workflow = await prisma.workflow.create({
      data: {
        name: name || 'Untitled Workflow',
        userId
      }
    });

    return workflow;
  }

  /**
   * Update workflow (including nodes and edges)
   */
  async updateWorkflow(
    workflowId: string,
    userId: string,
    data: {
      name?: string;
      nodes?: NodeInput[];
      edges?: EdgeInput[];
    }
  ) {
    // Verify ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId }
    });

    if (!workflow) {
      throw new AppError('Workflow not found', 404);
    }

    if (workflow.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    // Use transaction to update everything atomically
    const updated = await prisma.$transaction(async (tx) => {
      // Update workflow name if provided
      if (data.name) {
        await tx.workflow.update({
          where: { id: workflowId },
          data: { name: data.name }
        });
      }

      // Update nodes and edges if provided
      if (data.nodes !== undefined || data.edges !== undefined) {
        // Delete existing nodes and edges
        await tx.node.deleteMany({ where: { workflowId } });
        await tx.edge.deleteMany({ where: { workflowId } });

        // Create new nodes
        if (data.nodes && data.nodes.length > 0) {
          await tx.node.createMany({
            data: data.nodes.map(node => ({
              id: node.id,
              label: node.label,
              type: node.type,
              positionX: node.position.x,
              positionY: node.position.y,
              data: node.data || {},
              workflowId
            }))
          });
        }

        // Create new edges
        if (data.edges && data.edges.length > 0) {
          await tx.edge.createMany({
            data: data.edges.map(edge => ({
              id: edge.id,
              sourceNodeId: edge.sourceNodeId,
              targetNodeId: edge.targetNodeId,
              workflowId
            }))
          });
        }
      }

      // Return updated workflow
      return tx.workflow.findUnique({
        where: { id: workflowId },
        include: {
          nodes: true,
          edges: true
        }
      });
    });

    return updated;
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string, userId: string) {
    // Verify ownership
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId }
    });

    if (!workflow) {
      throw new AppError('Workflow not found', 404);
    }

    if (workflow.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    // Delete (cascade will handle nodes and edges)
    await prisma.workflow.delete({
      where: { id: workflowId }
    });

    return { success: true };
  }

  /**
   * Clone a template workflow
   */
  async cloneTemplate(templateId: string, userId: string) {
    const template = await prisma.workflow.findUnique({
      where: { id: templateId },
      include: {
        nodes: true,
        edges: true
      }
    });

    if (!template || !template.isTemplate) {
      throw new AppError('Template not found', 404);
    }

    // Create new workflow with cloned data
    const cloned = await prisma.workflow.create({
      data: {
        name: `${template.name} (Copy)`,
        userId,
        nodes: {
          create: template.nodes.map(node => ({
            label: node.label,
            type: node.type,
            positionX: node.positionX,
            positionY: node.positionY,
            data: node.data
          }))
        },
        edges: {
          create: template.edges.map(edge => ({
            sourceNodeId: edge.sourceNodeId,
            targetNodeId: edge.targetNodeId
          }))
        }
      },
      include: {
        nodes: true,
        edges: true
      }
    });

    return cloned;
  }
}

export const workflowService = new WorkflowService();
