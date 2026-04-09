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
import upload from '../config/uploadConfig.js'; // ✅ Fixed path

const router = express.Router();

// --- PUBLIC / SEMI-PROTECTED ---
router.get('/leaderboard', protect, getLeaderboard);
router.get('/blood-group-stats', protect, getBloodGroupStats);

// --- PROFILE MANAGEMENT ---
// ✅ FIX: added :id? so frontend calls to /users/profile/ID work
router.route('/profile/:id?')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile); 

// ✅ FIX: Profile Photo (placed before generic :id)
router.put('/profile-photo', protect, upload.single('image'), updateProfilePhoto);

// --- HISTORY & VERIFICATION ---
router.get('/:id/xp-history', protect, getXPHistory);
router.get('/verify/:id', protect, verifyUserById);
router.post('/subscribe-push', protect, subscribePush);

// --- ADMIN / SECRETARY ONLY ---
router.route('/')
  .get(protect, admin, getAllUsers); 

// Generic admin update/delete
router.route('/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

router.put('/:id/reject', protect, admin, rejectUser);
router.put('/:id/role', protect, admin, updateUserRole);
router.put('/:id/blood-group', protect, admin, updateUserBloodGroup);
router.put('/assign-college', protect, admin, assignCollege);

export default router;