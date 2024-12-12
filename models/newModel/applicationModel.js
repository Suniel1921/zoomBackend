// /models/Application.js
const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: true },
});

const applicationSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClientModel',
      required: true
    },



    step:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApplicationStepModel',
      required: true,
    },




    clientName: {
        type: String,
        required: true
    },
    type: {type: String,
        enum: ['Visitor Visa', 'Student Visa', 'Tourist Visa'],
        required: true
    },
    country: {type: String,
        required: true
    },
    documentStatus: {type: String,
        enum: ['Not Yet', 'Few Received', 'Fully Received'],
        required: true
    },
    documentsToTranslate: {type: Number,
        default: 0
    },
    translationStatus: {
        type: String,
        enum: ['Under Process', 'Completed'],
        required: true
    },
    visaStatus: {
        type: String,
        enum: ['Under Review', 'Under Process', 'Waiting for Payment', 'Completed', 'Approved', 'Rejected'],
        required: true
    },
    handledBy: {
        type: String,
        required: true
    },
    translationHandler: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    payment: {
      visaApplicationFee: {
        type: Number,
      default: 0
    },
      translationFee: {
        type: Number,
        default: 0
    },
      paidAmount: {
        type: Number,
        default: 0
    },
      discount: {
        type: Number,
        default: 0
    },
      total: {
        type: Number,
        default: 0
    },
    },
    paymentStatus: {
        type: String,
        enum: ['Due', 'Paid'],
        default: 'Due'
    },
    notes: {
        type: String
    },
    todos: [{
      id: {
        type: String,
        required: true
    },
      task: {
        type: String,
        required: true
    },
      completed: {
        type: Boolean,
        default: false
    },
      priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
      dueDate: {
        type: Date
    },
    }],
    familyMembers: [familyMemberSchema],
    submissionDate: {
        type: Date,
         default: Date.now
        },
  },
  { timestamps: true }
);

const applicationModel = mongoose.model('applicationModel', applicationSchema);
module.exports = applicationModel;
