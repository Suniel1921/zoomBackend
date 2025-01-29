const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  category: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Campaign', campaignSchema);