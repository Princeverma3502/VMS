import SOSBroadcast from '../models/SOSBroadcast.js';
import User from '../models/User.js';
import ImpactMetrics from '../models/ImpactMetrics.js';
import WallOfKindness from '../models/WallOfKindness.js';
import SkillEndorsement from '../models/SkillEndorsement.js';
import Reflection from '../models/Reflection.js';
import pushNotification from '../utils/pushNotification.js';
import cloudinary from 'cloudinary';

const cloudinaryV2 = cloudinary.v2;

// === SOS BLOOD DONATION SYSTEM ===

// POST: Create SOS blood donation alert
const createSOSBroadcast = async (req, res) => {
  try {
    const { bloodType, recipientInfo, location, contactPerson, unitsNeeded } = req.body;

    if (!bloodType || !recipientInfo || !location || !contactPerson || !unitsNeeded) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const sosBroadcast = new SOSBroadcast({
      collegeId: req.user.collegeId,
      createdBy: req.user._id,
      bloodType,
      recipientInfo,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
        address: location.address || '',
      },
      contactPerson,
      unitsNeeded,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
    });

    // Find volunteers with matching blood type
    const targetVolunteers = await User.find({
      collegeId: req.user.collegeId,
      role: 'Volunteer',
      isActive: true,
      'gamification.bloodType': bloodType, // Assuming blood type is stored in gamification
    }).select('_id pushToken name');

    sosBroadcast.targetUserIds = targetVolunteers.map((v) => v._id);

    await sosBroadcast.save();

    // Send push notifications to matching blood type volunteers
    let notificationsSent = 0;
    for (const volunteer of targetVolunteers) {
      if (volunteer.pushToken) {
        try {
          await pushNotification.send(volunteer.pushToken, {
            title: '🩸 URGENT: Blood Donation Needed!',
            body: `${bloodType} blood needed: ${recipientInfo.substring(0, 50)}...`,
            data: {
              sosId: sosBroadcast._id.toString(),
              actionUrl: `/sos/${sosBroadcast._id}`,
              urgency: 'critical',
            },
            priority: 'high',
          });
          notificationsSent++;
        } catch (error) {
          console.error(`Failed to send SOS to ${volunteer._id}:`, error);
        }
      }
    }

    sosBroadcast.notificationsSent = notificationsSent;
    await sosBroadcast.save();

    res.status(201).json({
      message: `SOS created and sent to ${notificationsSent} donors`,
      sosBroadcast,
    });
  } catch (error) {
    res.status(500).json({ message: 'SOS creation error', error: error.message });
  }
};

// POST: Volunteer responds to SOS
const respondToSOS = async (req, res) => {
  try {
    const { sosId } = req.params;
    const sos = await SOSBroadcast.findById(sosId);

    if (!sos) {
      return res.status(404).json({ message: 'SOS not found' });
    }

    if (sos.status !== 'active') {
      return res.status(400).json({ message: 'This SOS is no longer active' });
    }

    // Add respondent
    if (!sos.respondentUserIds.includes(req.user._id)) {
      sos.respondentUserIds.push(req.user._id);
      sos.unitsReceived = sos.respondentUserIds.length;

      // Check if fulfilled
      if (sos.unitsReceived >= sos.unitsNeeded) {
        sos.status = 'fulfilled';
      }

      await sos.save();
    }

    res.status(200).json({ message: 'Thank you for responding!', sos });
  } catch (error) {
    res.status(500).json({ message: 'Response error', error: error.message });
  }
};

// GET: List active SOS broadcasts for college
const getActiveSOSBroadcasts = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { latitude, longitude, maxDistance = 10000 } = req.query; // maxDistance in meters

    let query = {
      collegeId,
      status: 'active',
      expiresAt: { $gt: new Date() },
    };

    // Geospatial query if location provided
    if (latitude && longitude) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      };
    }

    const broadcasts = await SOSBroadcast.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(broadcasts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching SOS broadcasts', error: error.message });
  }
};

// === WALL OF KINDNESS (PHOTO FEED) ===

// POST: Create wall post
const createWallPost = async (req, res) => {
  try {
    const { story, photoUrl, eventId } = req.body;

    if (!story || !photoUrl) {
      return res.status(400).json({ message: 'Story and photo required' });
    }

    const post = new WallOfKindness({
      collegeId: req.user.collegeId,
      userId: req.user._id,
      story,
      photoUrl,
      eventId,
      visibility: 'draft', // Requires approval
    });

    await post.save();

    res.status(201).json({
      message: 'Post submitted for approval',
      post,
    });
  } catch (error) {
    res.status(500).json({ message: 'Post creation error', error: error.message });
  }
};

