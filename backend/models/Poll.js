import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  votes: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      votedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  voteCount: {
    type: Number,
    default: 0,
  },
});

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    domainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Domain',
    },
    options: [pollOptionSchema],
    expiresAt: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ['all', 'domain', 'ngo'],
      default: 'all',
    },
  },
  { timestamps: true }
);

// Index for quick expiry checks
pollSchema.index({ expiresAt: 1 });

export default mongoose.model('Poll', pollSchema);
