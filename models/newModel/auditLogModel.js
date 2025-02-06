const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: { type: String, required: true },
  userType: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: false },
  userName: { type: String, required: true },
  ipAddress: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: mongoose.Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

// Add index for better query performance
logSchema.index({ timestamp: -1 });
logSchema.index({ userType: 1, action: 1 });

const AuditLog = mongoose.model('AuditLog', logSchema);
module.exports = AuditLog;