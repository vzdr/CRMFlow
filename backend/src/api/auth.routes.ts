import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', authController.register.bind(authController));

/**
 * POST /api/auth/login
 * Login existing user
 */
router.post('/login', authController.login.bind(authController));

/**
 * GET /api/auth/me
 * Get current user info (protected)
 */
router.get('/me', authenticate, authController.getMe.bind(authController));

export default router;
