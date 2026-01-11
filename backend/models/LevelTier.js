import mongoose from 'mongoose';

const levelTierSchema = new mongoose.Schema(
  {
    level: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 100,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#6B7280',
    },
    icon: {
      type: String,
      default: 'Award',
    },
    minXP: {
      type: Number,
      required: true,
    },
    maxXP: {
      type: Number,
      required: true,
    },
    rewards: [
      {
        type: String,
        enum: ['badge', 'certificate', 'title', 'special_permission', 'recognition'],
      },
    ],
    privileges: [
      {
        name: String,
        description: String,
      },
    ],
    badge: {
      name: String,
      iconUrl: String,
    },
    milestoneMessage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

levelTierSchema.index({ minXP: 1, maxXP: 1 });

export default mongoose.model('LevelTier', levelTierSchema);
