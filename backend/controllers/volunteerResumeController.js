import asyncHandler from 'express-async-handler';
import VolunteerResume from '../models/VolunteerResume.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

// @desc    Generate or get volunteer resume
// @route   GET /volunteer-resume/:userId
// @access  Public
export const getVolunteerResume = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  let resume = await VolunteerResume.findOne({ userId })
    .populate('domainsContributed.domainId', 'name')
    .populate('eventsAttended.eventId', 'title date')
    .populate('userId', 'name email profileImage gamification branch year');

  if (!resume) {
    // Create new resume
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    resume = await VolunteerResume.create({
      userId,
      uniqueLink: `${user.name.replace(/\s+/g, '-')}-${uuidv4().slice(0, 8)}`.toLowerCase(),
      totalHours: 0,
      totalXP: user.gamification?.xpPoints || 0,
      level: user.gamification?.level || 1,
      topSkills: [],
      domainsContributed: [],
      eventsAttended: [],
      badges: user.gamification?.badges || [],
      isPublic: true,
    });

    resume = await resume.populate('userId', 'name email profileImage gamification branch year');
  }

  // Increment view count
  resume.viewCount += 1;
  await resume.save();

  res.status(200).json({
    success: true,
    data: resume,
  });
});

// @desc    Get my resume
// @route   GET /volunteer-resume
// @access  Private
export const getMyResume = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  let resume = await VolunteerResume.findOne({ userId })
    .populate('domainsContributed.domainId', 'name')
    .populate('eventsAttended.eventId', 'title date')
    .populate('userId', 'name email profileImage gamification branch year');

  if (!resume) {
    const user = await User.findById(userId);

    resume = await VolunteerResume.create({
      userId,
      uniqueLink: `${user.name.replace(/\s+/g, '-')}-${uuidv4().slice(0, 8)}`.toLowerCase(),
      totalHours: user.gamification?.totalHours || 0,
      totalXP: user.gamification?.xpPoints || 0,
      level: user.gamification?.level || 1,
      topSkills: [],
      domainsContributed: [],
      eventsAttended: [],
      badges: user.gamification?.badges || [],
      isPublic: true,
    });

    resume = await resume.populate('userId', 'name email profileImage gamification branch year');
  }

  res.status(200).json({
    success: true,
    data: resume,
  });
});

// @desc    Update volunteer resume
// @route   PUT /volunteer-resume
// @access  Private
export const updateResume = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { bio, topSkills, domainsContributed, eventsAttended, isPublic } = req.body;

  let resume = await VolunteerResume.findOne({ userId });

  if (!resume) {
    return res.status(404).json({ message: 'Resume not found' });
  }

  if (bio) resume.bio = bio;
  if (topSkills) resume.topSkills = topSkills;
  if (domainsContributed) resume.domainsContributed = domainsContributed;
  if (eventsAttended) resume.eventsAttended = eventsAttended;
  if (isPublic !== undefined) resume.isPublic = isPublic;

  resume.lastUpdated = new Date();
  await resume.save();

  res.status(200).json({
    success: true,
    message: 'Resume updated successfully',
    data: resume,
  });
});

