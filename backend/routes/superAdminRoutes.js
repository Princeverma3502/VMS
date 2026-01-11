import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as superAdminController from '../controllers/superAdminController.js';

const router = express.Router();

// All super-admin routes require auth
router.use(protect);

// Dashboard & Stats
router.get('/dashboard', superAdminController.getDashboardStats);

// College Management
router.get('/colleges', superAdminController.getAllColleges);
router.get('/colleges/:collegeId/analytics', superAdminController.getCollegeAnalytics);
router.put('/colleges/:collegeId/deactivate', superAdminController.deactivateCollege);

// Global Broadcasts
router.post('/broadcasts', superAdminController.sendGlobalBroadcast);
router.get('/broadcasts', superAdminController.getBroadcasts);

// Webhook Management
router.get('/webhooks/logs', superAdminController.getWebhookLogs);
router.post('/webhooks/:webhookLogId/retry', superAdminController.retryFailedWebhook);

// Data Export
router.get('/export', superAdminController.exportCollegeData);

export default router;