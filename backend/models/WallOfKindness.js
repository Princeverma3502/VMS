import mongoose from 'mongoose';

const wallOfKindnessSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
      description: 'Volunteer posting the story',
    },
    photoUrl: {
      type: String,
      required: true,
      description: 'Cloudinary image URL of the moment',
    },
    story: {
      type: String,
      required: true,
      maxlength: 280,
      description: '1-sentence story (max 280 chars like Twitter)',
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      description: 'Event this story relates to (optional)',
    },
    hearts: {
      type: Number,
      default: 0,
      index: true,
      description: 'Total heart count',
    },
    heartedByUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
      description: 'Users who hearted this post',
    },
    isApproved: {
      type: Boolean,
      default: false,
      description: 'Requires college moderation approval',
    },
    approvedAt: {
      type: Date,
      description: 'When post was approved for wall',
    },
    pinnedUntil: {
      type: Date,
      description: 'Pin post to top until this date',
    },
    visibility: {
      type: String,
      enum: ['draft', 'approved', 'archived'],
      default: 'draft',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('WallOfKindness', wallOfKindnessSchema);
