import mongoose from 'mongoose';

const announcementSchema = mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  
  content: { 
    type: String, 
    required: true 
  },
  
  collegeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'College', 
    required: true, 
    index: true 
  },
  
  priority: {
    type: String,
    enum: ['Urgent', 'Info', 'Success'],
    default: 'Info'
  },
  
  // Scope: 'Global' (Secretary only) or 'Domain' (Domain Head)
  scope: {
    type: String,
    enum: ['Global', 'Domain'],
    default: 'Global'
  },
  
  // If scope is 'Domain', which domain does this belong to?
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
  
  // Track which users have read this
  readBy: [{
    userId: mongoose.Schema.Types.ObjectId,
    readAt: { type: Date, default: Date.now }
  }],
  
  expiresAt: { 
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, { timestamps: true });

export default mongoose.model('Announcement', announcementSchema);
