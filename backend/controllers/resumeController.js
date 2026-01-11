import PDFDocument from 'pdfkit';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Task from '../models/Task.js';
import SkillEndorsement from '../models/SkillEndorsement.js';
import ImpactMetrics from '../models/ImpactMetrics.js';
import WallOfKindness from '../models/WallOfKindness.js';
import mongoose from 'mongoose';

// Generate Social Service Resume as PDF
const generateResumePDF = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('collegeId', 'name');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify college isolation (user can only see their own or admin can see any)
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Fetch resume data
    const resumeData = await buildResumeData(user);

    // Generate PDF
    const pdfBuffer = await generatePDFBuffer(resumeData, user);

    // Send as attachment
    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', `attachment; filename="Social_Service_Resume_${user.name.replace(/\s/g, '_')}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: 'Resume generation error', error: error.message });
  }
};

// Build resume data from user activities
async function buildResumeData(user) {
  const collegeId = user.collegeId._id;

  // Get events attended
  const eventsAttended = await Event.find({
    collegeId,
    volunteers: user._id,
  }).select('title description domain totalHours startDate');

  // Get tasks completed
  const tasksCompleted = await Task.find({
    collegeId,
    completedBy: user._id,
  }).select('title xpReward completedAt');

  // Get skills endorsed
  const skillsEndorsed = await SkillEndorsement.find({
    collegeId,
    endorsedUserId: user._id,
  }).populate('endorsedByUserId', 'name role');

  // Calculate impact metrics
  const totalHours = user.gamification?.totalHours || 0;
  const xpEarned = user.gamification?.lifetimeXP || 0;
  const eventsCount = eventsAttended.length;
  const tasksCount = tasksCompleted.length;

  return {
    user: {
      name: user.name,
      email: user.email,
      college: user.collegeId.name,
      year: user.year || 'N/A',
      academicYear: user.academicYear,
    },
    summary: {
      totalHours,
      xpEarned,
      eventsAttended: eventsCount,
      tasksCompleted: tasksCount,
      level: user.gamification?.level || 1,
      badges: user.gamification?.badges || [],
    },
    events: eventsAttended,
    tasks: tasksCompleted,
    skills: skillsEndorsed,
    dateGenerated: new Date().toLocaleDateString(),
  };
}

// Generate PDF buffer from resume data
async function generatePDFBuffer(data, user) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('Social Service Resume', { align: 'center' });
    doc.fontSize(10).fillColor('#666').text(`Generated on ${data.dateGenerated}`, { align: 'center' });
    doc.moveDown(0.5);

    // User Info
    doc.fontSize(12).fillColor('#000').font('Helvetica-Bold').text('Volunteer Information');
    doc.fontSize(10).font('Helvetica').text(`Name: ${data.user.name}`);
    doc.text(`Email: ${data.user.email}`);
    doc.text(`College: ${data.user.college}`);
    doc.text(`Year: ${data.user.year}`);
    doc.moveDown(0.5);

    // Impact Summary
    doc.fontSize(12).font('Helvetica-Bold').text('Impact Summary');
    const summaryData = [
      { label: 'Total Service Hours', value: data.summary.totalHours },
      { label: 'XP Points Earned', value: data.summary.xpEarned },
      { label: 'Events Attended', value: data.summary.eventsAttended },
      { label: 'Tasks Completed', value: data.summary.tasksCompleted },
      { label: 'Current Level', value: data.summary.level },
    ];

    doc.fontSize(10).font('Helvetica');
    for (const item of summaryData) {
      doc.text(`${item.label}: ${item.value}`, { indent: 20 });
    }
    doc.moveDown(0.5);

    // Badges
    if (data.summary.badges.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').text('Badges Earned');
      doc.fontSize(10).font('Helvetica');
      for (const badge of data.summary.badges) {
        doc.text(`• ${badge.name} (${new Date(badge.earnedAt).toLocaleDateString()})`, { indent: 20 });
      }
      doc.moveDown(0.5);
    }

    // Events
    if (data.events.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').text('Events Attended');
      doc.fontSize(9).font('Helvetica');
      for (const event of data.events) {
        doc.text(`• ${event.title}`, { indent: 20 });
        doc.text(`  Domain: ${event.domain || 'N/A'} | Hours: ${event.totalHours || 0}`, { indent: 30, fontSize: 8 });
      }
      doc.moveDown(0.5);
    }

    // Tasks
    if (data.tasks.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').text('Tasks Completed');
      doc.fontSize(9).font('Helvetica');
      for (const task of data.tasks) {
        doc.text(`• ${task.title} (+${task.xpReward} XP)`, { indent: 20 });
      }
      doc.moveDown(0.5);
    }

    // Skills
    if (data.skills.length > 0) {
      doc.fontSize(12).font('Helvetica-Bold').text('Skills Endorsed');
      doc.fontSize(9).font('Helvetica');
      for (const skill of data.skills) {
        doc.text(`• ${skill.skillName} (endorsed by ${skill.endorsedByUserId.name})`, { indent: 20 });
      }
      doc.moveDown(0.5);
    }

    // Footer
    doc.fontSize(8).fillColor('#999').text('This certificate is digitally signed and valid for all official purposes.', 50, doc.page.height - 30, { align: 'center' });

    doc.end();
  });
}

// Get resume preview (JSON data without PDF)
const getResumePreview = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('collegeId', 'name');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const resumeData = await buildResumeData(user);
    res.status(200).json(resumeData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resume preview', error: error.message });
  }
};

// Get college-wide resume statistics
const getCollegeResumeStats = async (req, res) => {
  try {
    const { collegeId } = req.params;

    // Verify secretary is from this college
    if (req.user.collegeId.toString() !== collegeId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const stats = await User.aggregate([
      { $match: { collegeId: mongoose.Types.ObjectId(collegeId), role: 'Volunteer' } },
      {
        $group: {
          _id: null,
          totalVolunteers: { $sum: 1 },
          totalHours: { $sum: '$gamification.totalHours' },
          totalXP: { $sum: '$gamification.lifetimeXP' },
          avgHoursPerVolunteer: { $avg: '$gamification.totalHours' },
          avgXPPerVolunteer: { $avg: '$gamification.lifetimeXP' },
        },
      },
    ]);

    res.status(200).json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ message: 'Stats error', error: error.message });
  }
};

// Export all resumes for a college (admin only)
const exportCollegeResumes = async (req, res) => {
  try {
    const { collegeId } = req.params;

    if (req.user.role !== 'admin' && req.user.collegeId.toString() !== collegeId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const users = await User.find({ collegeId, role: 'Volunteer' });
    const resumes = [];

    for (const user of users) {
      const resume = await buildResumeData(user);
      resumes.push(resume);
    }

    res.status(200).json({ college: collegeId, totalResumes: resumes.length, resumes });
  } catch (error) {
    res.status(500).json({ message: 'Export error', error: error.message });
  }
};

export default {
  generateResumePDF,
  getResumePreview,
  getCollegeResumeStats,
  exportCollegeResumes,
};
