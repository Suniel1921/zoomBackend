
const mongoose = require('mongoose');


// Define Mongoose schema and model for the application data
const japanVistiApplicationSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, required: true,  ref: 'ClientModel' },
  step:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApplicationStepModel',
    // required: true,
  },

  mobileNo: { type: String, required: true },
  date: { type: Date, required: true },
  deadline: { type: Date, required: true },
  handledBy: {
    type: String,
    //  required: true
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



const japanVisitAppplicaitonModel = mongoose.model('japanVisitApplicationModel', japanVistiApplicationSchema);
module.exports = japanVisitAppplicaitonModel;
