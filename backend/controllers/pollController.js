import asyncHandler from 'express-async-handler';
import Poll from '../models/Poll.js';
import User from '../models/User.js';

// @desc    Create a new poll
// @route   POST /polls
// @access  Private (Secretary/Domain Head only)
export const createPoll = asyncHandler(async (req, res) => {
  const { title, description, options, expiresAt, domainId, visibility } = req.body;
  const userId = req.user.id;
  const collegeId = req.user.collegeId;

  // Validate options
  if (!options || options.length < 2) {
    return res.status(400).json({ message: 'Poll must have at least 2 options' });
  }

  const poll = await Poll.create({
    title,
    description,
    options: options.map((text) => ({ text, votes: [], voteCount: 0 })),
    expiresAt,
    createdBy: userId,
    collegeId, // Critical: Link poll to college
    domainId: visibility === 'domain' ? domainId : null,
    visibility, // 'public', 'domain', 'secretary'
    isActive: true,
    totalVotes: 0,
  });

  res.status(201).json({
    success: true,
    message: 'Poll created successfully',
    data: poll,
  });
});

// @desc    Get all active polls (Context-Aware)
// @route   GET /polls
// @access  Public
export const getPolls = asyncHandler(async (req, res) => {
  const { visibility } = req.query;
  const user = req.user;

  // Base Filter: Active, Not Expired, Same College
  const query = { 
    collegeId: user.collegeId,
    isActive: true, 
    expiresAt: { $gt: new Date() } 
  };

  // Contextual Filtering
  if (user.role === 'Volunteer') {
    // Volunteers see Public polls OR polls for their specific Domain
    query.$or = [
        { visibility: 'public' },
        { visibility: 'domain', domainId: user.domainId } // Assuming user has domainId
    ];
  } else if (visibility) {
    // Admins can filter by specific visibility
    query.visibility = visibility;
  }

  const polls = await Poll.find(query)
    .populate('createdBy', 'name profileImage')
    .sort({ createdAt: -1 })
    .lean();

  // Add a "hasVoted" flag for the current user
  const pollsWithUserStatus = polls.map(poll => {
    const hasVoted = poll.options.some(opt => 
      opt.votes.some(v => v.userId.toString() === user.id)
    );
    return { ...poll, hasVoted };
  });

  res.status(200).json({
    success: true,
    count: pollsWithUserStatus.length,
    data: pollsWithUserStatus,
  });
});

// @desc    Get single poll by ID
// @route   GET /polls/:id
// @access  Public
export const getPollById = asyncHandler(async (req, res) => {
  const poll = await Poll.findOne({ _id: req.params.id, collegeId: req.user.collegeId })
    .populate('createdBy', 'name profileImage')
    .populate('options.votes.userId', 'name profileImage');

  if (!poll) {
    return res.status(404).json({ message: 'Poll not found' });
  }

  res.status(200).json({
    success: true,
    data: poll,
  });
});

// @desc    Vote on a poll
// @route   PUT /polls/:pollId/vote
// @access  Private
export const voteOnPoll = asyncHandler(async (req, res) => {
  const { optionIndex } = req.body;
  const userId = req.user.id;
  const pollId = req.params.pollId;

  const poll = await Poll.findOne({ _id: pollId, collegeId: req.user.collegeId });
  
  if (!poll) {
    return res.status(404).json({ message: 'Poll not found' });
  }

  if (!poll.isActive || new Date() > poll.expiresAt) {
    poll.isActive = false;
    await poll.save();
    return res.status(400).json({ message: 'Poll has expired' });
  }

  // Check if option exists
  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    return res.status(400).json({ message: 'Invalid option selected' });
  }

  // Check if user already voted
  const hasVoted = poll.options.some((option) =>
    option.votes.some((vote) => vote.userId.toString() === userId)
  );

  if (hasVoted) {
    return res.status(400).json({ message: 'You have already voted on this poll' });
  }

  // Add vote
  poll.options[optionIndex].votes.push({ userId, votedAt: new Date() });
  poll.options[optionIndex].voteCount += 1;
  poll.totalVotes += 1;

  await poll.save();

  res.status(200).json({
    success: true,
    message: 'Vote recorded successfully',
    data: poll,
  });
});

// @desc    Get poll results
// @route   GET /polls/:pollId/results
// @access  Public
export const getPollResults = asyncHandler(async (req, res) => {
  const poll = await Poll.findOne({ _id: req.params.pollId, collegeId: req.user.collegeId }).lean();

  if (!poll) {
    return res.status(404).json({ message: 'Poll not found' });
  }

  const results = poll.options.map((option) => ({
    text: option.text,
    votes: option.voteCount,
    percentage: poll.totalVotes > 0 ? ((option.voteCount / poll.totalVotes) * 100).toFixed(1) : 0,
  }));

  res.status(200).json({
    success: true,
    totalVotes: poll.totalVotes,
    isActive: poll.isActive,
    expiresAt: poll.expiresAt,
    results,
  });
});

// @desc    Delete a poll
// @route   DELETE /polls/:id
// @access  Private (Creator/Admin only)
export const deletePoll = asyncHandler(async (req, res) => {
  const poll = await Poll.findById(req.params.id);

  if (!poll) {
    return res.status(404).json({ message: 'Poll not found' });
  }

  // Allow Creator OR Secretary to delete
  if (poll.createdBy.toString() !== req.user.id && req.user.role !== 'Secretary') {
    return res.status(403).json({ message: 'Not authorized to delete this poll' });
  }

  await Poll.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Poll deleted successfully',
  });
});