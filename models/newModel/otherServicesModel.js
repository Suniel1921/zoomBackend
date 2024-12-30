const mongoose = require('mongoose');
const defaultSteps = require('./defaultSteps');

// Define the Service Schema
const OtherServiceSchema = new mongoose.Schema({
  superAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'SuperAdminModel',
  },
  
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, 
      ref: 'ClientModel'
    },
    clientFiles: {
      type: [String], // Array of URLs
      default: [], // Default to empty array
    },
    


    steps: [
      {
        name: { type: String, required: true },
        status: {
          type: String,
          enum: ['pending', 'completed', 'in-progress', 'processing'],
          default: 'complted',
        },
        updatedAt: { type: Date, default: Date.now },
      },
    ],




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

  dueAmount: {
    type: Number,
    //  min: 0,
     default: function() { return this.amount - (this.paidAmount + this.discount); } },
  paymentStatus: {
    type: String,
    enum: ['Due', 'Paid'],
    default: function() { return this.dueAmount > 0 ? 'Due' : 'Paid'; },
  },
}, { timestamps: true });


// Middleware to auto-populate steps if not provided
OtherServiceSchema.pre('save', function (next) {
  if (!this.steps || this.steps.length === 0) {
    this.steps = defaultSteps.otherServiceStep; // Populate default steps
  }
  next();
});

// Create the Service model
const OtherServiceModel = mongoose.model('OtherServiceModel', OtherServiceSchema);
module.exports = OtherServiceModel;
