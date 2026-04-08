import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import resumeController from '../controllers/resumeController.js';

const router = express.Router();

// Generate PDF resume
router.get('/:userId/pdf', protect, resumeController.generateResumePDF);

// Get resume preview (JSON)
router.get('/:userId/preview', protect, resumeController.getResumePreview);

// Get college-wide stats (Admin/Secretary only)
router.get('/college/:collegeId/stats', protect, authorize('Secretary', 'Domain Head'), resumeController.getCollegeResumeStats);

// Export all resumes for college (Secretary only)
router.get('/college/:collegeId/export', protect, authorize('Secretary'), resumeController.exportCollegeResumes);

export default router;
