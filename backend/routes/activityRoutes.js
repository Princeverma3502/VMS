import express from 'express';
import {
  createActivity,
  getActivityFeed,
  getUserActivity,
  likeActivity,
  commentOnActivity,
  getTrendingActivities,
} from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getActivityFeed);
router.get('/trending', getTrendingActivities);
router.get('/user/:userId', getUserActivity);

// Protected routes
router.post('/', protect, createActivity);
router.put('/:activityId/like', protect, likeActivity);
router.put('/:activityId/comment', protect, commentOnActivity);

export default router;
