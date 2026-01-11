import express from 'express';
import { markAttendance } from '../controllers/attendanceController.js';
import { createEvent, getEvents, getEventById, deleteEvent } from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// -- Event Management --
router.route('/')
  .get(protect, getEvents)
  .post(protect, allowRoles('Secretary', 'Domain Head'), createEvent);

router.route('/:id')
    .get(protect, getEventById)
    .delete(protect, allowRoles('Secretary'), deleteEvent);

// -- Smart Attendance (Geofencing) --
// @route   POST /api/events/attendance/mark
// @desc    Verify location and mark attendance
// @access  Protected (Volunteers)
router.post(
  '/attendance/mark', 
  protect, 
  allowRoles('Volunteer', 'Associate Head'), 
  markAttendance
);

export default router;