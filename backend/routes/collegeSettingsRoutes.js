import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import collegeSettingsController from '../controllers/collegeSettingsController.js';
import { getIDCardSettings, updateIDCardSettings } from '../controllers/idCardController.js';

const router = express.Router();

router.get('/:collegeId', collegeSettingsController.getSettingsByCollegeId);
router.put('/:collegeId', protect, collegeSettingsController.updateSettings);
router.use(protect);

// Allow all logged in users to GET settings (so students see the correct logo/color)
router.get('/id-card', getIDCardSettings);

// Only Secretary/Admin can UPDATE settings
router.put('/id-card', authorize('Secretary', 'admin'), updateIDCardSettings);

export default router;
