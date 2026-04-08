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

// All routes require authentication — volunteer data is PII
router.use(protect);

// These are still accessible to any authenticated user (within their college) for public profiles
router.get('/:userId', getVolunteerResume);
router.get('/stats/:userId', getResumeStats);
router.get('/share/:uniqueLink', shareResume);

// Self-only routes
router.get('/', getMyResume);
router.put('/', updateResume);
router.post('/generate-certificate', generateCertificate);
router.post('/add-skill', addSkill);
router.post('/:volunteerId/add-testimonial', addTestimonial);

export default router;
