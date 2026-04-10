import User from '../models/User.js';
import Task from '../models/Task.js';
import cloudinary from '../config/cloudinary.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';

// --- HELPER FOR ROLE VALIDATION ---
const isAuthorized = (user) => {
  const allowed = ['secretary', 'admin', 'administrator', 'domain head'];
  return user && allowed.includes((user.role || '').toLowerCase());
};

// @desc    Assign a college to the current secretary
// @route   PUT /users/assign-college
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
// @route   GET /users/leaderboard
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
// @route   GET /users/profile/:id
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Multi-tenant check
  if (!req.user.isSuperAdmin && user.collegeId && req.user.collegeId && user.collegeId.toString() !== req.user.collegeId.toString()) {
    res.status(403);
    throw new Error('Forbidden: User does not belong to your college');
  }

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
// @route   POST /users/subscribe-push
export const subscribePush = asyncHandler(async (req, res) => {
  const subscription = req.body;
  await User.findByIdAndUpdate(req.user._id, { pushSubscription: subscription });
  res.status(200).json({ message: 'Push subscription saved' });
});

// @desc    Update Profile Photo (Cloudinary) - FIXED FOR BLANK IMAGES
// @route   PUT /users/profile-photo
export const updateProfilePhoto = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  let imageToUpload;

  // FIX: Robust handling for Buffer vs Base64
  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const mime = req.file.mimetype || "image/jpeg";
    imageToUpload = `data:${mime};base64,${b64}`;
  } else if (req.body.image) {
    imageToUpload = req.body.image;
  } else {
    res.status(400);
    throw new Error('No image file or data provided');
  }

  try {
    const result = await cloudinary.uploader.upload(imageToUpload, {
      folder: 'vms-profiles',
      resource_type: 'auto',
      public_id: `user_${user._id}`, 
      overwrite: true,
      transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face", quality: "auto" }]
    });

    user.profileImage = result.secure_url;
    await user.save();

    res.status(200).json({
      message: 'Profile photo updated successfully',
      profileImage: user.profileImage,
      cloudinaryId: result.public_id
    });
  } catch (error) {
    res.status(500);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
});

// @desc    Get User XP History
// @route   GET /users/:id/xp-history
export const getXPHistory = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const limit = parseInt(req.query.limit) || 15;

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

  if (history.length < 5) {
    history.push({
      source: 'Daily Spin',
      points: 50,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });
  }

  res.status(200).json(history);
});

// @desc    Verify user (Scanner)
export const verifyUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name role profileImage branch year gamification isApproved');
  if (!user) {
    res.status(404);
    throw new Error('Volunteer not found');
  }
  res.json(user);
});

// @desc    Get all users (admin/secretary)
export const getAllUsers = asyncHandler(async (req, res) => {
  if (!isAuthorized(req.user)) {
    res.status(403);
    throw new Error('Forbidden: insufficient privileges'); 
  }

  const { search, role, bloodGroup } = req.query;
  const filter = {};
  
  if (!req.user.isSuperAdmin && req.user.collegeId) {
    filter.collegeId = req.user.collegeId;
  }
  if (role && role !== 'all') filter.role = role;
  if (bloodGroup && bloodGroup !== 'all') filter.bloodGroup = bloodGroup;
  
  if (search) {
    const escapedSearch = search.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedSearch, 'i');
    filter.$or = [{ name: regex }, { email: regex }, { rollNumber: regex }];
  }

  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// @desc    Update a user's blood group
export const updateUserBloodGroup = asyncHandler(async (req, res) => {
  if (!isAuthorized(req.user)) {
    res.status(403);
    throw new Error('Forbidden: insufficient privileges');
  }
  const { bloodGroup } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.bloodGroup = bloodGroup;
  await user.save();
  res.json({ message: 'Blood group updated', user });
});

// @desc    Approve user registration
export const approveUser = asyncHandler(async (req, res) => {
  if (!isAuthorized(req.user)) {
    res.status(403);
    throw new Error('Forbidden: insufficient privileges');
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isApproved = true;
  await user.save();
  res.json({ message: 'User approved successfully', user });
});

// @desc    Reject user registration
export const rejectUser = asyncHandler(async (req, res) => {
  if (!isAuthorized(req.user)) {
    res.status(403);
    throw new Error('Forbidden: insufficient privileges');
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isApproved = false;
  await user.save();
  res.json({ message: 'User rejected', user });
});

// @desc    Update user role
export const updateUserRole = asyncHandler(async (req, res) => {
  if (!isAuthorized(req.user)) {
    res.status(403);
    throw new Error('Forbidden: insufficient privileges');
  }
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  const allowedRoles = ['Volunteer', 'Secretary', 'Domain Head', 'Associate Head'];
  if (!allowedRoles.includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }
  user.role = role;
  await user.save();
  res.json({ message: 'User role updated', user });
});

// @desc    Update user profile (Self)
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
    if (req.body.profileImage) user.profileImage = req.body.profileImage;
    
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bloodGroup: updatedUser.bloodGroup,
      profileImage: updatedUser.profileImage,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  if (!isAuthorized(req.user)) {
    res.status(403);
    throw new Error('Forbidden: insufficient privileges');
  }
  const user = await User.findById(req.params.id);
  if (user) {
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

// @desc    Get Blood Group Statistics
export const getBloodGroupStats = asyncHandler(async (req, res) => {
  const matchStage = { bloodGroup: { $exists: true, $ne: null } };
  if (!req.user.isSuperAdmin && req.user.collegeId) {
    matchStage.collegeId = req.user.collegeId;
  }
  const stats = await User.aggregate([
    { $match: matchStage },
    { $group: { _id: "$bloodGroup", count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  res.json(stats);
});

// @desc    Update a user administratively
export const updateUser = asyncHandler(async (req, res) => {
  if (!isAuthorized(req.user)) {
    res.status(403);
    throw new Error('Forbidden: insufficient privileges');
  }
  const { name, email, role, collegeId } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.name = name || user.name;
  user.email = email || user.email;
  user.role = role || user.role;
  if (req.user.isSuperAdmin && collegeId) user.collegeId = collegeId;

  const updatedUser = await user.save();
  res.json({ message: 'User updated', user: updatedUser });
});