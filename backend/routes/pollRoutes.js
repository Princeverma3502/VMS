import express from 'express';
import {
  createPoll,
  getPolls,
  getPollById,
  voteOnPoll,
  getPollResults,
  deletePoll,
} from '../controllers/pollController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.get('/', protect, getPolls);
router.get('/:id', protect, getPollById);
router.get('/:pollId/results', protect, getPollResults);

// Protected routes
router.post('/', protect, authorize('Secretary', 'Domain Head'), createPoll);
router.put('/:pollId/vote', protect, voteOnPoll);
router.delete('/:id', protect, deletePoll);

export default router;
