// const mongoose = require('mongoose');

// const SubtaskSchema = new mongoose.Schema({
//   content: { type: String, required: true },
//   isCompleted: { type: Boolean, default: false },
// });

// const ReminderSchema = new mongoose.Schema({
//   date: { type: Date, required: true },
//   time: { type: String, required: true },
//   recurring: { type: Boolean, default: false },
//   recurringType: { type: String, enum: ['daily', 'weekly', 'monthly'] },
// });

// const AttachmentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   url: { type: String, required: true },
//   type: { type: String },
// });

// const NoteSchema = new mongoose.Schema({
//        superAdminId: {
//           type: mongoose.Schema.Types.ObjectId,
//           required: true,
//           ref: 'SuperAdminModel',
//         },
//   title: { type: String, required: true },
//   content: { type: String, default: '' },
//   priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
//   isPinned: { type: Boolean, default: false },
//   isArchived: { type: Boolean, default: false },
//   subtasks: [SubtaskSchema],
//   reminders: [ReminderSchema],
//   attachments: [AttachmentSchema],
// }, { timestamps: true });

// module.exports = mongoose.model('Note', NoteSchema);












const mongoose = require('mongoose');

const SubtaskSchema = new mongoose.Schema({
  content: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
});

const ReminderSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
  recurring: { type: Boolean, default: false },
  recurringType: { type: String, enum: ['daily', 'weekly', 'monthly'] },
});

const AttachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String },
});

const NoteSchema = new mongoose.Schema({
  superAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'SuperAdminModel',
  },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  priority: { type: String, enum: ['urgent','high', 'medium', 'low'], default: 'low' },
  isPinned: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  subtasks: [SubtaskSchema],
  reminders: [ReminderSchema],
  attachments: [AttachmentSchema],
}, { timestamps: true });

NoteSchema.index({ superAdminId: 1 });  // Add index for faster lookups by superAdminId

module.exports = mongoose.model('Note', NoteSchema);
