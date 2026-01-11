import asyncHandler from 'express-async-handler';
import Session from '../models/Session.js';
import SessionHistory from '../models/SessionHistory.js';
import User from '../models/User.js';
import Meeting from '../models/Meeting.js';
import Task from '../models/Task.js';

// @desc End current academic session for a college: archive and reset
// @route POST /api/sessions/:collegeId/end
// @access Secretary (should be protected by role middleware)
export const endSession = asyncHandler(async (req, res) => {
  const { collegeId } = req.params;
  const { transferSecretaryEmail } = req.body;

  // 1. Validate caller is secretary for this college
  if (!req.user || String(req.user.collegeId) !== String(collegeId) || req.user.role !== 'Secretary') {
    res.status(403);
    throw new Error('Only the Secretary of this college can end the session');
  }

  // 2. Find active session for college
  const activeSession = await Session.findOne({ collegeId, isActive: true });
  if (!activeSession) {
    res.status(404);
    throw new Error('No active session found for this college');
  }

  // 3. Snapshot Data
  const users = await User.find({ collegeId }).select('-password').lean();
  const meetings = await Meeting.find({ collegeId }).lean();
  const tasks = await Task.find({ collegeId }).lean();

  // Create history record
  const history = await SessionHistory.create({
    sessionId: activeSession._id,
    collegeId,
    usersSnapshot: users.map(u => ({ 
        _id: u._id, 
        name: u.name, 
        email: u.email, 
        rollNumber: u.rollNumber, 
        gamification: u.gamification,
        year: u.year // Store the year they were in during this session
    })),
    meetingsSnapshot: meetings,
    tasksSnapshot: tasks,
  });

  // 4. Reset User XP (BUT DO NOT CHANGE ACADEMIC YEAR)
  // We calculate new lifetime XP and reset current XP to 0.
  const bulkOps = users.map(u => {
    const currentXP = u.gamification?.xpPoints || 0;
    const existingLifetime = u.gamification?.lifetimeXP || 0;
    const newLifetime = existingLifetime + currentXP;

    return {
      updateOne: {
        filter: { _id: u._id },
        update: { 
            $set: { 
                'gamification.xpPoints': 0, 
                'gamification.lifetimeXP': newLifetime 
                // REMOVED: Auto-promotion logic (academicYear update is gone)
            } 
        }
      }
    };
  });

  if (bulkOps.length) {
    await User.bulkWrite(bulkOps);
  }

  // 5. Mark session inactive
  activeSession.isActive = false;
  activeSession.endDate = new Date();
  await activeSession.save();

  // 6. Transfer Secretary if requested
  if (transferSecretaryEmail) {
    const newSec = await User.findOne({ email: transferSecretaryEmail, collegeId });
    if (newSec) {
      // Demote current secretary
      const current = await User.findById(req.user._id);
      if (current) { current.role = 'Volunteer'; await current.save(); }
      
      // Promote new secretary
      newSec.role = 'Secretary';
      newSec.isApproved = true;
      await newSec.save();
    }
  }

  res.status(200).json({ 
      message: 'Session archived successfully. XP reset. Student years remained unchanged.', 
      historyId: history._id 
  });
});

export default { endSession };