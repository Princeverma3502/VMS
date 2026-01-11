import mongoose from 'mongoose';

const sessionHistorySchema = mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  archivedAt: { type: Date, default: Date.now },
  usersSnapshot: { type: Array, default: [] },
  meetingsSnapshot: { type: Array, default: [] },
  tasksSnapshot: { type: Array, default: [] },
  audit: { type: Array, default: [] }
}, { timestamps: true });

export default mongoose.model('SessionHistory', sessionHistorySchema);
