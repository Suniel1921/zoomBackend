const webSocketService = require('../config/webSocketService');
const NotificationModel = require('../models/newModel/notificationModel');

exports.createNotification = async ({ recipientId, senderId, type, taskId, taskModel, message }) => {
  try {
    const notification = new NotificationModel({
      recipient: recipientId,
      sender: senderId,
      type,
      taskId,
      taskModel,
      message: message || 'You have a new notification'
    });

    await notification.save();

    // Populate sender information before sending the notification
    const populatedNotification = await NotificationModel.findById(notification._id)
      .populate('sender', 'name')
      .lean();

    // Send real-time notification with populated data
    webSocketService.sendNotification(recipientId, {
      type: 'NEW_NOTIFICATION',
      data: populatedNotification
    });

    return populatedNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await NotificationModel.find({ recipient: req.user._id })
      .populate('sender', 'name')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await NotificationModel.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await NotificationModel.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};