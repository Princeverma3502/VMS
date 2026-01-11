import express from 'express';
import {
  getVolunteerResume,
  getMyResume,
  updateResume,
  generateCertificate,
  shareResume,
  addSkill,
  addTestimonial,
  getResumeStats,
} from '../controllers/volunteerResumeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/:userId', getVolunteerResume);
router.get('/stats/:userId', getResumeStats);
router.get('/share/:uniqueLink', shareResume);

// Protected routes
router.get('/', protect, getMyResume);
router.put('/', protect, updateResume);
router.post('/generate-certificate', protect, generateCertificate);
router.post('/add-skill', protect, addSkill);
router.post('/:volunteerId/add-testimonial', protect, addTestimonial);

export default router;
