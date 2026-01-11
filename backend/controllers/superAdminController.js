import College from '../models/College.js';
import User from '../models/User.js';
import GlobalBroadcast from '../models/GlobalBroadcast.js';
import CollegeSettings from '../models/CollegeSettings.js';
import ImpactMetrics from '../models/ImpactMetrics.js';
import Session from '../models/Session.js';
import Task from '../models/Task.js';
import Event from '../models/Event.js';
import WebhookLog from '../models/WebhookLog.js';
import pushNotification from '../utils/pushNotification.js';

export const getDashboardStats = async (req, res) => {
  try {
    if (req.user?.role !== 'admin' || !req.user?.isSuperAdmin) {
      return res.status(403).json({ message: 'Only super-admins can access this' });
    }

    const stats = {
      totalColleges: await College.countDocuments(),
      activeColleges: await College.countDocuments({ isActive: true }),
      totalUsers: await User.countDocuments(),
      totalActiveVolunteers: await User.countDocuments({ role: 'volunteer', isActive: true }),
      totalSecretaries: await User.countDocuments({ role: 'secretary' }),
      totalAdmins: await User.countDocuments({ role: 'admin' }),
      totalSessions: await Session.countDocuments(),
      activeSessions: await Session.countDocuments({ isActive: true }),
      totalTasks: await Task.countDocuments(),
      totalEvents: await Event.countDocuments(),
      totalXpDistributed: await User.aggregate([{ $group: { _id: null, total: { $sum: '$lifetimeXP' } } }]),
      databaseHealth: await getDatabaseHealth(),
      recentSignups: await User.find().sort({ createdAt: -1 }).limit(10).select('name email collegeId role createdAt'),
      webhookStatus: await getWebhookHealth(),
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Dashboard stats error', error: error.message });
  }
};

async function getDatabaseHealth() {
  try {
    const collections = {
      users: await User.countDocuments(),
      colleges: await College.countDocuments(),
      sessions: await Session.countDocuments(),
      tasks: await Task.countDocuments(),
      events: await Event.countDocuments(),
    };
    return { status: 'healthy', collections };
  } catch (error) {
    return { status: 'degraded', error: error.message };
  }
}

async function getWebhookHealth() {
  const failed = await WebhookLog.countDocuments({ status: 'failed' });
  const pending = await WebhookLog.countDocuments({ status: 'pending' });
  const retrying = await WebhookLog.countDocuments({ status: 'retrying' });
  
  return {
    failedWebhooks: failed,
    pendingWebhooks: pending,
    retryingWebhooks: retrying,
    healthStatus: failed > 100 ? 'degraded' : 'healthy',
  };
}

export const getAllColleges = async (req, res) => {
  try {
    if (req.user?.role !== 'admin' || !req.user?.isSuperAdmin) {
      return res.status(403).json({ message: 'Only super-admins can access this' });
    }

    const { page = 1, limit = 20, search, sortBy = 'createdAt', order = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { slug: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const colleges = await College.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    const total = await College.countDocuments(query);

    const enriched = await Promise.all(
      colleges.map(async (col) => {
        const userCount = await User.countDocuments({ collegeId: col._id });
        const activeSessions = await Session.countDocuments({ collegeId: col._id, isActive: true });
        return {
          ...col.toObject(),
          userCount,
          activeSessions,
        };
      })
    );

    res.status(200).json({
      colleges: enriched,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching colleges', error: error.message });
  }
};

export const sendGlobalBroadcast = async (req, res) => {
  try {
    if (req.user?.role !== 'admin' || !req.user?.isSuperAdmin) {
      return res.status(403).json({ message: 'Only super-admins can send broadcasts' });
    }

    const { title, message, broadcastType = 'announcement', isUrgent = false, targetColleges = [], actionUrl, scheduledFor } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const broadcast = new GlobalBroadcast({
      createdBy: req.user._id,
      title,
      message,
      broadcastType,
      isUrgent,
      targetColleges: targetColleges.length > 0 ? targetColleges : [],
      actionUrl,
      scheduledFor,
      status: scheduledFor ? 'scheduled' : 'sent',
    });

    await broadcast.save();

    if (!scheduledFor) {
      let query = { role: 'secretary' };
      if (targetColleges.length > 0) {
        query.collegeId = { $in: targetColleges };
      }

      const secretaries = await User.find(query).select('_id pushToken');
      let notificationsSent = 0;

      for (const secretary of secretaries) {
        if (secretary.pushToken) {
          try {
            await pushNotification.send(secretary.pushToken, {
              title,
              body: message,
              data: {
                broadcastId: broadcast._id.toString(),
                actionUrl: actionUrl || '/broadcasts',
              },
              priority: isUrgent ? 'high' : 'normal',
            });
            notificationsSent++;
          } catch (error) {
            console.error(`Failed to send notification to ${secretary._id}:`, error);
          }
        }
      }

      broadcast.notificationSent = true;
      broadcast.notificationSentAt = new Date();
      broadcast.recipientCount = notificationsSent;
      await broadcast.save();
    }

    res.status(201).json({
      message: scheduledFor ? 'Broadcast scheduled' : 'Broadcast sent',
      broadcast,
    });
  } catch (error) {
    res.status(500).json({ message: 'Broadcast error', error: error.message });
  }
};

export const getBroadcasts = async (req, res) => {
  try {
    if (req.user?.role !== 'admin' || !req.user?.isSuperAdmin) {
      return res.status(403).json({ message: 'Only super-admins can view broadcasts' });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const broadcasts = await GlobalBroadcast.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    const total = await GlobalBroadcast.countDocuments();

    res.status(200).json({
      broadcasts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching broadcasts', error: error.message });
  }
};

export const deactivateCollege = async (req, res) => {
  try {
    if (req.user?.role !== 'admin' || !req.user?.isSuperAdmin) {
      return res.status(403).json({ message: 'Only super-admins can deactivate colleges' });
    }

    const { collegeId } = req.params;
    const college = await College.findByIdAndUpdate(
      collegeId,
      { isActive: false, deactivatedAt: new Date(), deactivatedBy: req.user._id },
      { new: true }
    );

    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    await User.updateMany({ collegeId }, { isActive: false });

    res.status(200).json({ message: 'College deactivated', college });
  } catch (error) {
    res.status(500).json({ message: 'Deactivation error', error: error.message });
  }
};

export const getCollegeAnalytics = async (req, res) => {
  try {
    if (req.user?.role !== 'admin' || !req.user?.isSuperAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { collegeId } = req.params;
    const college = await College.findById(collegeId);

    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    const analytics = {
      college,
      userStats: {
        total: await User.countDocuments({ collegeId }),
        active: await User.countDocuments({ collegeId, isActive: true }),
        volunteers: await User.countDocuments({ collegeId, role: 'volunteer' }),
        secretaries: await User.countDocuments({ collegeId, role: 'secretary' }),
      },
      sessionStats: {
        total: await Session.countDocuments({ collegeId }),
        active: await Session.countDocuments({ collegeId, isActive: true }),
      },
      activityStats: {
        totalEvents: await Event.countDocuments({ collegeId }),
        totalTasks: await Task.countDocuments({ collegeId }),
        totalXpDistributed: await User.aggregate([
          { $match: { collegeId } },
          { $group: { _id: null, total: { $sum: '$lifetimeXP' } } },
        ]),
      },
      impactMetrics: await ImpactMetrics.findOne({ collegeId }),
    };

    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Analytics error', error: error.message });
  }
};

export const getWebhookLogs = async (req, res) => {
  try {
    if (req.user?.role !== 'admin' || !req.user?.isSuperAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { collegeId, status, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (collegeId) query.collegeId = collegeId;
    if (status) query.status = status;

    const logs = await WebhookLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await WebhookLog.countDocuments(query);

    res.status(200).json({
      logs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Webhook log error', error: error.message });
  }
};

export const retryFailedWebhook = async (req, res) => {
  try {
    if (req.user?.role !== 'admin' || !req.user?.isSuperAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { webhookLogId } = req.params;
    const log = await WebhookLog.findById(webhookLogId);

    if (!log) {
      return res.status(404).json({ message: 'Webhook log not found' });
    }

    log.status = 'pending';
    log.retryCount = 0;
    log.nextRetryAt = null;
    await log.save();

    res.status(200).json({ message: 'Webhook queued for retry', log });
  } catch (error) {
    res.status(500).json({ message: 'Retry error', error: error.message });
  }
};

export const exportCollegeData = async (req, res) => {
  try {
    if (req.user?.role !== 'admin' || !req.user?.isSuperAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { collegeId, dataType = 'users' } = req.query;

    let data = [];
    if (dataType === 'users') {
      data = await User.find({ collegeId }).select('name email phone role xpPoints lifetimeXP academicYear isActive createdAt');
    } else if (dataType === 'events') {
      data = await Event.find({ collegeId }).select('title description domain location volunteers createdAt');
    } else if (dataType === 'tasks') {
      data = await Task.find({ collegeId }).select('title description xpReward completedBy createdAt');
    }

    const csv = convertToCSV(data);
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="college_${collegeId}_${dataType}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Export error', error: error.message });
  }
};

function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0].toObject ? data[0].toObject() : data[0]);
  const csv = [headers.join(',')];

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      if (Array.isArray(value)) return `"${value.join(';')}"`;
      if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
      return `"${value}"`;
    });
    csv.push(values.join(','));
  }

  return csv.join('\n');
}

export default {
  getDashboardStats,
  getAllColleges,
  sendGlobalBroadcast,
  getBroadcasts,
  deactivateCollege,
  getCollegeAnalytics,
  getWebhookLogs,
  retryFailedWebhook,
  exportCollegeData,
};