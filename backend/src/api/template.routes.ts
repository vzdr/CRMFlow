import { Router } from 'express';
import { templateController } from '../controllers/template.controller';

const router = Router();

/**
 * GET /api/templates
 * Get all template workflows (public, no auth required)
 */
router.get('/', templateController.getTemplates.bind(templateController));

export default router;
