import express from 'express';
import { markAttendance } from '../controllers/attendanceController.js';
import { createEvent, getEvents, getEventById, deleteEvent, registerForEvent, unregisterFromEvent } from '../controllers/eventController.js';
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

// Event registration
router.route('/:id/register')
    .post(protect, allowRoles('Volunteer', 'Secretary', 'Domain Head', 'Associate Head'), registerForEvent)
    .delete(protect, allowRoles('Volunteer', 'Secretary', 'Domain Head', 'Associate Head'), unregisterFromEvent);

// -- Smart Attendance (Geofencing) --
// @route   POST /events/attendance/mark
// @desc    Verify location and mark attendance
// @access  Protected (Volunteers)
router.post(
  '/attendance/mark', 
  protect, 
  allowRoles('Volunteer', 'Associate Head'), 
  markAttendance
);

export default router;