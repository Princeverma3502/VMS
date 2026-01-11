import mongoose from 'mongoose';

const sosBroadcastSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      description: 'Secretary or medical team initiating SOS',
    },
    bloodType: {
      type: String,
      enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
      required: true,
      index: true,
      description: 'Blood type needed',
    },
    urgencyLevel: {
      type: String,
      enum: ['normal', 'high', 'critical'],
      default: 'critical',
      description: 'Urgency level affects notification priority',
    },
    recipientInfo: {
      type: String,
      required: true,
      maxlength: 500,
      description: 'Patient name, hospital, why blood is needed',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: String,
    },
    contactPerson: {
      type: {
        name: String,
        phone: String,
        email: String,
      },
      required: true,
    },
    unitsNeeded: {
      type: Number,
      required: true,
      description: 'Number of blood units needed',
    },
    unitsReceived: {
      type: Number,
      default: 0,
      description: 'Donors who responded',
    },
    targetUserIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      description: 'Users with matching blood type (auto-populated)',
    },
    respondentUserIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
      description: 'Users who responded to SOS',
    },
    status: {
      type: String,
      enum: ['active', 'fulfilled', 'expired', 'cancelled'],
      default: 'active',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      description: 'SOS auto-expires after 48 hours',
    },
    notificationsSent: {
      type: Number,
      default: 0,
      description: 'How many users received the alert',
    },
  },
  { timestamps: true }
);

// Create geospatial index for location-based queries
sosBroadcastSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.model('SOSBroadcast', sosBroadcastSchema);
