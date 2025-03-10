const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminModel',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminModel',
    required: true
  },
  type: {
    type: String,
    enum: ['TASK_ASSIGNED', 'TASK_UPDATED', 'TASK_COMPLETED'],
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'taskModel',
    required: true
  },
  taskModel: {
    type: String,
    required: true,
    enum: ['ePassportModel', 'ApplicationModel', 'japanVisitApplicationModel', 'documentTranslationModel', 'OtherServiceModel', 'GraphicDesignModel'] // Add other models as needed
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const NotificationModel = mongoose.model('Notification', notificationSchema);
module.exports = NotificationModel;