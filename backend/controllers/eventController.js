import asyncHandler from 'express-async-handler';
import Event from '../models/Event.js';

// @desc    Get all events (with optional filters)
// @route   GET /api/events
// @access  Private
export const getEvents = asyncHandler(async (req, res) => {
  const { status, type, search } = req.query;
  
  // Build query object
  // 1. Filter by College (Security)
  const query = { collegeId: req.user.collegeId };

  // 2. Optional Filters (Don't throw error if missing)
  if (status && status !== 'all') {
    query.status = status;
  }

  if (type && type !== 'all') {
    query.type = type;
  }

  // 3. Search functionality
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  try {
    // Sort by date (newest first)
    const events = await Event.find(query).sort({ date: -1 });
    res.json(events);
  } catch (error) {
    res.status(500);
    throw new Error('Server Error fetching events: ' + error.message);
  }
});

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Private
export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('createdBy', 'name');

  if (event) {
    // Security check: Ensure the user belongs to the same college as the event
    if (event.collegeId.toString() !== req.user.collegeId.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this event');
    }
    res.json(event);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Secretary)
export const createEvent = asyncHandler(async (req, res) => {
  const { name, date, time, location, description, type, xpPoints } = req.body;

  if (!name || !date || !type) {
    res.status(400);
    throw new Error('Please fill in all required fields (Name, Date, Type)');
  }

  const event = new Event({
    collegeId: req.user.collegeId,
    createdBy: req.user._id,
    name,
    date,
    time,
    location,
    description,
    type,
    xpPoints: xpPoints || 20, // Default XP
    status: 'Upcoming'
  });

  const createdEvent = await event.save();
  res.status(201).json(createdEvent);
});

// @desc    Delete event
// @route   DELETE /api/events/:id
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Ensure user owns the event's college
  if (event.collegeId.toString() !== req.user.collegeId.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this event');
  }

  await event.deleteOne();
  res.json({ message: 'Event removed' });
});