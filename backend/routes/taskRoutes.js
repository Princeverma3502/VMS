import express from 'express';
import { 
    createTask, 
    getTasks, 
    deleteTask,
    claimTask, 
    submitTask, 
    verifyTask 
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getTasks)
  .post(protect, allowRoles('Secretary', 'Domain Head'), createTask);

// Specific Task Operations
router.route('/:id')
  .delete(protect, allowRoles('Secretary', 'Domain Head'), deleteTask);

// Volunteer Actions
router.put('/:id/claim', protect, allowRoles('Volunteer', 'Associate Head'), claimTask);
router.put('/:id/submit', protect, allowRoles('Volunteer', 'Associate Head'), submitTask);

// Admin Actions
router.put('/:id/verify', protect, allowRoles('Secretary', 'Domain Head'), verifyTask);

export default router;