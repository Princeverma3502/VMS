import express from 'express';
import {
  createMeeting,
  getMeetings,
  markMeetingAttendance,
  deleteMeeting,
  getMeetingDetails
} from '../controllers/meetingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET all meetings for user
router.get('/', getMeetings);

// CREATE meeting (Secretary or Domain Head)
router.post('/', 
  allowRoles('Secretary', 'Domain Head'),
  createMeeting
);

// GET meeting details
router.get('/:id', getMeetingDetails);

// Mark attendance
router.put('/:id/attend', markMeetingAttendance);

// DELETE meeting (Creator only)
router.delete('/:id', deleteMeeting);

export default router;
