import mongoose from 'mongoose';

const demoCertificateSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    certificateName: {
      type: String,
      required: true,
    },
    certificateUrl: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes
demoCertificateSchema.index({ collegeId: 1, year: 1 });
demoCertificateSchema.index({ createdAt: -1 });

export default mongoose.model('DemoCertificate', demoCertificateSchema);