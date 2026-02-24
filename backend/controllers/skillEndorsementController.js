import asyncHandler from 'express-async-handler';
import SkillEndorsement from '../models/SkillEndorsement.js';
import User from '../models/User.js';

// @desc    Request skill endorsement
// @route   POST /skill-endorsements
// @access  Private
export const requestEndorsement = asyncHandler(async (req, res) => {
  const { skillName, endorsementNote, eventId } = req.body;
  const endorsedUserId = req.user._id;

  if (!skillName || !endorsementNote) {
    res.status(400);
    throw new Error('Skill name and endorsement note are required');
  }

  const endorsement = new SkillEndorsement({
    collegeId: req.user.collegeId,
    endorsedUserId,
    endorsedByUserId: req.user._id, // Self-endorsement request, to be approved by admin
    skillName,
    endorsementNote,
    eventId,
    visibility: 'college',
    isVerified: false // Needs admin approval
  });

  const createdEndorsement = await endorsement.save();
  await createdEndorsement.populate(['endorsedUserId', 'endorsedByUserId'], 'name');

  res.status(201).json(createdEndorsement);
});

// @desc    Get pending endorsements for approval
// @route   GET /skill-endorsements/pending
// @access  Private (Secretary/Admin)
export const getPendingEndorsements = asyncHandler(async (req, res) => {
  const endorsements = await SkillEndorsement.find({ isVerified: false })
    .populate('endorsedUserId', 'name email profileImage')
    .populate('endorsedByUserId', 'name')
    .sort({ createdAt: -1 });

  res.json(endorsements);
});

// @desc    Approve endorsement
// @route   PUT /skill-endorsements/:id/approve
// @access  Private (Secretary/Admin)
export const approveEndorsement = asyncHandler(async (req, res) => {
  const endorsement = await SkillEndorsement.findById(req.params.id);

  if (!endorsement) {
    res.status(404);
    throw new Error('Endorsement not found');
  }

  endorsement.isVerified = true;
  await endorsement.save();

  // Add skill to user's endorsed skills if not already present
  const user = await User.findById(endorsement.endorsedUserId);
  if (user) {
    user.endorsedSkills = user.endorsedSkills || [];
    if (!user.endorsedSkills.includes(endorsement.skillName)) {
      user.endorsedSkills.push(endorsement.skillName);
      await user.save();
    }
  }

  await endorsement.populate(['endorsedUserId', 'endorsedByUserId'], 'name');
  res.json(endorsement);
});

// @desc    Reject endorsement
// @route   DELETE /skill-endorsements/:id
// @access  Private (Secretary/Admin)
export const rejectEndorsement = asyncHandler(async (req, res) => {
  const endorsement = await SkillEndorsement.findById(req.params.id);

  if (!endorsement) {
    res.status(404);
    throw new Error('Endorsement not found');
  }

  await endorsement.deleteOne();
  res.json({ message: 'Endorsement rejected and removed' });
});

// @desc    Get user's endorsed skills
// @route   GET /skill-endorsements/user/:userId
// @access  Private
export const getUserEndorsements = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  const endorsements = await SkillEndorsement.find({
    endorsedUserId: userId,
    isVerified: true
  }).populate('endorsedByUserId', 'name');

  res.json(endorsements);
});

// @desc    Get all skill categories
// @route   GET /skill-endorsements/categories
// @access  Public
export const getSkillCategories = asyncHandler(async (req, res) => {
  // Using the enum from the model
  const categories = [
    'Public Speaking',
    'Leadership',
    'Problem Solving',
    'Teamwork',
    'Logistics',
    'Event Management',
    'Communication',
    'Critical Thinking',
    'Empathy',
    'Technical Skills',
    'Data Analysis',
    'Project Management'
  ];

  res.json({ categories });
});