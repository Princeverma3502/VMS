import express from 'express';
import { endSession } from '../controllers/sessionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Secretary ends session for their college — role check added
router.post('/:collegeId/end', protect, authorize('Secretary'), endSession);

export default router;
