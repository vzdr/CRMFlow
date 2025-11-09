import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { apiKeyService } from '../services/apikey.service';
import { geminiService } from '../services/gemini.service';

export class SecureController {
  /**
   * POST /api/keys
   * Save API key
   */
  async saveKey(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { service, key } = req.body;

      const result = await apiKeyService.saveKey(req.user!.id, service, key);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/keys
   * Get all saved keys (without values)
   */
  async getKeys(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const keys = await apiKeyService.getKeys(req.user!.id);

      res.status(200).json({
        success: true,
        data: keys
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/keys/:service
   * Delete API key
   */
  async deleteKey(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await apiKeyService.deleteKey(req.user!.id, req.params.service);

      res.status(200).json({
        success: true,
        message: 'API key deleted'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ai/generate
   * Generate AI response using user's Gemini key
   */
  async generateAI(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { message, systemPrompt, includeKnowledge, includePersonality, temperature, maxTokens } = req.body;

      const response = await geminiService.generate(req.user!.id, message, {
        systemPrompt,
        includeKnowledge,
        includePersonality,
        temperature,
        maxTokens
      });

      res.status(200).json({
        success: true,
        data: { response }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ai/generate-workflow
   * Generate workflow from prompt
   */
  async generateWorkflow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { prompt } = req.body;

      const workflow = await geminiService.generateWorkflow(req.user!.id, prompt);

      res.status(200).json({
        success: true,
        data: workflow
      });
    } catch (error) {
      next(error);
    }
  }
}

export const secureController = new SecureController();
