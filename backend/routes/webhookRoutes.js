import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Secretary'));

router.get('/', (req, res) => res.json({ message: "Webhook settings endpoint" }));

export default router;