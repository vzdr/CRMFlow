import { prisma } from '../config/prisma';

export class TemplateService {
  /**
   * Get all template workflows
   */
  async getTemplates() {
    const templates = await prisma.workflow.findMany({
      where: { isTemplate: true },
      include: {
        _count: {
          select: {
            nodes: true,
            edges: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return templates;
  }
}

export const templateService = new TemplateService();
