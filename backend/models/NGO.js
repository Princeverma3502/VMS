import mongoose from 'mongoose';

const ngoSchema = mongoose.Schema({
  name: { type: String, required: true },
  logoUrl: { type: String },
  description: { type: String },
  
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  
  // Who brought this NGO to the platform?
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

export default mongoose.model('NGO', ngoSchema);