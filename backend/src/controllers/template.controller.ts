import { Request, Response, NextFunction } from 'express';
import { templateService } from '../services/template.service';

export class TemplateController {
  /**
   * GET /api/templates
   */
  async getTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const templates = await templateService.getTemplates();

      res.status(200).json({
        success: true,
        data: templates
      });
    } catch (error) {
      next(error);
    }
  }
}

export const templateController = new TemplateController();
