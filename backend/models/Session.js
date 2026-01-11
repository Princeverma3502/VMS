import mongoose from 'mongoose';

const sessionSchema = mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);
