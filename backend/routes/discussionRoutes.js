import express from 'express';
import { getPostsForEvent, createPost, deletePost } from '../controllers/discussionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All discussion routes are protected
router.use(protect);

router.route('/:eventId')
  .get(getPostsForEvent)
  .post(createPost);

router.route('/posts/:postId')
  .delete(deletePost);

export default router;
