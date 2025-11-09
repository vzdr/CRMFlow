import { Router } from 'express';
import { workflowController } from '../controllers/workflow.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All workflow routes require authentication
router.use(authenticate);

/**
 * GET /api/workflows
 * Get all workflows for the current user
 */
router.get('/', workflowController.getWorkflows.bind(workflowController));

/**
 * POST /api/workflows
 * Create a new workflow
 */
router.post('/', workflowController.createWorkflow.bind(workflowController));

/**
 * GET /api/workflows/:id
 * Get a specific workflow
 */
router.get('/:id', workflowController.getWorkflowById.bind(workflowController));

/**
 * PUT /api/workflows/:id
 * Update a workflow (name, nodes, edges)
 */
router.put('/:id', workflowController.updateWorkflow.bind(workflowController));

/**
 * DELETE /api/workflows/:id
 * Delete a workflow
 */
router.delete('/:id', workflowController.deleteWorkflow.bind(workflowController));

/**
 * POST /api/workflows/:templateId/clone
 * Clone a template workflow
 */
router.post('/:templateId/clone', workflowController.cloneTemplate.bind(workflowController));

export default router;
