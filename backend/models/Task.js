import mongoose from 'mongoose';

const taskSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  
  // Which domains are responsible for this task?
  assignedDomains: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain'
  }],
  
  // Specific users assigned
  assignedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Verified'],
    default: 'Pending'
  },

  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', index: true },
  
  deadline: { type: Date }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);