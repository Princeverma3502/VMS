import express from 'express';
import { spinWheel, submitTrivia } from '../controllers/gameController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// @route   POST /api/game/spin
// @desc    Daily Spin Logic (+XP)
// @access  Protected (Volunteer)
router.post('/spin', protect, allowRoles('Volunteer'), spinWheel);

// @route   POST /api/game/trivia
// @desc    Submit daily trivia answer
// @access  Protected (Volunteer)
router.post('/trivia', protect, allowRoles('Volunteer'), submitTrivia);

export default router;