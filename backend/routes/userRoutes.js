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
  deleteUser,
  approveUser,
  rejectUser,
  updateUserRole,
  getBloodGroupStats
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- PUBLIC / SEMI-PROTECTED ROUTES ---
router.get('/leaderboard', protect, getLeaderboard);
router.get('/blood-group-stats', protect, getBloodGroupStats);

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
  .get(protect, getAllUsers);  // Allow secretaries and admins to list users

router.route('/:id')
  .delete(protect, admin, deleteUser);

router.put('/:id/approve', protect, admin, approveUser);
router.put('/:id/reject', protect, admin, rejectUser);
router.put('/:id/role', protect, admin, updateUserRole);

router.put('/assign-college', protect, assignCollege);

export default router;