import express from 'express';
import {
  uploadDemoCertificate,
  getDemoCertificates,
  deleteDemoCertificate,
  getAvailableCertificates,
  generatePersonalizedCertificate,
} from '../controllers/demoCertificateController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import upload from '../config/uploadConfig.js';

const router = express.Router();

// Secretary routes
router.post(
  '/',
  protect,
  allowRoles('Secretary'),
  upload.single('certificate'),
  uploadDemoCertificate
);
router.get('/', protect, allowRoles('Secretary'), getDemoCertificates);
router.delete('/:id', protect, allowRoles('Secretary'), deleteDemoCertificate);

// Volunteer routes
router.get('/available', protect, getAvailableCertificates);
router.post('/:id/generate', protect, generatePersonalizedCertificate);

export default router;