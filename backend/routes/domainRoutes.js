import express from 'express';
// Note: You will need to create domainController.js
import { createDomain, getAllDomains } from '../controllers/domainController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  // @route   GET /domains
  // @desc    Get list of domains
  // @access  Private
  .get(protect, getAllDomains)

  // @route   POST /domains
  // @desc    Create a new domain and assign a Head
  // @access  Protected (Secretary Only)
  .post(protect, allowRoles('Secretary'), createDomain);

export default router;