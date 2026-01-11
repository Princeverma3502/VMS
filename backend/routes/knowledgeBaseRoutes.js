import express from 'express';
import {
  createArticle,
  getArticles,
  getArticleBySlug,
  getArticlesByCategory,
  searchArticles,
  markAsHelpful,
  updateArticle,
  deleteArticle,
} from '../controllers/knowledgeBaseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getArticles);
router.get('/category/:category', getArticlesByCategory);
router.get('/search/:query', searchArticles);
router.get('/:slug', getArticleBySlug);

// Protected routes
router.post('/', protect, authorize('Secretary', 'Domain Head'), createArticle);
router.put('/:slug/helpful', markAsHelpful);
router.put('/:id', protect, updateArticle);
router.delete('/:id', protect, deleteArticle);

export default router;
