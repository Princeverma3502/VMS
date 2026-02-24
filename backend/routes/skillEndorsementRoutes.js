import express from 'express';
import {
  requestEndorsement,
  getPendingEndorsements,
  approveEndorsement,
  rejectEndorsement,
  getUserEndorsements,
  getSkillCategories
} from '../controllers/skillEndorsementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/categories', getSkillCategories);

// Protected routes
router.post('/', protect, requestEndorsement);
router.get('/user/:userId', protect, getUserEndorsements);

// Admin routes
router.get('/pending', protect, allowRoles('Secretary', 'Domain Head'), getPendingEndorsements);
router.put('/:id/approve', protect, allowRoles('Secretary', 'Domain Head'), approveEndorsement);
router.delete('/:id', protect, allowRoles('Secretary', 'Domain Head'), rejectEndorsement);

export default router;