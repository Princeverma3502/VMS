import asyncHandler from 'express-async-handler';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';

// @desc    Create activity log entry
// @route   POST /activity
// @access  Private
export const createActivity = asyncHandler(async (req, res) => {
  const { type, title, description, relatedEntity, metadata, visibility } = req.body;
  const userId = req.user.id;

  const activity = await ActivityLog.create({
    userId,
    type,
    title,
    description,
    relatedEntity,
    metadata,
    visibility: visibility || 'public',
  });

  const populatedActivity = await activity.populate('userId', 'name profileImage');

  res.status(201).json({
    success: true,
    message: 'Activity logged successfully',
    data: populatedActivity,
  });
});

// @desc    Get activity feed
// @route   GET /activity/feed
// @access  Public
export const getActivityFeed = asyncHandler(async (req, res) => {
  const { limit = 20, skip = 0, type, userId } = req.query;

  const filters = { visibility: 'public' };

  if (type) filters.type = type;
  if (userId) filters.userId = userId;

  const activities = await ActivityLog.find(filters)
    .populate('userId', 'name profileImage gamification')
    .populate('likes', 'name')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .lean();

  const total = await ActivityLog.countDocuments(filters);

  res.status(200).json({
    success: true,
    count: activities.length,
    total,
    hasMore: parseInt(skip) + parseInt(limit) < total,
    data: activities,
  });
});

// @desc    Get user's activity
// @route   GET /activity/user/:userId
// @access  Public
export const getUserActivity = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 10, skip = 0 } = req.query;

  const activities = await ActivityLog.find({ userId, visibility: 'public' })
    .populate('userId', 'name profileImage gamification')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .lean();

  res.status(200).json({
    success: true,
    count: activities.length,
    data: activities,
  });
});

// @desc    Like an activity
// @route   PUT /activity/:activityId/like
// @access  Private
export const likeActivity = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { activityId } = req.params;

  const activity = await ActivityLog.findById(activityId);

  if (!activity) {
    return res.status(404).json({ message: 'Activity not found' });
  }

  const alreadyLiked = activity.likes.includes(userId);

  if (alreadyLiked) {
    activity.likes = activity.likes.filter((id) => id.toString() !== userId);
  } else {
    activity.likes.push(userId);
  }

  await activity.save();

  res.status(200).json({
    success: true,
    message: alreadyLiked ? 'Like removed' : 'Activity liked',
    data: activity,
  });
});

// @desc    Comment on activity
// @route   PUT /activity/:activityId/comment
// @access  Private
export const commentOnActivity = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const userId = req.user.id;
  const { activityId } = req.params;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  const activity = await ActivityLog.findById(activityId);

  if (!activity) {
    return res.status(404).json({ message: 'Activity not found' });
  }

  activity.comments.push({
    userId,
    text,
    createdAt: new Date(),
  });

  await activity.save();

  const updatedActivity = await ActivityLog.findById(activityId)
    .populate('comments.userId', 'name profileImage');

  res.status(200).json({
    success: true,
    message: 'Comment added successfully',
    data: updatedActivity,
  });
});

// @desc    Get trending activities
// @route   GET /activity/trending
// @access  Public
export const getTrendingActivities = asyncHandler(async (req, res) => {
  const days = req.query.days || 7;
  const dateFilter = new Date();
  dateFilter.setDate(dateFilter.getDate() - days);

  const activities = await ActivityLog.aggregate([
    {
      $match: {
        visibility: 'public',
        createdAt: { $gte: dateFilter },
      },
    },
    {
      $addFields: {
        engagementScore: {
          $add: [{ $size: '$likes' }, { $multiply: [{ $size: '$comments' }, 2] }],
        },
      },
    },
    {
      $sort: { engagementScore: -1 },
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userInfo',
      },
    },
  ]);

  res.status(200).json({
    success: true,
    count: activities.length,
    data: activities,
  });
});
