import express from 'express';
import {
  getAllUsers,
  updateUserBloodGroup,
  getUserProfile,
  updateUserProfile,
  getLeaderboard,
  assignCollege,
  subscribePush,
  updateProfilePhoto, // This now uses the Buffer/Cloudinary logic we fixed
  getXPHistory,
  verifyUserById,
  deleteUser,
  rejectUser,
  updateUserRole,
  updateUser,
  getBloodGroupStats
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js'; // ✅ Import the memory-storage multer config

const router = express.Router();

// --- PUBLIC / SEMI-PROTECTED ROUTES ---
// These require a valid login (protect) but not admin rights
router.get('/leaderboard', protect, getLeaderboard);
router.get('/blood-group-stats', protect, getBloodGroupStats);

// --- PROFILE MANAGEMENT (SELF) ---
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile); 


router.put('/profile-photo', protect, upload.single('image'), updateProfilePhoto);

// --- SPECIFIC USER/HISTORY ROUTES ---
router.get('/:id/xp-history', protect, getXPHistory);
router.get('/verify/:id', protect, verifyUserById);
router.post('/subscribe-push', protect, subscribePush);

// --- ADMIN / SECRETARY ONLY ROUTES ---
// These routes require the user to have an admin/secretary role
router.route('/')
  .get(protect, admin, getAllUsers); 

router.route('/:id')
  .get(protect, getUserProfile) // Admin viewing a specific profile
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

router.put('/:id/reject', protect, admin, rejectUser);
router.put('/:id/role', protect, admin, updateUserRole);
router.put('/:id/blood-group', protect, admin, updateUserBloodGroup);

// College assignment (usually for Secretaries)
router.put('/assign-college', protect, admin, assignCollege);

export default router;