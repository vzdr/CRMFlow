import { Router } from 'express';
import multer from 'multer';
import { knowledgeController } from '../controllers/knowledge.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Configure multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDFs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/knowledge
 * Get all knowledge items
 */
router.get('/', knowledgeController.getKnowledgeItems.bind(knowledgeController));

/**
 * POST /api/knowledge/pdf
 * Upload PDF file
 */
router.post('/pdf', upload.single('file'), knowledgeController.uploadPDF.bind(knowledgeController));

/**
 * POST /api/knowledge/scrape
 * Scrape website
 */
router.post('/scrape', knowledgeController.scrapeWebsite.bind(knowledgeController));

/**
 * POST /api/knowledge/manual
 * Add manual Q&A
 */
router.post('/manual', knowledgeController.addManual.bind(knowledgeController));

/**
 * PUT /api/knowledge/:id
 * Update knowledge item (e.g., toggle enabled)
 */
router.put('/:id', knowledgeController.updateKnowledgeItem.bind(knowledgeController));

/**
 * DELETE /api/knowledge/:id
 * Delete knowledge item
 */
router.delete('/:id', knowledgeController.deleteKnowledgeItem.bind(knowledgeController));

export default router;
