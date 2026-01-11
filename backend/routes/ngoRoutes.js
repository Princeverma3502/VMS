import express from 'express';
import { registerNGO, getNGOs } from '../controllers/ngoController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import upload from '../config/uploadConfig.js'; // <--- NEW IMPORT (Uploads)
import { ngoValidation } from '../validators/ngoValidator.js'; // <--- NEW IMPORT (Validation)

const router = express.Router();

router.route('/')
  .get(protect, allowRoles('Secretary', 'Domain Head'), getNGOs)
  
  // POST Request Flow: 
  // 1. Check Auth -> 2. Check Role -> 3. Handle File Upload -> 4. Validate Text Inputs -> 5. Create Controller
  .post(
    protect, 
    allowRoles('Secretary'), 
    upload.single('logo'), // Expects form-data field named 'logo'
    ngoValidation,         // Validates 'name' and 'description'
    registerNGO
  );

export default router;