import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import resumeController from '../controllers/resumeController.js';

const router = express.Router();

// Generate PDF resume
router.get('/:userId/pdf', protect, resumeController.generateResumePDF);

// Get resume preview (JSON)
router.get('/:userId/preview', protect, resumeController.getResumePreview);

// Get college-wide stats
router.get('/college/:collegeId/stats', protect, resumeController.getCollegeResumeStats);

// Export all resumes for college
router.get('/college/:collegeId/export', protect, resumeController.exportCollegeResumes);

export default router;
