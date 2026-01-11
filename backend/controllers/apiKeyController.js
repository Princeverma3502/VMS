import APIKey from '../models/APIKey.js';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';

// @desc Generate a new API Key
// @route POST /api/keys
export const generateKey = asyncHandler(async (req, res) => {
  const collegeId = req.user.collegeId;
  
  // 1. Generate secure random key
  const rawKey = crypto.randomBytes(32).toString('hex');
  const prefix = 'vms_live_';
  const apiKeyString = `${prefix}${rawKey}`;

  // 2. Hash it for storage (Security Best Practice)
  const hashedKey = crypto.createHash('sha256').update(apiKeyString).digest('hex');

  // 3. Save to DB
  const newKey = await APIKey.create({
    collegeId,
    keyHash: hashedKey,
    preview: `${prefix}...${rawKey.slice(-4)}`,
    createdBy: req.user._id,
    permissions: ['read:volunteers', 'read:events']
  });

  // 4. Return the raw key ONLY ONCE
  res.status(201).json({
    message: 'Success! Copy this key now. You cannot see it again.',
    apiKey: apiKeyString,
    keyId: newKey._id
  });
});

// @desc Get active keys
export const getKeys = asyncHandler(async (req, res) => {
  const keys = await APIKey.find({ collegeId: req.user.collegeId }).sort({ createdAt: -1 });
  res.json(keys);
});

// @desc Revoke a key
export const revokeKey = asyncHandler(async (req, res) => {
  await APIKey.findOneAndDelete({ _id: req.params.id, collegeId: req.user.collegeId });
  res.json({ message: 'API Key revoked successfully' });
});