const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'login', 'logout', 'create', 'update', etc.
  userType: { type: String, required: true }, // 'admin', 'superadmin', 'user'
  superAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdminModel', required: false }, 
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientModel', required: false }, 
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminModel', required: false }, 
  ipAddress: { type: String }, // Captures user's IP address
  timestamp: { type: Date, default: Date.now },
  details: { type: Object }, // Additional details (optional)
});

const AuditLog = mongoose.model('AuditLogs', logSchema);
module.exports = AuditLog;



