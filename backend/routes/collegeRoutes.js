import express from 'express';
import { createCollege, getCollegeBySlug, getAllColleges } from '../controllers/collegeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only Secretary can create colleges
router.post('/', protect, authorize('Secretary'), createCollege);
// Public listing of colleges (needed for registration dropdown)
router.get('/', getAllColleges);
router.get('/:slug', getCollegeBySlug);

export default router;
