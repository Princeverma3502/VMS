import asyncHandler from 'express-async-handler';
import DemoCertificate from '../models/DemoCertificate.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Upload demo certificate
// @route   POST /demo-certificates
// @access  Private (Secretary only)
export const uploadDemoCertificate = asyncHandler(async (req, res) => {
  const { certificateName, year } = req.body;
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ message: 'Certificate file is required' });
  }

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'demo-certificates',
    resource_type: 'auto',
  });

  // Get user's college
  const user = await User.findById(userId).populate('collegeId');
  if (!user || !user.collegeId) {
    return res.status(400).json({ message: 'User college not found' });
  }

  const demoCertificate = await DemoCertificate.create({
    collegeId: user.collegeId._id,
    uploadedBy: userId,
    certificateName,
    certificateUrl: result.secure_url,
    year: parseInt(year),
  });

  res.status(201).json({
    success: true,
    message: 'Demo certificate uploaded successfully',
    data: demoCertificate,
  });
});

// @desc    Get demo certificates for college
// @route   GET /demo-certificates
// @access  Private (Secretary only)
export const getDemoCertificates = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId).populate('collegeId');
  if (!user || !user.collegeId) {
    return res.status(400).json({ message: 'User college not found' });
  }

  const certificates = await DemoCertificate.find({
    collegeId: user.collegeId._id,
    isActive: true,
  }).populate('uploadedBy', 'name').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: certificates,
  });
});

// @desc    Delete demo certificate
// @route   DELETE /demo-certificates/:id
// @access  Private (Secretary only)
export const deleteDemoCertificate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const user = await User.findById(userId).populate('collegeId');
  if (!user || !user.collegeId) {
    return res.status(400).json({ message: 'User college not found' });
  }

  const certificate = await DemoCertificate.findOne({
    _id: id,
    collegeId: user.collegeId._id,
  });

  if (!certificate) {
    return res.status(404).json({ message: 'Certificate not found' });
  }

  // Delete from Cloudinary
  const publicId = certificate.certificateUrl.split('/').pop().split('.')[0];
  await cloudinary.uploader.destroy(`demo-certificates/${publicId}`);

  await DemoCertificate.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Certificate deleted successfully',
  });
});

// @desc    Get available certificates for volunteers
// @route   GET /demo-certificates/available
// @access  Private (Volunteer only)
export const getAvailableCertificates = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId).populate('collegeId');
  if (!user || !user.collegeId) {
    return res.status(400).json({ message: 'User college not found' });
  }

  const certificates = await DemoCertificate.find({
    collegeId: user.collegeId._id,
    year: user.year,
    isActive: true,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: certificates,
  });
});

// @desc    Generate personalized certificate
// @route   POST /demo-certificates/:id/generate
// @access  Private (Volunteer only)
export const generatePersonalizedCertificate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const user = await User.findById(userId).populate('collegeId');
  if (!user || !user.collegeId) {
    return res.status(400).json({ message: 'User college not found' });
  }

  const certificate = await DemoCertificate.findOne({
    _id: id,
    collegeId: user.collegeId._id,
    year: user.year,
    isActive: true,
  });

  if (!certificate) {
    return res.status(404).json({ message: 'Certificate not found or not available for your year' });
  }

  // For now, we'll return the original certificate URL
  // In a real implementation, you would generate a personalized PDF with the volunteer's name
  // This could be done using libraries like pdf-lib to modify the PDF

  // Increment download count
  certificate.downloadCount += 1;
  await certificate.save();

  res.status(200).json({
    success: true,
    message: 'Certificate generated successfully',
    data: {
      certificateUrl: certificate.certificateUrl,
      certificateName: certificate.certificateName,
      generatedFor: user.name,
    },
  });
});