// @desc    Generate certificate PDF
// @route   POST /volunteer-resume/generate-certificate
// @access  Private
export const generateCertificate = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const resume = await VolunteerResume.findOne({ userId }).populate('userId', 'name email profilePicture');
  const user = resume.userId;

  if (!resume) {
    return res.status(404).json({ message: 'Resume not found' });
  }

  // Generate PDF using pdfkit
  const PDFDocument = (await import('pdfkit')).default;
  const fs = await import('fs');
  const path = await import('path');

  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
  });

  const fileName = `certificate-${userId}-${Date.now()}.pdf`;
  const filePath = path.join(process.cwd(), 'uploads', 'certificates', fileName);

  // Ensure certificates directory exists
  const certDir = path.join(process.cwd(), 'uploads', 'certificates');
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Certificate Header
  doc.fontSize(24).font('Helvetica-Bold').text('VOLUNTEER CERTIFICATE', { align: 'center' });
  doc.moveDown(2);

  // Certificate Body
  doc.fontSize(16).font('Helvetica').text('This is to certify that', { align: 'center' });
  doc.moveDown();

  doc.fontSize(20).font('Helvetica-Bold').text(user.name, { align: 'center' });
  doc.moveDown();

  doc.fontSize(14).font('Helvetica').text('has successfully completed volunteer activities and demonstrated', { align: 'center' });
  doc.text('exceptional dedication to community service.', { align: 'center' });
  doc.moveDown(2);

  // Volunteer Statistics
  doc.fontSize(12).font('Helvetica-Bold').text('Volunteer Statistics:', { underline: true });
  doc.moveDown();

  doc.fontSize(11).font('Helvetica');
  doc.text(`Total Hours Volunteered: ${resume.totalHours || 0} hours`);
  doc.text(`Total XP Earned: ${resume.totalXP || 0} XP`);
  doc.text(`Current Level: ${resume.level || 1}`);
  doc.text(`Events Attended: ${resume.eventsAttended?.length || 0}`);
  doc.moveDown();

  // Skills
  if (resume.topSkills && resume.topSkills.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold').text('Top Skills:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    resume.topSkills.forEach(skill => {
      doc.text(`• ${skill.name} (${skill.proficiency})`);
    });
    doc.moveDown();
  }

  // Domains Contributed
  if (resume.domainsContributed && resume.domainsContributed.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold').text('Domains Contributed:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    resume.domainsContributed.forEach(domain => {
      doc.text(`• ${domain.domainName}: ${domain.tasksCompleted} tasks, ${domain.hoursSpent} hours`);
    });
    doc.moveDown();
  }

  // Badges
  if (resume.badges && resume.badges.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold').text('Badges Earned:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    resume.badges.forEach(badge => {
      doc.text(`• ${badge.name}: ${badge.description}`);
    });
    doc.moveDown();
  }

  // Footer
  doc.moveDown(2);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Certificate Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.text('Volunteer Management System', { align: 'center' });

  doc.end();

  // Wait for PDF to be written
  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  const certificateUrl = `/uploads/certificates/${fileName}`;

  resume.certificateGenerated = {
    url: certificateUrl,
    generatedAt: new Date(),
  };

  await resume.save();

  res.status(200).json({
    success: true,
    message: 'Certificate generated successfully',
    data: {
      certificateUrl,
      generatedAt: resume.certificateGenerated.generatedAt,
    },
  });
});

// @desc    Share resume (get shareable link)
// @route   GET /volunteer-resume/share/:uniqueLink
// @access  Public
export const shareResume = asyncHandler(async (req, res) => {
  const { uniqueLink } = req.params;

  const resume = await VolunteerResume.findOne({ uniqueLink, isPublic: true })
    .populate('domainsContributed.domainId', 'name')
    .populate('eventsAttended.eventId', 'title date')
    .populate('userId', 'name email profileImage gamification branch year');

  if (!resume) {
    return res.status(404).json({ message: 'Resume not found or is not public' });
  }

  res.status(200).json({
    success: true,
    data: resume,
  });
});

// @desc    Add skill to resume
// @route   POST /volunteer-resume/add-skill
// @access  Private
export const addSkill = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, icon, proficiency, tasksCompleted } = req.body;

  const resume = await VolunteerResume.findOne({ userId });

  if (!resume) {
    return res.status(404).json({ message: 'Resume not found' });
  }

  // Check if skill already exists
  const skillExists = resume.topSkills.some((skill) => skill.name === name);

  if (skillExists) {
    return res.status(400).json({ message: 'Skill already exists' });
  }

  resume.topSkills.push({
    name,
    icon,
    proficiency,
    tasksCompleted,
  });

  await resume.save();

  res.status(201).json({
    success: true,
    message: 'Skill added successfully',
    data: resume.topSkills,
  });
});

// @desc    Add testimonial to resume
// @route   POST /volunteer-resume/add-testimonial
// @access  Private
export const addTestimonial = asyncHandler(async (req, res) => {
  const { volunteerId } = req.params;
  const { author, text } = req.body;

  const resume = await VolunteerResume.findOne({ userId: volunteerId });

  if (!resume) {
    return res.status(404).json({ message: 'Resume not found' });
  }

  resume.testimonials.push({
    author,
    text,
    date: new Date(),
  });

  await resume.save();

  res.status(201).json({
    success: true,
    message: 'Testimonial added successfully',
    data: resume.testimonials,
  });
});

// @desc    Get resume statistics
// @route   GET /volunteer-resume/stats/:userId
// @access  Public
export const getResumeStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const resume = await VolunteerResume.findOne({ userId, isPublic: true }).lean();

  if (!resume) {
    return res.status(404).json({ message: 'Resume not found' });
  }

  const stats = {
    totalHours: resume.totalHours,
    totalXP: resume.totalXP,
    level: resume.level,
    skillsCount: resume.topSkills.length,
    domainsCount: resume.domainsContributed.length,
    eventsCount: resume.eventsAttended.length,
    badgesCount: resume.badges.length,
    testimonialCount: resume.testimonials.length,
    views: resume.viewCount,
    downloads: resume.downloadCount,
  };

  res.status(200).json({
    success: true,
    data: stats,
  });
});
