import asyncHandler from 'express-async-handler';
import DiscussionPost from '../models/DiscussionPost.js';
import Event from '../models/Event.js';

// @desc    Get all posts for an event
// @route   GET /api/discussions/:eventId
// @access  Private
export const getPostsForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  // Optional: Check if user is even part of the event's college
  const event = await Event.findById(eventId);
  if (!event || event.collegeId.toString() !== req.user.collegeId.toString()) {
    res.status(404);
    throw new Error('Event not found or not in your college');
  }

  const posts = await DiscussionPost.find({ eventId })
    .populate('userId', 'name profileImage role')
    .sort({ createdAt: 'asc' });
  
  // Basic threading logic
  const postMap = {};
  const rootPosts = [];
  
  posts.forEach(post => {
    postMap[post._id] = post.toObject(); // use toObject to allow mutation
    postMap[post._id].replies = [];
  });

  posts.forEach(post => {
    if (post.parentId && postMap[post.parentId]) {
      postMap[post.parentId].replies.push(postMap[post._id]);
    } else {
      rootPosts.push(postMap[post._id]);
    }
  });

  res.json(rootPosts);
});

// @desc    Create a new post
// @route   POST /api/discussions/:eventId
// @access  Private
export const createPost = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { content, parentId } = req.body;

  if (!content) {
    res.status(400);
    throw new Error('Content is required');
  }
  
  // Optional: Check if event exists
  const eventExists = await Event.findById(eventId);
  if (!eventExists) {
    res.status(404);
    throw new Error('Event not found');
  }

  const post = await DiscussionPost.create({
    eventId,
    userId: req.user._id,
    content,
    parentId: parentId || null,
  });
  
  const populatedPost = await post.populate('userId', 'name profileImage role');

  res.status(201).json(populatedPost);
});

// @desc    Delete a post
// @route   DELETE /api/discussions/posts/:postId
// @access  Private (Author or Admin)
export const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await DiscussionPost.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Check if user is author or an admin
  const isAuthor = post.userId.toString() === req.user._id.toString();
  const isAdmin = ['Secretary', 'Admin', 'Administrator'].includes(req.user.role);

  if (!isAuthor && !isAdmin) {
    res.status(403);
    throw new Error('User not authorized to delete this post');
  }
  
  // Also delete replies
  await DiscussionPost.deleteMany({ parentId: postId });
  await post.deleteOne();

  res.json({ message: 'Post deleted successfully' });
});
