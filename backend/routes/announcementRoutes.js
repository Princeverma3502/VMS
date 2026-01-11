import express from 'express';
import { 
  createAnnouncement, 
  getAnnouncements, 
  markAnnouncementRead,
  getAnnouncementStats,
  deleteAnnouncement 
} from '../controllers/announcementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET announcements for user
router.get('/', getAnnouncements);

// CREATE announcement (Secretary or Domain Head)
router.post('/', 
  allowRoles('Secretary', 'Domain Head'), 
  createAnnouncement
);

// Mark as read
router.put('/:id/read', markAnnouncementRead);

// Get stats (Creator only)
router.get('/:id/stats', getAnnouncementStats);

// DELETE announcement (Creator only)
router.delete('/:id', deleteAnnouncement);

export default router;
