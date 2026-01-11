import express from 'express';
import { createCollege, getCollegeBySlug } from '../controllers/collegeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createCollege); // protect so only authenticated secretaries can create for their unit
router.get('/:slug', getCollegeBySlug);

export default router;
