import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import axios from 'axios';
import * as cheerio from 'cheerio';
import pdfParse from 'pdf-parse';

export class KnowledgeService {
  /**
   * Get all knowledge items for a user
   */
  async getKnowledgeItems(userId: string) {
    const items = await prisma.knowledgeItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return items;
  }

  /**
   * Create knowledge item from PDF
   */
  async addPDFKnowledge(userId: string, file: Express.Multer.File, name: string) {
    try {
      // Extract text from PDF
      const data = await pdfParse(file.buffer);
      const text = data.text;

      // Limit text size
      const content = text.substring(0, 100000); // 100KB max

      // Save to database
      const item = await prisma.knowledgeItem.create({
        data: {
          userId,
          type: 'pdf',
          name: name || file.originalname,
          content,
          enabled: true
        }
      });

      return {
        item,
        extractedLength: text.length,
        savedLength: content.length
      };
    } catch (error) {
      throw new AppError('Failed to extract text from PDF', 500);
    }
  }

  /**
   * Create knowledge item from web scraping
   */
  async addWebKnowledge(userId: string, url: string) {
    try {
      // Fetch HTML
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CRMFlow/1.0)'
        }
      });

      const html = response.data;

      // Extract text using cheerio
      const $ = cheerio.load(html);

      // Remove script and style elements
      $('script, style, nav, footer, iframe').remove();

      // Get text content
      const text = $('body').text().replace(/\s+/g, ' ').trim();

      // Limit text size
      const content = text.substring(0, 50000); // 50KB max

      // Get domain name
      const domain = new URL(url).hostname;

      // Save to database
      const item = await prisma.knowledgeItem.create({
        data: {
          userId,
          type: 'web',
          name: domain,
          content,
          url,
          enabled: true
        }
      });

      return {
        item,
        extractedLength: text.length,
        savedLength: content.length
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new AppError(`Failed to fetch URL: ${error.message}`, 400);
      }
      throw new AppError('Failed to scrape website', 500);
    }
  }

  /**
   * Create manual Q&A knowledge item
   */
  async addManualKnowledge(userId: string, question: string, answer: string) {
    const content = `Q: ${question}\nA: ${answer}`;

    const item = await prisma.knowledgeItem.create({
      data: {
        userId,
        type: 'manual',
        name: question,
        content,
        enabled: true
      }
    });

    return item;
  }

  /**
   * Update knowledge item (toggle enabled, etc.)
   */
  async updateKnowledgeItem(userId: string, itemId: string, data: { enabled?: boolean }) {
    // Verify ownership
    const item = await prisma.knowledgeItem.findUnique({
      where: { id: itemId }
    });

    if (!item || item.userId !== userId) {
      throw new AppError('Knowledge item not found', 404);
    }

    // Update
    const updated = await prisma.knowledgeItem.update({
      where: { id: itemId },
      data
    });

    return updated;
  }

  /**
   * Delete knowledge item
   */
  async deleteKnowledgeItem(userId: string, itemId: string) {
    // Verify ownership
    const item = await prisma.knowledgeItem.findUnique({
      where: { id: itemId }
    });

    if (!item || item.userId !== userId) {
      throw new AppError('Knowledge item not found', 404);
    }

    // Delete
    await prisma.knowledgeItem.delete({
      where: { id: itemId }
    });

    return { success: true };
  }
}

export const knowledgeService = new KnowledgeService();
