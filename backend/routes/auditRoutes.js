import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/logs', protect, allowRoles('Secretary'), getAuditLogs);

export default router;