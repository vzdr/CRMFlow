import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { workflowService } from '../services/workflow.service';

export class WorkflowController {
  /**
   * GET /api/workflows
   */
  async getWorkflows(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workflows = await workflowService.getWorkflows(req.user!.id);

      res.status(200).json({
        success: true,
        data: workflows
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/workflows/:id
   */
  async getWorkflowById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workflow = await workflowService.getWorkflowById(
        req.params.id,
        req.user!.id
      );

      res.status(200).json({
        success: true,
        data: workflow
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/workflows
   */
  async createWorkflow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;

      const workflow = await workflowService.createWorkflow(req.user!.id, name);

      res.status(201).json({
        success: true,
        data: workflow
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/workflows/:id
   */
  async updateWorkflow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, nodes, edges } = req.body;

      const workflow = await workflowService.updateWorkflow(
        req.params.id,
        req.user!.id,
        { name, nodes, edges }
      );

      res.status(200).json({
        success: true,
        data: workflow
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/workflows/:id
   */
  async deleteWorkflow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await workflowService.deleteWorkflow(req.params.id, req.user!.id);

      res.status(200).json({
        success: true,
        message: 'Workflow deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/workflows/:templateId/clone
   */
  async cloneTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workflow = await workflowService.cloneTemplate(
        req.params.templateId,
        req.user!.id
      );

      res.status(201).json({
        success: true,
        data: workflow
      });
    } catch (error) {
      next(error);
    }
  }
}

export const workflowController = new WorkflowController();
