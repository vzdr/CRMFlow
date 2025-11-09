import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { knowledgeService } from '../services/knowledge.service';

export class KnowledgeController {
  /**
   * GET /api/knowledge
   */
  async getKnowledgeItems(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const items = await knowledgeService.getKnowledgeItems(req.user!.id);

      res.status(200).json({
        success: true,
        data: items
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/knowledge/pdf
   */
  async uploadPDF(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { message: 'No file uploaded' }
        });
      }

      const { name } = req.body;

      const result = await knowledgeService.addPDFKnowledge(
        req.user!.id,
        req.file,
        name
      );

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/knowledge/scrape
   */
  async scrapeWebsite(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: { message: 'URL is required' }
        });
      }

      const result = await knowledgeService.addWebKnowledge(req.user!.id, url);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/knowledge/manual
   */
  async addManual(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { question, answer } = req.body;

      if (!question || !answer) {
        return res.status(400).json({
          success: false,
          error: { message: 'Question and answer are required' }
        });
      }

      const item = await knowledgeService.addManualKnowledge(
        req.user!.id,
        question,
        answer
      );

      res.status(201).json({
        success: true,
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/knowledge/:id
   */
  async updateKnowledgeItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { enabled } = req.body;

      const item = await knowledgeService.updateKnowledgeItem(
        req.user!.id,
        req.params.id,
        { enabled }
      );

      res.status(200).json({
        success: true,
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/knowledge/:id
   */
  async deleteKnowledgeItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await knowledgeService.deleteKnowledgeItem(req.user!.id, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Knowledge item deleted'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const knowledgeController = new KnowledgeController();
