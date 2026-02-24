import mongoose from 'mongoose';

const eventSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  time: { type: String },
  location: { type: String },
  type: { type: String, required: true },
  xpPoints: { type: Number, default: 20 },
  status: { type: String, default: 'Upcoming' },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // For Virtual Meets
  attendanceCode: {
    type: String,
    unique: true,
    sparse: true
  },

  // For Physical Geofencing
  geofence: {
    latitude: { type: Number },
    longitude: { type: Number },
    radius: { type: Number, default: 100 }
  },

  // Attendees
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Waitlist for full events
  waitlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
