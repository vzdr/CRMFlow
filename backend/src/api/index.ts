import { Router } from 'express';
import authRoutes from './auth.routes';
import workflowRoutes from './workflow.routes';
import secureRoutes from './secure.routes';
import knowledgeRoutes from './knowledge.routes';
import templateRoutes from './template.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CRMFlow API is running',
    timestamp: new Date().toISOString()
  });
});

// Register route modules
router.use('/auth', authRoutes);
router.use('/workflows', workflowRoutes);
router.use('/knowledge', knowledgeRoutes);
router.use('/templates', templateRoutes);
router.use('/', secureRoutes); // /api/keys and /api/ai/*

export default router;
