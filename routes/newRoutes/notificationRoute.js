const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notificationController');
const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');

router.get('/getNotifications', requireLogin, notificationController.getNotifications);
router.post('/markAsRead', requireLogin, notificationController.markAsRead);
router.delete('/:id', requireLogin, notificationController.deleteNotification);

module.exports = router;