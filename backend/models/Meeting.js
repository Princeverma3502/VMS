import mongoose from 'mongoose';

const meetingSchema = mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  
  description: { 
    type: String 
  },
  
  scheduledAt: {
    type: Date,
    required: true
  },
  
  duration: {
    type: Number, // in minutes
    default: 60
  },
  
  // Type: 'Online' or 'Offline'
  meetingType: {
    type: String,
    enum: ['Online', 'Offline'],
    default: 'Online'
  },
  
  // For online: Zoom/GMeet link
  meetLink: {
    type: String,
    default: null
  },
  
  // For offline: Location
  location: {
    type: String,
    default: null
  },
  
  // Scope: 'Core' (Heads only), 'Domain' (Domain volunteers), or 'All' (All volunteers)
  meetScope: {
    type: String,
    enum: ['Core', 'Domain', 'All'],
    default: 'All'
  },
  
  // If scope is 'Domain', which domain?
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    default: null
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Invited users
  invitedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Attendance tracking
  attendees: [{
    userId: mongoose.Schema.Types.ObjectId,
    joinedAt: Date,
    leftAt: Date
  }],

  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', index: true },
  
  // Google Calendar event ID (optional)
  googleCalendarEventId: {
    type: String,
    default: null
  }
}, { timestamps: true });

export default mongoose.model('Meeting', meetingSchema);
