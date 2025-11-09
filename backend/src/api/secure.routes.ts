import { Router } from 'express';
import { secureController } from '../controllers/secure.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * API Keys Management
 */
router.post('/keys', secureController.saveKey.bind(secureController));
router.get('/keys', secureController.getKeys.bind(secureController));
router.delete('/keys/:service', secureController.deleteKey.bind(secureController));

/**
 * AI Generation (Server-side proxy)
 */
router.post('/ai/generate', secureController.generateAI.bind(secureController));
router.post('/ai/generate-workflow', secureController.generateWorkflow.bind(secureController));

export default router;
