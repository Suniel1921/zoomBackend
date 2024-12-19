const mongoose = require('mongoose');
const defaultSteps = require('./defaultSteps');

const epassportSchema = new mongoose.Schema({
    superAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'SuperAdminModel',
      },

    clientId: { type: mongoose.Schema.Types.ObjectId,
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

  mobileNo: {
    type: String,
    required: true
},
  contactChannel: {
    type: String,
    enum: ['Viber', 'Facebook', 'WhatsApp', 'Friend', 'Office Visit'],
    required: true,
  },
  applicationType: {
    type: String,
    enum: [
      'Newborn Child',
      'Passport Renewal',
      'Lost Passport',
      'Damaged Passport',
      'Travel Document',
      'Birth Registration',
    ],
    required: true,
  },
  ghumtiService: {
    type: Boolean,
    required: true
},
  prefecture: {type: String,
    required: false
},
  amount: {type: Number,
    min: 0,
    required: true
},
  paidAmount: {type: Number,
    min: 0,
    required: true
},
  discount: {type: Number,
    min: 0,
    required: true
},
  paymentStatus: {
    type: String,
    enum: ['Due', 'Paid'],
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Furicomy', 'Counter Cash', 'Credit Card', 'Paypay', 'Line Pay'],
    required: false,
  },
  applicationStatus: {
    type: String,
    enum: [
      'Details Pending',
      'Ready to Process',
      'Under Progress',
      'Cancelled',
      'Completed',
    ],
    required: true,
  },
  dataSentStatus: {
    type: String,
    enum: ['Not Sent', 'Sent'],
    required: true,
  },
  handledBy: {
    type: String,
    // required: true
},
  date: {
    type: Date,
    required: true
},
  deadline: {
    type: Date,
    required: true
},
  remarks: {
    type: String,
    required: false
},
},{timestamps: true});



// Middleware to auto-populate steps if not provided
epassportSchema.pre('save', function (next) {
  if (!this.steps || this.steps.length === 0) {
    this.steps = defaultSteps.ePassportStep; // Populate default steps
  }
  next();
});

const ePassportModel = mongoose.model('ePassportModel', epassportSchema);

module.exports = ePassportModel;


