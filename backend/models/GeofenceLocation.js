import mongoose from 'mongoose';

const geofenceLocationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    locationName: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    radiusMeters: {
      type: Number,
      default: 100,
      min: 50,
      max: 500,
    },
    address: {
      type: String,
      default: '',
    },
    mapUrl: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
geofenceLocationSchema.index({ latitude: '2dsphere', longitude: '2dsphere' });
geofenceLocationSchema.index({ eventId: 1 });

export default mongoose.model('GeofenceLocation', geofenceLocationSchema);
