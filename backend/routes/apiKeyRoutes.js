import express from 'express';
import { generateKey, getKeys, revokeKey } from '../controllers/apiKeyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Secretary', 'admin')); // Only Admins can manage keys

router.route('/').get(getKeys).post(generateKey);
router.route('/:id').delete(revokeKey);

export default router;