import mongoose from 'mongoose';

const globaBroadcastSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      description: 'Super-admin sending the broadcast',
    },
    title: {
      type: String,
      required: true,
      description: 'Broadcast title',
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
      description: 'Message to all Secretaries',
    },
    broadcastType: {
      type: String,
      enum: ['announcement', 'maintenance', 'urgent', 'feature_update'],
      default: 'announcement',
    },
    targetRole: {
      type: String,
      enum: ['secretary', 'all_secretaries', 'admin'],
      default: 'secretary',
      description: 'Who receives this broadcast',
    },
    // Can also target specific colleges
    targetColleges: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'College',
      default: [],
      description: 'If empty, broadcast goes to all colleges',
    },
    isUrgent: {
      type: Boolean,
      default: false,
      description: 'Use high-priority push notification',
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    notificationSentAt: {
      type: Date,
    },
    recipientCount: {
      type: Number,
      default: 0,
      description: 'How many users received it',
    },
    readCount: {
      type: Number,
      default: 0,
      description: 'How many opened/read it',
    },
    actionUrl: {
      type: String,
      description: 'Optional deep link (e.g., /super-admin/dashboard)',
    },
    scheduledFor: {
      type: Date,
      description: 'Schedule broadcast for future sending',
    },
    expiresAt: {
      type: Date,
      description: 'When broadcast should disappear from UI',
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sent', 'archived'],
      default: 'draft',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('GlobalBroadcast', globaBroadcastSchema);
