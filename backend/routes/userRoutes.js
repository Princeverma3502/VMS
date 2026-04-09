import express from 'express';
import {
  getAllUsers,
  updateUserBloodGroup,
  getUserProfile,
  updateUserProfile,
  getLeaderboard,
  assignCollege,
  subscribePush,
  updateProfilePhoto,
  getXPHistory,
  verifyUserById,
  deleteUser,
  rejectUser,
  updateUserRole,
  updateUser,
  getBloodGroupStats
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- PUBLIC / SEMI-PROTECTED ROUTES ---
router.get('/leaderboard', protect, getLeaderboard);
router.get('/blood-group-stats', protect, getBloodGroupStats);

// --- PROFILE MANAGEMENT ---
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile); 

router.route('/profile/:id')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile); 

// --- SPECIFIC UPDATES ---
router.put('/profile-photo', protect, updateProfilePhoto);
router.post('/subscribe-push', protect, subscribePush);

// --- HISTORY & VERIFICATION ---
router.get('/:id/xp-history', protect, getXPHistory);
router.get('/verify/:id', protect, verifyUserById);

// --- ADMIN / SECRETARY ONLY ---
router.route('/')
  .get(protect, admin, getAllUsers); // Added admin protection here so normal users can't fetch all users

router.route('/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

router.put('/:id/reject', protect, admin, rejectUser);
router.put('/:id/role', protect, admin, updateUserRole);

router.put('/assign-college', protect, admin, assignCollege);
router.put('/:id/blood-group', protect, admin, updateUserBloodGroup);

export default router;