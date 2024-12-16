const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    // clientId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'ClientId',
    //   required: true,
    // },
    clientName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    // serviceId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Service',
    //   required: true,
    // },
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
  },
  { timestamps: true }
);


const ServiceRequestModel = mongoose.model('ServiceRequestModel', serviceRequestSchema);
module.exports = ServiceRequestModel;
