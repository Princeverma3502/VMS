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
  approveUser,
  updateUserRole,
  updateUser,
  getBloodGroupStats
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../config/uploadConfig.js';

const router = express.Router();

// --- 1. STATIC ROUTES ---
router.get('/leaderboard', protect, getLeaderboard);
router.get('/blood-group-stats', protect, getBloodGroupStats);
router.post('/subscribe-push', protect, subscribePush);
router.put('/assign-college', protect, admin, assignCollege);

// --- 2. PROFILE MANAGEMENT ---
router.route('/profile/:id?')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile); 

// ✅ Photo Upload with Multer
router.put('/profile-photo', protect, upload.single('image'), updateProfilePhoto);

// --- 3. ADMIN USER MANAGEMENT ---
router.route('/')
  .get(protect, admin, getAllUsers); 

router.get('/:id/xp-history', protect, getXPHistory);
router.get('/verify/:id', protect, verifyUserById);

router.route('/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

router.put('/:id/approve', protect, admin, approveUser);
router.put('/:id/reject', protect, admin, rejectUser);
router.put('/:id/role', protect, admin, updateUserRole);
router.put('/:id/blood-group', protect, admin, updateUserBloodGroup);

export default router;