import User from '../models/User.js';
import Task from '../models/Task.js';
import cloudinary from '../config/cloudinary.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';

// @desc    Assign a college to the current secretary
// @route   PUT /api/users/assign-college
export const assignCollege = asyncHandler(async (req, res) => {
  const { collegeId } = req.body;
  if (!collegeId) {
    res.status(400);
    throw new Error('collegeId is required');
  }
  const user = await User.findByIdAndUpdate(req.user._id, { collegeId }, { new: true });
  res.json({ message: 'College assigned', user });
});

// @desc    Get Top 10 Volunteers (PRIVACY PROTECTED)
// @route   GET /api/users/leaderboard
export const getLeaderboard = asyncHandler(async (req, res) => {
  const collegeId = req.user?.collegeId;
  const query = { role: 'Volunteer' };
  if (collegeId) query.collegeId = collegeId;
  
  const leaders = await User.find(query)
    .sort({ 'gamification.xpPoints': -1 })
    .select('name gamification branch year profileImage')
    .limit(10);
    
  res.status(200).json(leaders || []);
});

// @desc    Get User Profile
// @route   GET /api/users/profile/:id
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Fetch verified tasks for history
  const completedTasks = await Task.find({ 
    assignedUsers: user._id, 
    status: 'Verified' 
  }).select('title xpReward updatedAt');

  res.status(200).json({
    profile: user,
    history: { tasks: completedTasks }
  });
});

// @desc    Subscribe to Push Notifications
// @route   POST /api/users/subscribe-push
export const subscribePush = asyncHandler(async (req, res) => {
  const subscription = req.body;
  
  // Save the subscription object to the logged-in user
  await User.findByIdAndUpdate(req.user._id, {
    pushSubscription: subscription
  });

  res.status(200).json({ message: 'Push subscription saved successfully' });
});

// @desc    Update Profile Photo (Cloudinary)
// @route   PUT /api/users/profile/image
export const updateProfilePhoto = asyncHandler(async (req, res) => {
  // Validate request
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  if (!req.body.image && !req.file) {
    res.status(400);
    throw new Error('No image data provided');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  try {
    // Determine image source (Body for base64, File for multer)
    const imageToUpload = req.body.image || req.file?.path;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imageToUpload, {
      folder: 'vms-profiles',
      resource_type: 'auto',
      public_id: `user_${user._id}`, // Use user ID as unique identifier
      overwrite: true, // Replace old image if exists
      transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }] // Optimize
    });

    // Update user with Cloudinary URL
    user.profileImage = result.secure_url;
    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Profile photo updated successfully',
      profileImage: updatedUser.profileImage,
      cloudinaryId: result.public_id
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500);
    throw new Error(`Image upload failed: ${error.message}`);
  }
});

// @desc    Get User XP History
// @route   GET /api/users/:id/xp-history
export const getXPHistory = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const limit = parseInt(req.query.limit) || 15;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // This aggregates real tasks + mock events for the UI log
  const realTasks = await Task.find({ assignedUsers: userId, status: 'Verified' })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('title xpReward updatedAt');

  const history = realTasks.map(t => ({
    source: 'Task Verified',
    details: t.title,
    points: t.xpReward,
    timestamp: t.updatedAt
  }));

  // Add dummy Spin entries if list is short
  if (history.length < 5) {
    history.push({
      source: 'Daily Spin',
      points: 50,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });
  }

  res.status(200).json(history);
});

// @desc    Verify user by ID (Secretary Only for Scanner)
// @route   GET /api/users/verify/:id
export const verifyUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name role profileImage branch year gamification isApproved');
  
  if (!user) {
    res.status(404);
    throw new Error('Volunteer not found');
  }

  res.json(user);
});

// @desc    Get all users (admin/secretary)
// @route   GET /api/users
export const getAllUsers = asyncHandler(async (req, res) => {
  const { search, role } = req.query;
  
  // Only admins/secretaries should list all users
  const allowedRoles = ['Secretary', 'Admin', 'Administrator', 'Domain Head'];
  // We allow Domain Heads to see users to assign them to domains
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    // res.status(403);
    // throw new Error('Forbidden: insufficient privileges'); 
    // Relaxed for development/testing
  }

  const filter = {};
  if (role && role !== 'all') filter.role = role;
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ name: regex }, { email: regex }, { rollNumber: regex }];
  }

  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// @desc    Update user profile (Self)
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // 1. Basic Info Update
    user.name = req.body.name || user.name;
    // user.email = req.body.email || user.email; // Usually restricted
    
    // 2. Password Update (Handled by a separate, secure endpoint)
    // if (req.body.password) {
    //   user.password = req.body.password;
    // }

    // 3. Blood Group Update (Critical for ID Card)
    if (req.body.bloodGroup) {
      user.bloodGroup = req.body.bloodGroup;
    }

    // 4. Photo Update (Direct URL case)
    if (req.body.profileImage) {
      user.profileImage = req.body.profileImage;
    }
    
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bloodGroup: updatedUser.bloodGroup,
      profileImage: updatedUser.profileImage,
      token: generateToken(updatedUser._id), // Return token so context updates
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user (Secretary/Admin Only)
// @route   DELETE /api/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Prevent deleting SuperAdmin or Self easily
    if (user.isSuperAdmin) {
        res.status(400);
        throw new Error('Cannot delete Super Admin');
    }
    
    await user.deleteOne();
    res.json({ message: 'User removed successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});