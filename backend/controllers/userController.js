import User from '../models/User.js';
import Task from '../models/Task.js';
import cloudinary from '../config/cloudinary.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';

const isAuthorized = (user) => {
  const allowed = ['secretary', 'admin', 'administrator', 'domain head'];
  return user && allowed.includes((user.role || '').toLowerCase());
};

// @desc    Update Profile Photo (Fixed URL / Overwrite Feature)
// @route   PUT /users/profile-photo
export const updateProfilePhoto = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  let imageToUpload;
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
    // 2. Upload with Overwrite and Cache Invalidation
    const result = await cloudinary.uploader.upload(imageToUpload, {
      folder: 'vms-profiles',
      resource_type: 'auto',
      public_id: `user_${user._id}`, // Fixed ID: always uses the same name
      overwrite: true,               // Replaces the existing file
      unique_filename: false,        // Prevents adding random characters
      invalidate: true,              // Clears Cloudinary CDN cache for this URL
      transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face", quality: "auto" }]
    });

    if (!result || !result.secure_url) {
      throw new Error("Cloudinary did not return a valid URL");
    }

    // 3. Force Browser Refresh with Timestamp
    // Even if URL is the same, adding ?v=... tells the browser it's a new version
    const versionedUrl = `${result.secure_url}?v=${new Date().getTime()}`;

    user.profileImage = versionedUrl;
    const savedUser = await user.save();

    res.status(200).json({
      message: 'Profile photo updated and overwritten successfully',
      profileImage: savedUser.profileImage,
      cloudinaryId: result.public_id
    });
  } catch (error) {
    console.error(`[Upload Error] ${error.message}`);
    res.status(500);
    throw new Error(`Image upload failed: ${error.message}`);
  }
});

// @desc    Update user profile (Self) - Logic to PROTECT the image URL
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
    
    // Safety guard: Standard profile updates cannot wipe out the image URL
    console.log(`[ProfileUpdate] Text update for ${user.email}. Image remains locked.`);

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

// --- REMAINING FUNCTIONS (XP, Stats, Admin Actions) ---

export const assignCollege = asyncHandler(async (req, res) => {
  const { collegeId } = req.body;
  if (!collegeId) { res.status(400); throw new Error('collegeId is required'); }
  const user = await User.findByIdAndUpdate(req.user._id, { collegeId }, { new: true });
  res.json({ message: 'College assigned', user });
});

export const getLeaderboard = asyncHandler(async (req, res) => {
  const collegeId = req.user?.collegeId;
  const query = { role: 'Volunteer' };
  if (collegeId) query.collegeId = collegeId;
  const leaders = await User.find(query).sort({ 'gamification.xpPoints': -1 }).select('name gamification branch year profileImage').limit(10);
  res.status(200).json(leaders || []);
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (!req.user.isSuperAdmin && user.collegeId && req.user.collegeId && user.collegeId.toString() !== req.user.collegeId.toString()) {
    res.status(403); throw new Error('Forbidden');
  }
  const completedTasks = await Task.find({ assignedUsers: user._id, status: 'Verified' }).select('title xpReward updatedAt');
  res.status(200).json({ profile: user, history: { tasks: completedTasks } });
});

export const subscribePush = asyncHandler(async (req, res) => {
  const subscription = req.body;
  await User.findByIdAndUpdate(req.user._id, { pushSubscription: subscription });
  res.status(200).json({ message: 'Push subscription saved' });
});

export const getXPHistory = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const realTasks = await Task.find({ assignedUsers: userId, status: 'Verified' }).sort({ updatedAt: -1 }).limit(15).select('title xpReward updatedAt');
  const history = realTasks.map(t => ({ source: 'Task Verified', details: t.title, points: t.xpReward, timestamp: t.updatedAt }));
  res.status(200).json(history);
});

export const verifyUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name role profileImage branch year gamification isApproved');
  if (!user) { res.status(404); throw new Error('Volunteer not found'); }
  res.json(user);
});

export const getAllUsers = asyncHandler(async (req, res) => {
  if (!isAuthorized(req.user)) { res.status(403); throw new Error('Forbidden'); }
  const { search, role, bloodGroup } = req.query;
  const filter = {};
  if (!req.user.isSuperAdmin && req.user.collegeId) filter.collegeId = req.user.collegeId;
  if (role && role !== 'all') filter.role = role;
  if (bloodGroup && bloodGroup !== 'all') filter.bloodGroup = bloodGroup;
  if (search) {
    const regex = new RegExp(search.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: regex }, { email: regex }, { rollNumber: regex }];
  }
  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

export const updateUserBloodGroup = asyncHandler(async (req, res) => {
  if (!isAuthorized(req.user)) { res.status(403); throw new Error('Forbidden'); }
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  user.bloodGroup = req.body.bloodGroup;
  await user.save();
  res.json({ message: 'Blood group updated', user });
});

export const approveUser = asyncHandler(async (req, res) => {
  if (!isAuthorized(req.user)) { res.status(403); throw new Error('Forbidden'); }
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  user.isApproved = true;
  await user.save();
  res.json({ message: 'User approved', user });
});

export const rejectUser = asyncHandler(async (req, res) => {
  if (!isAuthorized(req.user)) { res.status(403); throw new Error('Forbidden'); }
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  user.isApproved = false;
  await user.save();
  res.json({ message: 'User rejected', user });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  if (!isAuthorized(req.user)) { res.status(403); throw new Error('Forbidden'); }
  const user = await User.findById(req.params.id);
  user.role = req.body.role;
  await user.save();
  res.json({ message: 'Role updated', user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (!isAuthorized(req.user)) { res.status(403); throw new Error('Forbidden'); }
  const user = await User.findById(req.params.id);
  if (user) { 
    if (user.isSuperAdmin) throw new Error('Cannot delete Super Admin');
    await user.deleteOne(); res.json({ message: 'User removed' });
  }
});

export const getBloodGroupStats = asyncHandler(async (req, res) => {
  const matchStage = { bloodGroup: { $exists: true, $ne: null } };
  if (!req.user.isSuperAdmin && req.user.collegeId) matchStage.collegeId = req.user.collegeId;
  const stats = await User.aggregate([{ $match: matchStage }, { $group: { _id: "$bloodGroup", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
  res.json(stats);
});

export const updateUser = asyncHandler(async (req, res) => {
  if (!isAuthorized(req.user)) { res.status(403); throw new Error('Forbidden'); }
  const user = await User.findById(req.params.id);
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;
  const updatedUser = await user.save();
  res.json({ message: 'User updated', user: updatedUser });
});