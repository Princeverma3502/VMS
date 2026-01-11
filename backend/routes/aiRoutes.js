import express from 'express';
import { queryAI } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Allow protected access for now — can be public if desired
router.post('/query', protect, queryAI);

export default router;
