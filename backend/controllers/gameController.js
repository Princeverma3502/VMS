import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Award XP for various actions
// @route   POST /game/award-xp
// @access  Private (Admin/Backend only)
export const awardXP = asyncHandler(async (req, res) => {
  const { userId, action, customXP } = req.body;

  let xpAmount = customXP || 0;

  // Define XP rewards for different actions
  const xpRewards = {
    'task_completed': 25,
    'event_attended': 50,
    'announcement_read': 5,
    'profile_updated': 10,
    'skill_endorsed': 30,
    'meeting_attended': 20,
    'poll_voted': 5,
    'discussion_posted': 15
  };

  if (!xpAmount && xpRewards[action]) {
    xpAmount = xpRewards[action];
  }

  if (!xpAmount) {
    res.status(400);
    throw new Error('Invalid action or XP amount');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $inc: {
        'gamification.xpPoints': xpAmount,
        'gamification.lifetimeXP': xpAmount
      }
    },
    { new: true }
  );

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check for level up
  const newLevel = Math.floor(user.gamification.xpPoints / 100) + 1;
  if (newLevel > user.gamification.level) {
    user.gamification.level = newLevel;
    await user.save();
  }

  res.json({
    message: `Awarded ${xpAmount} XP for ${action}`,
    totalXP: user.gamification.xpPoints,
    level: user.gamification.level
  });
});

// @desc    Get leaderboard
// @route   GET /game/leaderboard
// @access  Private
export const getLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 10, collegeId } = req.query;

  const query = { role: 'Volunteer' };
  if (collegeId) query.collegeId = collegeId;

  const leaderboard = await User.find(query)
    .select('name gamification.xpPoints gamification.level profileImage')
    .sort({ 'gamification.xpPoints': -1 })
    .limit(parseInt(limit));

  res.json(leaderboard);
});

// @desc    Get user gamification stats
// @route   GET /game/stats/:userId
// @access  Private
export const getUserStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId)
    .select('gamification name');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const stats = {
    ...user.gamification,
    nextLevelXP: (user.gamification.level) * 100,
    xpToNextLevel: (user.gamification.level) * 100 - user.gamification.xpPoints
  };

  res.json(stats);
});

// @desc    Award badge
// @route   POST /game/badge
// @access  Private (Admin only)
export const awardBadge = asyncHandler(async (req, res) => {
  const { userId, badgeName, iconUrl } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if badge already exists
  const existingBadge = user.gamification.badges.find(badge => badge.name === badgeName);
  if (existingBadge) {
    res.status(400);
    throw new Error('Badge already awarded');
  }

  user.gamification.badges.push({
    name: badgeName,
    iconUrl: iconUrl || '',
    earnedAt: new Date()
  });

  await user.save();

  res.json({
    message: `Badge "${badgeName}" awarded to ${user.name}`,
    badge: user.gamification.badges[user.gamification.badges.length - 1]
  });
});

// @desc    Spin the Wheel (Daily Reward)
// @route   POST /game/spin
export const spinWheel = async (req, res) => {
  try {
    // Logic: Randomly determine XP reward
    const rewards = [10, 20, 50, 100];
    const randomXP = rewards[Math.floor(Math.random() * rewards.length)];

    // Update User
    const user = await User.findByIdAndUpdate(
      req.user._id, 
      { $inc: { 'gamification.xpPoints': randomXP } },
      { new: true }
    );

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      message: `You won ${randomXP} XP!`,
      xpAwarded: randomXP,
      totalXP: user.gamification?.xpPoints || 0,
      gamification: user.gamification || {}
    });
  } catch (error) {
    console.error("Spin Error:", error.message);
    res.status(error.statusCode || 500).json({ message: error.message || "Spin failed" });
  }
};

// @desc    Submit Trivia Answer
// @route   POST /game/trivia
export const submitTrivia = async (req, res) => {
  try {
    const { isCorrect } = req.body;

    if (isCorrect) {
      const reward = 20;
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { 'gamification.xpPoints': reward } },
        { new: true }
      );

      if (!user) {
        res.status(404);
        throw new Error('User not found');
      }

      res.status(200).json({
        success: true,
        message: 'Correct Answer!',
        xpAwarded: reward,
        totalXP: user.gamification?.xpPoints || 0
      });
    } else {
      res.status(200).json({
        success: false,
        message: 'Wrong Answer. Better luck next time!'
      });
    }
  } catch (error) {
    console.error("Trivia Error:", error.message);
    res.status(error.statusCode || 500).json({ message: error.message || "Trivia failed" });
  }
};