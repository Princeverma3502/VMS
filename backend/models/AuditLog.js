import mongoose from 'mongoose';

const auditLogSchema = mongoose.Schema({
  action: { type: String, required: true }, // e.g., "TASK_VERIFIED", "PASSWORD_RESET"
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetEntity: { type: String }, // e.g., Task ID or NGO Name
  details: { type: String },
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);