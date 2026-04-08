import express from 'express';
import {
  createNotice,
  getNotices,
  getNoticeById,
  markNoticeAsRead,
  getReadStatus,
  pinNotice,
  deleteNotice,
} from '../controllers/noticeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
// (controllers access req.user.collegeId — unauthenticated access would crash)
router.use(protect);

router.get('/', getNotices);
router.get('/:id', getNoticeById);
router.post('/', authorize('Secretary', 'Domain Head'), createNotice);
router.put('/:id/read', markNoticeAsRead);
router.get('/:id/read-status', getReadStatus);
router.put('/:id/pin', pinNotice);
router.delete('/:id', deleteNotice);

export default router;
