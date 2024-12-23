const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  superAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdminModel',
    required: false,
  },
  clientName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  serviceName: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

const ServiceRequestModel = mongoose.model('ServiceRequestModel', serviceRequestSchema);
module.exports = ServiceRequestModel;
