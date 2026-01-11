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

// Public routes
router.get('/', getNotices);
router.get('/:id', getNoticeById);

// Protected routes
router.post('/', protect, authorize('Secretary', 'Domain Head'), createNotice);
router.put('/:id/read', protect, markNoticeAsRead);
router.get('/:id/read-status', protect, getReadStatus);
router.put('/:id/pin', protect, pinNotice);
router.delete('/:id', protect, deleteNotice);

export default router;
