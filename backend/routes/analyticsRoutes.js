import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { enforceTenant } from '../middleware/tenantMiddleware.js';
import {
  getVolunteerDemographics,
  getTaskMetrics,
  getEventAnalytics,
  exportVolunteerCSV
} from '../controllers/analyticsController.js';

const router = express.Router();

// All analytics routes require authentication and specific roles
router.use(protect);
router.use(allowRoles('Secretary', 'Domain Head'));
router.use(enforceTenant); // Ensure users only see their college's data

router.get('/demographics', getVolunteerDemographics);
router.get('/tasks', getTaskMetrics);
router.get('/events', getEventAnalytics);

// Export restricted to Secretary only
router.get('/export/volunteers', allowRoles('Secretary'), exportVolunteerCSV);

export default router;
