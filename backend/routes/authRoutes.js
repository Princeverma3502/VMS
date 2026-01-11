import express from 'express';
import { check } from 'express-validator';
import { registerUser, loginUser, getMe, getPendingUsers, approveUser, resetUserPassword, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// --- VALIDATION RULES ---
const registerValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
  check('whatsappNumber', 'WhatsApp number is required').not().isEmpty(),
  check('year', 'Year is required').isIn(['1st', '2nd', '3rd', '4th']),
  check('branch', 'Branch is required').not().isEmpty()
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').exists()
];

// --- ROUTES ---

// Apply validation middleware array as the 2nd argument
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

// Approval Routes (Secretary Only)
router.get('/pending', protect, allowRoles('Secretary'), getPendingUsers);
router.put('/approve/:id', protect, allowRoles('Secretary'), approveUser);
router.put('/reset-password/:id', protect, allowRoles('Secretary'), resetUserPassword);

export default router;