import { validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// --- HELPER LOGIC: STREAK UPDATE ---
export const updateStreak = async (user) => {
  const now = new Date();
  const lastLogin = user.gamification?.lastLogin ? new Date(user.gamification.lastLogin) : null;

  if (!lastLogin) {
    user.gamification.streak = 1;
    user.gamification.lastLogin = now;
    await user.save();
    return user;
  }

  const diffInMs = now - lastLogin;
  const diffInHours = diffInMs / (1000 * 60 * 60);

  if (now.toDateString() === lastLogin.toDateString()) {
    return user;
  }

  // Logic: Next day login or missed days
  if (diffInHours >= 24 && diffInHours < 48) {
    user.gamification.streak += 1;
  } else if (diffInHours >= 48) {
    user.gamification.streak = 1;
  } else {
    // New calendar day, but less than 24h since last login
    user.gamification.streak += 1;
  }

  user.gamification.lastLogin = now;
  await user.save();
  return user;
};

// @desc    Register new user
// @route   POST /api/auth/register
export const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { name, email, password, whatsappNumber, branch, year, role, adminSecret, rollNumber } = req.body;
  const normalizedEmail = email.toLowerCase();

  // 1. Admin Secret Check
  if (role === 'Secretary' && adminSecret !== process.env.ADMIN_SECRET) {
    res.status(401);
    throw new Error('Invalid Admin Secret Key. Access Denied.');
  }

  // 2. Year vs Role validation
  if (role !== 'Secretary') {
    if (year === '1st' && role !== 'Volunteer') {
      res.status(400);
      throw new Error("1st Year students must be Volunteers.");
    }
    if (year === '2nd' && role !== 'Associate Head') {
      res.status(400);
      throw new Error("2nd Year students must be Associate Heads.");
    }
    if (year === '3rd' && role !== 'Domain Head') {
      res.status(400);
      throw new Error("3rd Year students must be Domain Heads.");
    }
  }

  // 3. Check duplicates
  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) {
    res.status(400);
    throw new Error('User with this Email already exists');
  }

  if (rollNumber) {
    const rollExists = await User.findOne({ rollNumber });
    if (rollExists) {
      res.status(400);
      throw new Error('User with this Roll Number already exists');
    }
  }

  // 4. Create User
  // NOTE: We do NOT hash password here. The User model's pre('save') hook handles it.
  const isAutoApproved = role === 'Secretary';

  const user = await User.create({
    name,
    email: normalizedEmail,
    password, // Plain text passed to model -> Model hashes it
    rollNumber: rollNumber || undefined,
    whatsappNumber,
    branch,
    year,
    role: role || 'Volunteer',
    isApproved: isAutoApproved,
    gamification: {
      streak: 1,
      lastLogin: new Date(),
      xpPoints: 0,
      level: 1,
      badges: []
    }
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber,
      role: user.role,
      token: isAutoApproved ? generateToken(user._id) : null,
      message: isAutoApproved ? "Account Created" : "Registration successful! Wait for Secretary approval."
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login User
// @route   POST /api/auth/login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  // Use the matchPassword method from the User model
  if (user && (await user.matchPassword(password))) {
    
    if (!user.isApproved) {
      res.status(403);
      throw new Error('Your account is pending approval from the Secretary.');
    }

    // Wrap streak update so gamification errors don't crash login
    try {
      await updateStreak(user);
    } catch (err) {
      console.error("Streak Update Error:", err.message);
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber,
      collegeId: user.collegeId,
      role: user.role,
      theme: user.theme,
      isSuperAdmin: user.isSuperAdmin,
      token: generateToken(user._id),
      gamification: user.gamification
    });
  } else {
    res.status(401);
    throw new Error('Invalid Email or Password');
  }
});

// @desc    Get Me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get Pending Users
export const getPendingUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isApproved: false }).select('-password');
  res.json(users);
});

// @desc    Approve User
export const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.isApproved = true;
    await user.save();
    res.json({ message: 'User approved successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Reset Password
export const resetUserPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Directly set password; Model pre-save hook will detect modification and hash it
  user.password = 'Welcome@123';
  await user.save();
  
  res.json({ message: 'Password reset successful' });
});

// @desc    Change user password (Self)
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide both old and new passwords.');
  }

  const user = await User.findById(req.user._id);

  if (user && (await user.matchPassword(oldPassword))) {
    // Check if new password is same as old
    if (oldPassword === newPassword) {
      res.status(400);
      throw new Error('New password cannot be the same as the old password.');
    }
    
    // The pre-save hook in the User model will handle hashing
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(401);
    throw new Error('Invalid old password.');
  }
});