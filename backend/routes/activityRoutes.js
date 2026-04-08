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

// All routes require authentication — tenant isolation applied in controllers
router.use(protect);

router.get('/', getActivityFeed);
router.get('/trending', getTrendingActivities);
router.get('/user/:userId', getUserActivity);
router.post('/', createActivity);
router.put('/:activityId/like', likeActivity);
router.put('/:activityId/comment', commentOnActivity);

export default router;
