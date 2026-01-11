import mongoose from 'mongoose';

const eventSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
  
  // For Virtual Meets
  attendanceCode: { 
    type: String, 
    unique: true,
    sparse: true 
  },
  
  // For Physical Geofencing
  geofenceCoordinates: {
    latitude: { type: Number },
    longitude: { type: Number },
    radiusInMeters: { type: Number, default: 100 }
  },

  linkedDomain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain'
  }
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
