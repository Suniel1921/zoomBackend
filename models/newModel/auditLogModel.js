// models/newModel/auditLogModel.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: { type: String, required: false }, // e.g., 'login', 'logout', 'create', 'update', etc.
  userType: { type: String, required: false }, // 'admin', 'superadmin', 'user'
  // userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of the user performing the action
  name: { type: String, required: false }, // Name of the user
  ipAddress: { type: String }, // Captures user's IP address
  timestamp: { type: Date, default: Date.now },
  details: { type: Object }, // Additional details (optional)
});

const AuditLog = mongoose.model('AuditLog', logSchema);
module.exports = AuditLog;