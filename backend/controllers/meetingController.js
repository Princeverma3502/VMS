import Meeting from '../models/Meeting.js';
import User from '../models/User.js';
import Domain from '../models/Domain.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new meeting (Secretary or Domain Head only)
// @route   POST /meetings
export const createMeeting = asyncHandler(async (req, res) => {
  const { title, description, scheduledAt, duration, meetingType, meetLink, location, meetScope, domainId, invitedUserIds } = req.body;
  const userId = req.user._id;

  // Validation
  if (!title || !scheduledAt) {
    res.status(400);
    throw new Error('Title and scheduled time are required');
  }

  // Only Secretary and Domain Heads can create meetings
  if (req.user.role !== 'Secretary' && req.user.role !== 'Domain Head') {
    res.status(403);
    throw new Error('Only Secretary and Domain Heads can schedule meetings');
  }

  let domainRef = null;
  let invitedUsers = [];

  if (meetScope === 'Domain') {
    if (!domainId) {
      res.status(400);
      throw new Error('Domain ID is required for domain-scoped meetings');
    }
    const domain = await Domain.findById(domainId);
    if (!domain) {
      res.status(404);
      throw new Error('Domain not found');
    }
    if (domain.head.toString() !== userId.toString() && req.user.role !== 'Secretary') {
      res.status(403);
      throw new Error('Only the domain head or secretary can create domain meetings');
    }
    domainRef = domainId;
  }

  if (meetingType === 'Online' && !meetLink) {
    res.status(400);
    throw new Error('Meeting link is required for online meetings');
  }

  if (meetingType === 'Offline' && !location) {
    res.status(400);
    throw new Error('Location is required for offline meetings');
  }

  const meeting = await Meeting.create({
    title,
    description,
    scheduledAt,
    duration: duration || 60,
    meetingType,
    meetLink: meetingType === 'Online' ? meetLink : null,
    location: meetingType === 'Offline' ? location : null,
    meetScope,
    domain: domainRef,
    createdBy: userId,
    collegeId: req.user.collegeId,
    invitedUsers: invitedUserIds || []
  });

  const populatedMeeting = await meeting.populate('createdBy', 'name role');
  
  res.status(201).json(populatedMeeting);
});

// @desc    Get all meetings for the logged-in user
// @route   GET /meetings
export const getMeetings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  const query = { collegeId: req.user.collegeId };

  // Secretary sees all meetings
  if (user.role === 'Secretary') {
    // See all meetings
  } 
  // Domain Head sees their domain meetings and All meetings
  else if (user.role === 'Domain Head') {
    const myDomains = await Domain.find({ head: userId });
    const domainIds = myDomains.map(d => d._id);
    
    query.$or = [
      { meetScope: 'All' },
      { meetScope: 'Domain', domain: { $in: domainIds } },
      { createdBy: userId }
    ];
  }
  // Volunteers and Associate Heads see All meetings and their invited meetings
  else {
    query.$or = [
      { meetScope: 'All' },
      { invitedUsers: userId }
    ];
  }

  const meetings = await Meeting.find(query)
    .sort({ scheduledAt: 1 })
    .populate('createdBy', 'name role')
    .populate('domain', 'name')
    .populate('invitedUsers', 'name email');

  res.json(meetings);
});

// @desc    Mark attendance for a meeting
// @route   PUT /meetings/:id/attend
export const markMeetingAttendance = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  
  if (!meeting) {
    res.status(404);
    throw new Error('Meeting not found');
  }

  // Check if meeting has started and not ended
  const now = new Date();
  const meetingStart = new Date(meeting.scheduledAt);
  const meetingEnd = new Date(meetingStart.getTime() + meeting.duration * 60000);

  if (now < meetingStart || now > meetingEnd) {
    res.status(400);
    throw new Error('You can only mark attendance during the meeting time');
  }

  // Check if user already marked attendance
  const alreadyAttended = meeting.attendees.some(
    a => a.userId.toString() === req.user._id.toString()
  );

  if (!alreadyAttended) {
    meeting.attendees.push({
      userId: req.user._id,
      joinedAt: now
    });
    await meeting.save();
  }

  res.json({
    message: 'Attendance marked successfully',
    meeting
  });
});

// @desc    Delete a meeting (Creator only)
// @route   DELETE /meetings/:id
export const deleteMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  
  if (!meeting) {
    res.status(404);
    throw new Error('Meeting not found');
  }

  if (meeting.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the creator can delete the meeting');
  }

  await meeting.deleteOne();
  res.json({ message: 'Meeting deleted' });
});

// @desc    Get meeting details
// @route   GET /meetings/:id
export const getMeetingDetails = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id)
    .populate('createdBy', 'name role email')
    .populate('domain', 'name')
    .populate('invitedUsers', 'name email role')
    .populate('attendees.userId', 'name role');

  if (!meeting) {
    res.status(404);
    throw new Error('Meeting not found');
  }

  res.json(meeting);
});
