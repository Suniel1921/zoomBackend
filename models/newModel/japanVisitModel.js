
const mongoose = require('mongoose');
const defaultSteps = require('./defaultSteps');


// Define Mongoose schema and model for the application data
const japanVistiApplicationSchema = new mongoose.Schema({
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

  mobileNo: { type: String, required: true },
  date: { type: Date, required: true },
  deadline: { type: Date, required: true },
  handledBy: {
    type: String,
     required: true
     },
  package: { type: String, enum: ['Standard Package', 'Premium Package'], required: true },
  noOfApplicants: { type: Number, required: true, min: 1 },
  reasonForVisit: { 
    type: String, 
    enum: ['General Visit', 'Baby Care', 'Program Attendance', 'Other'], 
    required: true 
  },
  otherReason: { type: String },

  // Financial Details
  amount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, required: true, min: 0 },
  discount: { type: Number, required: true, min: 0 },
  deliveryCharge: { type: Number, required: true, min: 0 },
  dueAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Due', 'Paid'], required: true },
  paymentMethod: {
    type: String,
    enum: ['Bank Furicomy', 'Counter Cash', 'Credit Card', 'Paypay', 'Line Pay'],
  },
  modeOfDelivery: {
    type: String,
    enum: ['Office Pickup', 'PDF', 'Normal Delivery', 'Blue Letterpack', 'Red Letterpack'],
    required: true,
  },

  // Additional Information
  notes: { type: String },
}, { timestamps: true });




// Middleware to auto-populate steps if not provided
japanVistiApplicationSchema.pre('save', function (next) {
  if (!this.steps || this.steps.length === 0) {
    this.steps = defaultSteps.japanVisitApplicationStep; // Populate default steps
  }
  next();
});




const japanVisitApplicationModel = mongoose.model('japanVisitApplicationModel', japanVistiApplicationSchema);
module.exports = japanVisitApplicationModel;
