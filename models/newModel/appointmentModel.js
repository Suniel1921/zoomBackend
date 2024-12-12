const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, required: true,  ref: 'ClientModel' },
  type: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true },
  meetingType: { type: String, enum: ['physical', 'online'], required: true },
  location: { type: String },
  meetingLink: { type: String },
  notes: { type: String },
  sendReminder: { type: Boolean, default: false },
  reminderType: { type: String, enum: ['email', 'sms', 'both'] },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  isRecurring: { type: Boolean, default: false },
  recurringFrequency: { type: String, enum: ['weekly', 'biweekly', 'monthly'] },
  recurringEndDate: { type: Date },
}, { timestamps: true });

const AppointmentModel = mongoose.model('AppointmentModel', appointmentSchema);

module.exports = AppointmentModel;
