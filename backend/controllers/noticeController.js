import asyncHandler from 'express-async-handler';
import Notice from '../models/Notice.js';
import User from '../models/User.js'; // Imported to calculate read percentages

// @desc    Create a notice
// @route   POST /api/notices
// @access  Private (Secretary/Domain Head only)
export const createNotice = asyncHandler(async (req, res) => {
  const { title, content, visibility, domainId, ngoId, attachments, expiresAt } = req.body;
  const userId = req.user.id;
  const collegeId = req.user.collegeId;

  const notice = await Notice.create({
    title,
    content,
    createdBy: userId,
    visibility, // 'public', 'domain', 'ngo', 'leadership'
    domainId: visibility === 'domain' ? domainId : null,
    ngoId: visibility === 'ngo' ? ngoId : null,
    attachments: attachments || [],
    expiresAt,
    collegeId, // Enforce College Isolation
    isPinned: false,
    totalViews: 0,
  });

  // TODO: Trigger Push Notification (Senior Dev Note: Integrate with FCM/Socket.io here)
  // sendNotificationToTopic(collegeId, `New Notice: ${title}`);

  res.status(201).json({
    success: true,
    message: 'Notice created successfully',
    data: notice,
  });
});

// @desc    Get all notices (Smart Filtering)
// @route   GET /api/notices
// @access  Public
export const getNotices = asyncHandler(async (req, res) => {
  const { limit = 20, skip = 0 } = req.query;
  const user = req.user;

  const filters = { 
    collegeId: user.collegeId 
  };

  // Logic: Users see Public notices + Notices specific to their role/domain
  if (user.role === 'Volunteer') {
    filters.$or = [
      { visibility: 'public' },
      { visibility: 'domain', domainId: user.domainId },
      { visibility: 'ngo', ngoId: user.ngoId }
    ];
  } 
  // Domain Heads / Secretaries see everything or can filter explicitly via query params in future

  const notices = await Notice.find(filters)
    .populate('createdBy', 'name profileImage role')
    .sort({ isPinned: -1, createdAt: -1 }) // Pinned first, then new
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .lean();

  const total = await Notice.countDocuments(filters);

  // Add "isRead" flag for UI
  const noticesWithReadStatus = notices.map(n => ({
    ...n,
    isRead: n.readBy?.some(r => r.userId.toString() === user.id) || false,
    readBy: undefined // Don't send full read list to list view for performance
  }));

  res.status(200).json({
    success: true,
    count: noticesWithReadStatus.length,
    total,
    hasMore: parseInt(skip) + parseInt(limit) < total,
    data: noticesWithReadStatus,
  });
});

// @desc    Get single notice & Mark Read
// @route   GET /api/notices/:id
// @access  Public
export const getNoticeById = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const notice = await Notice.findOne({ _id: id, collegeId: req.user.collegeId })
    .populate('createdBy', 'name profileImage role');

  if (!notice) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  // Auto-mark as read on open
  const hasRead = notice.readBy.some((read) => read.userId.toString() === userId);

  if (userId && !hasRead) {
    notice.readBy.push({ userId, readAt: new Date() });
    notice.totalViews += 1;
    await notice.save();
  }

  res.status(200).json({
    success: true,
    data: notice,
  });
});

// @desc    Manually mark notice as read
// @route   PUT /api/notices/:id/read
// @access  Private
export const markNoticeAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const notice = await Notice.findOne({ _id: id, collegeId: req.user.collegeId });

  if (!notice) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  const alreadyRead = notice.readBy.some((read) => read.userId.toString() === userId);

  if (!alreadyRead) {
    notice.readBy.push({ userId, readAt: new Date() });
    notice.totalViews += 1;
    await notice.save();
  }

  res.status(200).json({
    success: true,
    message: 'Notice marked as read',
    readCount: notice.readBy.length,
  });
});

// @desc    Get read receipt status (Analytics)
// @route   GET /api/notices/:id/read-status
// @access  Private (Admin/Secretary)
export const getReadStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const collegeId = req.user.collegeId;

  const notice = await Notice.findOne({ _id: id, collegeId })
    .populate('readBy.userId', 'name profileImage email role')
    .lean();

  if (!notice) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  // Calculate Total Target Audience for Percentage
  let totalTargetUsers = 0;
  
  if (notice.visibility === 'public') {
    totalTargetUsers = await User.countDocuments({ collegeId });
  } else if (notice.visibility === 'domain') {
    totalTargetUsers = await User.countDocuments({ collegeId, domainId: notice.domainId });
  } else if (notice.visibility === 'ngo') {
    totalTargetUsers = await User.countDocuments({ collegeId, ngoId: notice.ngoId });
  }

  const readCount = notice.readBy.length;
  const percentage = totalTargetUsers > 0 ? ((readCount / totalTargetUsers) * 100).toFixed(1) : 0;

  res.status(200).json({
    success: true,
    data: {
      noticeId: id,
      title: notice.title,
      readCount,
      totalTargetUsers,
      readPercentage: `${percentage}%`,
      readBy: notice.readBy, // List of who read it
    },
  });
});

// @desc    Pin/Unpin notice
// @route   PUT /api/notices/:id/pin
// @access  Private (Secretary only)
export const pinNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notice = await Notice.findOne({ _id: id, collegeId: req.user.collegeId });

  if (!notice) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  // Only Secretary/Admin can pin
  if (req.user.role !== 'Secretary' && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Not authorized to pin notices' });
  }

  notice.isPinned = !notice.isPinned;
  await notice.save();

  res.status(200).json({
    success: true,
    message: notice.isPinned ? 'Notice pinned' : 'Notice unpinned',
    data: notice,
  });
});

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private (Creator/Secretary only)
export const deleteNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notice = await Notice.findOne({ _id: id, collegeId: req.user.collegeId });

  if (!notice) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  if (notice.createdBy.toString() !== req.user.id && req.user.role !== 'Secretary') {
    return res.status(403).json({ message: 'Not authorized to delete this notice' });
  }

  await Notice.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Notice deleted successfully',
  });
});