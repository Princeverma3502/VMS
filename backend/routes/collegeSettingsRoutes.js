import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import collegeSettingsController from '../controllers/collegeSettingsController.js';
import { getIDCardSettings, updateIDCardSettings } from '../controllers/idCardController.js';

const router = express.Router();
router.get('/id-card', protect, getIDCardSettings);
router.put('/id-card', protect, authorize('Secretary', 'admin'), updateIDCardSettings);
router.get('/:collegeId', collegeSettingsController.getSettingsByCollegeId);
router.put('/:collegeId', protect, collegeSettingsController.updateSettings);

export default router;