import express from 'express';
import GeofenceLocation from '../models/GeofenceLocation.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create geofence location
// @route   POST /geofence
// @access  Private (Secretary/Domain Head)
router.post('/', protect, authorize('Secretary', 'Domain Head'), async (req, res) => {
  try {
    const { eventId, taskId, locationName, latitude, longitude, radiusMeters, address, mapUrl } = req.body;

    const geofence = await GeofenceLocation.create({
      eventId,
      taskId,
      locationName,
      latitude,
      longitude,
      radiusMeters,
      address,
      mapUrl,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Geofence location created',
      data: geofence,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get geofence by event
// @route   GET /geofence/event/:eventId
// @access  Public
router.get('/event/:eventId', async (req, res) => {
  try {
    const geofence = await GeofenceLocation.findOne({ eventId: req.params.eventId, isActive: true });

    if (!geofence) {
      return res.status(404).json({ message: 'Geofence not found' });
    }

    res.status(200).json({
      success: true,
      data: geofence,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Check if user is within geofence
// @route   POST /geofence/check-in
// @access  Private
router.post('/check-in', protect, async (req, res) => {
  try {
    const { eventId, userLat, userLon } = req.body;

    const geofence = await GeofenceLocation.findOne({ eventId, isActive: true });

    if (!geofence) {
      return res.status(404).json({ message: 'Geofence not found for this event' });
    }

    // Calculate distance using Haversine formula
    const R = 6371000; // Earth radius in meters
    const dLat = ((userLat - geofence.latitude) * Math.PI) / 180;
    const dLon = ((userLon - geofence.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((geofence.latitude * Math.PI) / 180) *
        Math.cos((userLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    const isWithinGeofence = distance <= geofence.radiusMeters;

    res.status(200).json({
      success: true,
      isWithinGeofence,
      distance,
      allowedRadius: geofence.radiusMeters,
      message: isWithinGeofence ? 'You are within the event location' : 'You are outside the event location',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update geofence
// @route   PUT /geofence/:id
// @access  Private (Secretary/Domain Head)
router.put('/:id', protect, authorize('Secretary', 'Domain Head'), async (req, res) => {
  try {
    const { radiusMeters, isActive } = req.body;

    const geofence = await GeofenceLocation.findByIdAndUpdate(
      req.params.id,
      { radiusMeters, isActive },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Geofence updated',
      data: geofence,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete geofence
// @route   DELETE /geofence/:id
// @access  Private (Secretary/Domain Head)
router.delete('/:id', protect, authorize('Secretary', 'Domain Head'), async (req, res) => {
  try {
    await GeofenceLocation.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Geofence deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
