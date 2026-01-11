import asyncHandler from 'express-async-handler'; //
import Event from '../models/Event.js';
import User from '../models/User.js';
import { getDistanceFromLatLonInMeters } from '../utils/geofence.js';

// @desc    Mark Attendance via Geofence
// @route   POST /api/attendance/mark
// @access  Private (Volunteer)
export const markAttendance = asyncHandler(async (req, res) => {
  const { eventId, userLocation } = req.body;
  const userId = req.user._id;

  // 1. Basic Input Validation
  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    res.status(400);
    throw new Error('User location (latitude/longitude) is required.');
  }

  // 2. Fetch Event
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found.');
  }

  // 3. Check Logic: Is Event Active? (Optional: Check date/time vs now)
  const isEventActive = true; // Replace with logic: new Date() >= event.date && event.status !== 'Completed'
  if (!isEventActive) {
    res.status(400);
    throw new Error('This event is not currently accepting attendance.');
  }

  // 4. Check Logic: Duplicate Attendance
  // Assuming Event model has an 'attendees' array of User IDs
  const isAlreadyAttended = event.attendees && event.attendees.includes(userId);
  if (isAlreadyAttended) {
    res.status(409); // Conflict
    throw new Error('Attendance already marked for this event.');
  }

  // 5. Geofence Calculation
  const { latitude: userLat, longitude: userLng } = userLocation;
  const eventLat = event.geofenceCoordinates.latitude;
  const eventLng = event.geofenceCoordinates.longitude;
  const allowedRadius = event.geofenceCoordinates.radiusInMeters || 100;

  const distance = getDistanceFromLatLonInMeters(userLat, userLng, eventLat, eventLng);

  if (distance > allowedRadius) {
    res.status(400);
    throw new Error(`You are too far from the venue. Distance: ${distance}m. Required: <${allowedRadius}m.`);
  }

  // 6. Execute Updates Atomically (Parallel Execution)
  // We update the Event (add attendee) and User (add XP) simultaneously
  const xpReward = 50;

  const [updatedEvent, updatedUser] = await Promise.all([
    Event.findByIdAndUpdate(
      eventId,
      { $addToSet: { attendees: userId } }, // $addToSet prevents duplicates at DB level
      { new: true }
    ),
    User.findByIdAndUpdate(
      userId,
      { 
        $inc: { 'gamification.xpPoints': xpReward },
        $push: { eventsAttended: eventId } // Assuming User tracks their history
      },
      { new: true }
    )
  ]);

  if (!updatedUser) {
    res.status(404);
    throw new Error('User not found during update.');
  }

  // 7. Success Response
  res.status(200).json({
    success: true,
    message: `Attendance verified! You earned +${xpReward} XP.`,
    data: {
      distance: distance,
      totalXP: updatedUser.gamification.xpPoints,
      eventName: updatedEvent.title
    }
  });
});