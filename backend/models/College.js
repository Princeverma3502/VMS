import mongoose from 'mongoose';

const collegeSchema = mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logoUrl: { type: String, default: '' },
  primaryColor: { type: String, default: '#1d4ed8' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('College', collegeSchema);
