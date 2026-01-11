import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
    },
    domainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Domain',
    },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', index: true },
    visibility: {
      type: String,
      enum: ['all', 'domain', 'ngo'],
      default: 'all',
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
      },
    ],
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalViews: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

noticeSchema.index({ createdAt: -1 });
noticeSchema.index({ ngoId: 1 });
noticeSchema.index({ domainId: 1 });
noticeSchema.index({ collegeId: 1 });

export default mongoose.model('Notice', noticeSchema);
