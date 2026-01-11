import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'xp_earned',
        'task_completed',
        'event_attended',
        'badge_earned',
        'level_up',
        'streak_milestone',
        'domain_progress',
        'team_achievement',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['Task', 'Event', 'Domain', 'User', 'Badge'],
      },
      entityId: mongoose.Schema.Types.ObjectId,
    },
    metadata: {
      xpAmount: Number,
      oldLevel: Number,
      newLevel: Number,
      badge: String,
      domainName: String,
    },
    visibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Index for efficient queries
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ type: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
