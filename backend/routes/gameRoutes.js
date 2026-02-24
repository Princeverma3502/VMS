import express from 'express';
import { spinWheel, submitTrivia, awardXP, getLeaderboard, getUserStats, awardBadge } from '../controllers/gameController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// @route   POST /game/spin
// @desc    Daily Spin Logic (+XP)
// @access  Protected (Volunteer)
router.post('/spin', protect, allowRoles('Volunteer'), spinWheel);

// @route   POST /game/trivia
// @desc    Submit daily trivia answer
// @access  Protected (Volunteer)
router.post('/trivia', protect, allowRoles('Volunteer'), submitTrivia);

// Additional gamification routes
router.post('/award-xp', protect, allowRoles('Secretary', 'Domain Head'), awardXP);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/stats/:userId', protect, getUserStats);
router.post('/badge', protect, allowRoles('Secretary', 'Domain Head'), awardBadge);

export default router;