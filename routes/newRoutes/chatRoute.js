// chatRoute.js

const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/chatController');
const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');

router.post('/history/private', requireLogin, chatController.getPrivateChatHistory);

// Newly added route for client chat history
router.post('/history/client', requireLogin, chatController.getClientChatHistory);

router.post('/history/group', requireLogin, chatController.getGroupChatHistory);
router.post('/group/create', requireLogin, chatController.createGroup);
router.get('/group/list', requireLogin, chatController.getGroupList);
router.post('/markAsRead', requireLogin, chatController.markMessagesAsRead);

module.exports = router;