// const mongoose = require('mongoose');

// const serviceRequestSchema = new mongoose.Schema({
//   superAdminId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'SuperAdminModel',
//     required: false,
//   },
//   clientId: {
//     type: String,
//     required: true,
//   },
//   clientName: {
//     type: String,
//     required: true,
//   },
//   phoneNumber: {
//     type: String,
//     required: true,
//   },
//   serviceName: {
//     type: String,
//     required: true,
//   },
//   message: {
//     type: String,
//     required: true,
//   },
 

//   status: {
//     type: String,
//     enum: ['pending', 'in_progress', 'completed', 'cancelled'], 
//     default: 'pending',
//   },

// }, { timestamps: true });

// const ServiceRequestModel = mongoose.model('ServiceRequestModel', serviceRequestSchema);
// module.exports = ServiceRequestModel;





const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  superAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SuperAdminModel',
    required: false,
  },
  clientId: {
    type: String,
    required: true,
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
    enum: ['pending', 'in_progress', 'completed', 'cancelled'], 
    default: 'pending',
  },
}, { timestamps: true });

const ServiceRequestModel = mongoose.model('ServiceRequestModel', serviceRequestSchema);
module.exports = ServiceRequestModel;