// GET: Get approved wall posts for college
const getWallPosts = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await WallOfKindness.find({
      collegeId,
      visibility: 'approved',
    })
      .populate('userId', 'name profileImage')
      .sort({ pinnedUntil: -1, hearts: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await WallOfKindness.countDocuments({
      collegeId,
      visibility: 'approved',
    });

    res.status(200).json({
      posts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};

// POST: Heart a post
const heartPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await WallOfKindness.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.heartedByUsers.includes(req.user._id)) {
      post.heartedByUsers.push(req.user._id);
      post.hearts = post.heartedByUsers.length;
    } else {
      post.heartedByUsers = post.heartedByUsers.filter((id) => id.toString() !== req.user._id.toString());
      post.hearts = post.heartedByUsers.length;
    }

    await post.save();

    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ message: 'Heart error', error: error.message });
  }
};

// === SKILL ENDORSEMENTS ===

// POST: Endorse volunteer skill
const endorseSkill = async (req, res) => {
  try {
    const { endorsedUserId, skillName, eventId, endorsementNote } = req.body;

    // Only Domain Heads/Secretaries can endorse
    if (!['Secretary', 'Domain Head'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only Domain Heads and Secretaries can endorse skills' });
    }

    const endorsement = new SkillEndorsement({
      collegeId: req.user.collegeId,
      endorsedUserId,
      endorsedByUserId: req.user._id,
      skillName,
      eventId,
      endorsementNote,
    });

    await endorsement.save();

    res.status(201).json({ message: 'Skill endorsed successfully', endorsement });
  } catch (error) {
    res.status(500).json({ message: 'Endorsement error', error: error.message });
  }
};

// GET: Get endorsements for a user
const getUserEndorsements = async (req, res) => {
  try {
    const { userId } = req.params;

    const endorsements = await SkillEndorsement.find({
      endorsedUserId: userId,
      isVerified: true,
    })
      .populate('endorsedByUserId', 'name role')
      .populate('eventId', 'title');

    res.status(200).json(endorsements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching endorsements', error: error.message });
  }
};

// === REFLECTIONS JOURNAL ===

// POST: Create reflection entry
const createReflection = async (req, res) => {
  try {
    const { title, content, eventId, mood, impact, attachments = [] } = req.body;

    if (!title || !content || content.length < 50) {
      return res.status(400).json({ message: 'Title and content (min 50 chars) required' });
    }

    const reflection = new Reflection({
      collegeId: req.user.collegeId,
      userId: req.user._id,
      title,
      content,
      eventId,
      mood,
      impact,
      attachments,
      isPrivate: true, // Default to private
    });

    await reflection.save();

    res.status(201).json({ message: 'Reflection saved', reflection });
  } catch (error) {
    res.status(500).json({ message: 'Reflection error', error: error.message });
  }
};

// GET: Get user's reflections
const getUserReflections = async (req, res) => {
  try {
    const { userId } = req.params;

    // Only user or admin can see private reflections
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const reflections = await Reflection.find({ userId })
      .populate('eventId', 'title domain')
      .sort({ createdAt: -1 });

    res.status(200).json(reflections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reflections', error: error.message });
  }
};

// PUT: Update reflection
const updateReflection = async (req, res) => {
  try {
    const { reflectionId } = req.params;
    const { title, content, mood, impact, attachments, isPrivate, allowedViewers } = req.body;

    const reflection = await Reflection.findById(reflectionId);

    if (!reflection) {
      return res.status(404).json({ message: 'Reflection not found' });
    }

    if (reflection.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    Object.assign(reflection, { title, content, mood, impact, attachments, isPrivate, allowedViewers });
    await reflection.save();

    res.status(200).json({ message: 'Reflection updated', reflection });
  } catch (error) {
    res.status(500).json({ message: 'Update error', error: error.message });
  }
};

// DELETE: Delete reflection
const deleteReflection = async (req, res) => {
  try {
    const { reflectionId } = req.params;
    const reflection = await Reflection.findById(reflectionId);

    if (!reflection) {
      return res.status(404).json({ message: 'Reflection not found' });
    }

    if (reflection.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Reflection.findByIdAndDelete(reflectionId);

    res.status(200).json({ message: 'Reflection deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete error', error: error.message });
  }
};

// === IMPACT MAP ===

// GET: Impact map data with event locations
const getImpactMap = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const { days = 30 } = req.query;

    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const metrics = await ImpactMetrics.findOne({ collegeId });

    if (!metrics) {
      return res.status(404).json({ message: 'No impact metrics found' });
    }

    // Filter events by date range
    const recentEvents = metrics.eventLocations.filter((e) => new Date(e.dateCompleted) > sinceDate);

    res.status(200).json({
      college: collegeId,
      summary: {
        totalVolunteers: metrics.totalActiveVolunteers,
        totalHours: metrics.totalVolunteerHours,
        totalXP: metrics.totalLifetimeXP,
        eventsInPeriod: recentEvents.length,
      },
      eventLocations: recentEvents,
      metricsData: metrics.metricsData,
    });
  } catch (error) {
    res.status(500).json({ message: 'Impact map error', error: error.message });
  }
};

export default {
  createSOSBroadcast,
  respondToSOS,
  getActiveSOSBroadcasts,
  createWallPost,
  getWallPosts,
  heartPost,
  endorseSkill,
  getUserEndorsements,
  createReflection,
  getUserReflections,
  updateReflection,
  deleteReflection,
  getImpactMap,
};
