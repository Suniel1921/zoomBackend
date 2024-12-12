const mongoose = require('mongoose');

// Define the Service Schema
const OtherServiceSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, required: true,  ref: 'ClientModel' },
  serviceTypes: {
    type: [String],
    enum: [
        'Immigration Form Filling',
        'Working Visa Documentation',
        'Air Ticketing',
        'Digital Marketing',
        'Paid Consultation',
        'CV Creation',
        'Reason Letter Writing',
        'Website Design',
        'Photography',
        'Other',     
      ], 
    required: true,
  },
  otherServiceDetails: { type: String,
    required: function() { return this.serviceTypes.includes('Other'); } },
  contactChannel: {
    type: String,
    enum: ['Viber', 'Facebook', 'WhatsApp', 'Friend', 'Office Visit'],
    required: true,
  },
  deadline: {
    type: Date,
    required: true
  },
  amount: { type: Number,
     min: 0,
     required: true
    },
  paidAmount: {
    type: Number,
    min: 0,
    required: true
  },
  discount: { type: Number,
    min: 0,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Furicomy', 'Counter Cash', 'Credit Card', 'Paypay', 'Line Pay'],
  },
  handledBy: { type: String,
    // required: true
  },
  jobStatus: {
    type: String,
    enum: ['Details Pending', 'Under Process', 'Completed'],
    required: true,
  },
  remarks: { type: String },
  dueAmount: { type: Number, min: 0, default: function() { return this.amount - (this.paidAmount + this.discount); } },
  paymentStatus: {
    type: String,
    enum: ['Due', 'Paid'],
    default: function() { return this.dueAmount > 0 ? 'Due' : 'Paid'; },
  },
}, { timestamps: true });

// Create the Service model
const OtherServiceModel = mongoose.model('OtherServiceModel', OtherServiceSchema);
module.exports = OtherServiceModel;
