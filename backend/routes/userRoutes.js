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
  approveUser, // ✅ Added missing import
  updateUserRole,
  updateUser,
  getBloodGroupStats
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../config/uploadConfig.js';

const router = express.Router();

// --- 1. STATIC/SPECIAL ROUTES FIRST ---
// These must come before /:id routes to avoid being treated as IDs
router.get('/leaderboard', protect, getLeaderboard);
router.get('/blood-group-stats', protect, getBloodGroupStats);
router.post('/subscribe-push', protect, subscribePush);
router.put('/assign-college', protect, admin, assignCollege);

// --- 2. PROFILE MANAGEMENT ---
// ✅ Handles both /profile (self) and /profile/123 (viewing others)
router.route('/profile/:id?')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile); 

// ✅ Handles the photo upload separately to keep logic clean
router.put('/profile-photo', protect, upload.single('image'), updateProfilePhoto);

// --- 3. ADMIN USER MANAGEMENT (ROOT) ---
router.route('/')
  .get(protect, admin, getAllUsers); 

// --- 4. PARAMETERIZED ROUTES (ID-BASED) ---
router.get('/:id/xp-history', protect, getXPHistory);
router.get('/verify/:id', protect, verifyUserById);

router.route('/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

// Specific Action Routes
router.put('/:id/approve', protect, admin, approveUser); // ✅ Added
router.put('/:id/reject', protect, admin, rejectUser);
router.put('/:id/role', protect, admin, updateUserRole);
router.put('/:id/blood-group', protect, admin, updateUserBloodGroup);

export default router;