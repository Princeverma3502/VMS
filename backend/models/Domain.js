import mongoose from 'mongoose';

const domainSchema = mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  // Reference to the User who is the Head
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // List of Associate Heads
  associates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  collaborationEnabled: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Domain', domainSchema);