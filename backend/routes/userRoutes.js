import express from 'express';
import {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  getLeaderboard,
  assignCollege,
  subscribePush,
  updateProfilePhoto,
  getXPHistory,
  verifyUserById,
  deleteUser
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- PUBLIC / SEMI-PROTECTED ROUTES ---
router.get('/leaderboard', protect, getLeaderboard);

// --- PROFILE MANAGEMENT ---
// This was missing/broken, causing the "Not Found" error
router.route('/profile')
  .put(protect, updateUserProfile); 

router.route('/profile/:id')
  .get(protect, getUserProfile); 

// --- SPECIFIC UPDATES ---
router.put('/profile-photo', protect, updateProfilePhoto);
router.post('/subscribe-push', protect, subscribePush);

// --- HISTORY & VERIFICATION ---
router.get('/:id/xp-history', protect, getXPHistory);
router.get('/verify/:id', protect, verifyUserById);

// --- ADMIN / SECRETARY ONLY ---
router.route('/')
  .get(protect, admin, getAllUsers);

router.route('/:id')
  .delete(protect, admin, deleteUser);

router.put('/assign-college', protect, assignCollege);

export default router;