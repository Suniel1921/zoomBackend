const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/chatController');
const { requireLogin } = require('../../middleware/newMiddleware/authMiddleware');

router.post('/history/private', requireLogin, chatController.getPrivateChatHistory);
router.post('/history/group', requireLogin, chatController.getGroupChatHistory);
router.post('/history/client', requireLogin, chatController.getClientChatHistory);
router.post('/group/create', requireLogin, chatController.createGroup);
router.get('/group/list', requireLogin, chatController.getGroupList);
router.get('/client/conversations', requireLogin, chatController.getClientConversations);

module.exports = router;