import Announcement from '../models/Announcement.js';
import User from '../models/User.js';
import Domain from '../models/Domain.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new announcement (Secretary or Domain Head only)
// @route   POST /announcements
export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, priority, scope, domainId, domain } = req.body;
  const userId = req.user._id;

  // Validation
  if (!title || !content) {
    res.status(400);
    throw new Error('Title and content are required');
  }

  // Only Secretary can create Global announcements
  if (scope === 'Global' && req.user.role !== 'Secretary') {
    res.status(403);
    throw new Error('Only Secretary can create global announcements');
  }

  // Only Domain Head can create Domain announcements
  if (scope === 'Domain' && req.user.role !== 'Domain Head') {
    res.status(403);
    throw new Error('Only Domain Heads can create domain announcements');
  }

  let domainRef = null;
  if (scope === 'Domain') {
    // Accept either a domainId or a domain name (from older UI) for compatibility
    let domainObj = null;
    if (domainId) {
      domainObj = await Domain.findById(domainId);
    } else if (domain) {
      domainObj = await Domain.findOne({ name: domain, collegeId: req.user.collegeId });
    }

    if (!domainObj) {
      res.status(404);
      throw new Error('Target domain not found');
    }

    if (domainObj.head.toString() !== userId.toString()) {
      res.status(403);
      throw new Error('You can only create announcements for your domain');
    }

    domainRef = domainObj._id;
  }

  const announcement = await Announcement.create({
    title,
    content,
    priority: priority || 'Info',
    scope,
    domain: domainRef,
    createdBy: userId,
    collegeId: req.user.collegeId
  });

  res.status(201).json(announcement);
});

// @desc    Get all announcements for the logged-in user
// @route   GET /announcements
export const getAnnouncements = asyncHandler(async (req, res) => {
  const { _id: userId, collegeId, role } = req.user;

  if (!collegeId) {
    res.status(400);
    throw new Error('User is not associated with a college.');
  }

  const query = {
    collegeId,
    expiresAt: { $gt: new Date() }
  };

  const orConditions = [{ scope: 'Global' }];

  if (role === 'Domain Head') {
    const myDomains = await Domain.find({ head: userId, collegeId });
    const domainIds = myDomains.map(d => d._id);
    if (domainIds.length > 0) {
      orConditions.push({ scope: 'Domain', domain: { $in: domainIds } });
    }
  } else if (role === 'Volunteer' || role === 'Associate Head') {
    // This part of the logic is a bit unclear without knowing the user schema for domain assignments.
    // Assuming a user is part of a domain, this would need to be adjusted.
    // For now, let's assume they can see all domain announcements for their college.
    orConditions.push({ scope: 'Domain' });
  }

  if (orConditions.length > 0) {
    query.$or = orConditions;
  }

  const announcements = await Announcement.find(query)
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name role')
    .populate('domain', 'name');

  res.json(announcements);
});

// @desc    Mark announcement as read
// @route   PUT /announcements/:id/read
export const markAnnouncementRead = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  
  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }

  // Check if user already marked as read
  const alreadyRead = announcement.readBy.some(
    r => r.userId.toString() === req.user._id.toString()
  );

  if (!alreadyRead) {
    announcement.readBy.push({
      userId: req.user._id,
      readAt: new Date()
    });
    await announcement.save();
  }

  res.json({
    message: 'Announcement marked as read',
    announcement
  });
});

// @desc    Get read count for an announcement
// @route   GET /announcements/:id/stats
export const getAnnouncementStats = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  
  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }

  // Only creator can see stats
  if (announcement.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the creator can view stats');
  }

  res.json({
    readCount: announcement.readBy.length,
    totalAnnouncement: announcement
  });
});

// @desc    Delete announcement (Creator only)
// @route   DELETE /announcements/:id
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  
  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }

  if (announcement.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only delete your own announcements');
  }

  await announcement.deleteOne();
  res.json({ message: 'Announcement deleted' });
});
