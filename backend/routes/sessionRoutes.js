import express from 'express';
import { endSession } from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Secretary ends session for their college
router.post('/:collegeId/end', protect, endSession);

export default router;
