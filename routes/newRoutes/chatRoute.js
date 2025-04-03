const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/chatController');
const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');

router.post('/history/private', requireLogin, chatController.getPrivateChatHistory);
router.post('/history/client', requireLogin, chatController.getClientChatHistory);

module.exports = router;