import asyncHandler from 'express-async-handler';
import College from '../models/College.js';

// @desc Create a new college (used in onboarding)
// @route POST /api/colleges
// @access Public (used by Secretary during signup)
export const createCollege = asyncHandler(async (req, res) => {
  const { name, slug, logoUrl, primaryColor } = req.body;
  if (!name || !slug) {
    res.status(400);
    throw new Error('name and slug are required');
  }

  const exists = await College.findOne({ slug });
  if (exists) {
    res.status(400);
    throw new Error('A college with this slug already exists');
  }

  const college = await College.create({ name, slug, logoUrl, primaryColor });
  res.status(201).json(college);
});

// @desc Get college by slug
// @route GET /api/colleges/:slug
// @access Public
export const getCollegeBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const college = await College.findOne({ slug }).lean();
  if (!college) {
    res.status(404);
    throw new Error('College not found');
  }
  res.json(college);
});

// @desc Get all colleges (public)
// @route GET /colleges
export const getAllColleges = asyncHandler(async (req, res) => {
  const colleges = await College.find({}).select('name slug logoUrl primaryColor').sort({ name: 1 }).lean();
  res.json(colleges || []);
});

export default { createCollege, getCollegeBySlug, getAllColleges };
