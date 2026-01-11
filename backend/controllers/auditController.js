import AuditLog from '../models/AuditLog.js';

// @desc    Get all system audit logs
// @route   GET /api/audit/logs
// @access  Private/Secretary
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({})
      .populate('performedBy', 'name role')
      .populate('targetUser', 'name')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 for performance

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching audit logs" });
  }
};