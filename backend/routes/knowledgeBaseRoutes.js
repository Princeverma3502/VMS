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

// All routes require authentication — controllers access req.user.collegeId for tenant isolation
router.use(protect);

router.get('/', getArticles);
router.get('/category/:category', getArticlesByCategory);
router.get('/search/:query', searchArticles);
router.get('/:slug', getArticleBySlug);

// Protected write routes
router.post('/', authorize('Secretary', 'Domain Head'), createArticle);
router.put('/:slug/helpful', markAsHelpful);

// Update/Delete — controller checks author or admin internally
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);

export default router;
