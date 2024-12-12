const mongoose = require('mongoose');

const documentTranslationSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'ClientModel',
    required: true
},
  sourceLanguage: {
    type: String,
    enum: ['English', 'Japanese', 'Nepali', 'Hindi'],
    required: true
},
  targetLanguage: {
    type: String,
    enum: ['English', 'Japanese', 'Nepali', 'Hindi'],
    required: true
},
  nameInTargetScript: {
    type: String,
    required: true
},
  pages: {
    type: Number,
    min: 1,
    required: true,
},
  amount: { 
    type: Number,
    min: 0,
    required: true,
},
  paymentStatus: {
    type: String,
    enum: ['Due', 'Paid'],
    required: true
},
  paymentMethod: {
    type: String,
    enum: ['Counter Cash', 'Bank Transfer', 'Credit Card', 'Paypay', 'Line Pay']
 },
  handledBy: {
    type: String,
    required: true
},
  deadline: {
    type: Date,
    required: true
},
  translationStatus: {
    type: String,
    enum: ['Not Started', 'Processing', 'Completed', 'Delivered'],
    required: true
},
  deliveryType: {
    type: String,
    enum: ['Office Pickup', 'Sent on Email', 'Sent on Viber', 'Sent on Facebook', 'By Post'],
    required: true
},
},{timestamps: true});

const documentTranslationModel = mongoose.model('documentTranslationModel', documentTranslationSchema);
module.exports = documentTranslationModel;
