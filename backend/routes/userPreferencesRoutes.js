import express from 'express';
import {
  getPreferences,
  updateTheme,
  updateNotifications,
  updatePrivacy,
  updateColors,
  updateLanguage,
  updateLayout,
  resetPreferences,
} from '../controllers/userPreferencesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get preferences
router.get('/', getPreferences);

// Update specific preferences
router.put('/theme', updateTheme);
router.put('/notifications', updateNotifications);
router.put('/privacy', updatePrivacy);
router.put('/colors', updateColors);
router.put('/language', updateLanguage);
router.put('/layout', updateLayout);

// Reset to defaults
router.delete('/reset', resetPreferences);

export default router;
