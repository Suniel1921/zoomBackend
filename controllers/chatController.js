// src/controllers/chatController.js
const { ConversationModel, ClientConversationModel } = require('../models/newModel/chatModel');
const AdminModel = require('../models/newModel/adminModel');
const SuperAdminModel = require('../models/newModel/superAdminModel');
const ClientModel = require('../models/newModel/clientModel');

const getPrivateChatHistory = async (req, res) => {
  const { otherUserId } = req.body;
  const { _id: userId, role: userRole } = req.user;

  try {
    const participants = [userId, otherUserId].sort();
    const conversation = await ConversationModel.findOne({ participants })
      .populate({
        path: 'messages.from',
        select: 'name superAdminPhoto profilePhoto fullName',
        model: userRole === 'superadmin' ? SuperAdminModel : AdminModel
      })
      .lean();

    res.json({ success: true, messages: conversation?.messages || [] });
  } catch (error) {
    console.error('Error fetching private chat history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chat history' });
  }
};

const getClientChatHistory = async (req, res) => {
  const { clientId } = req.body;
  const { _id: userId, role: userRole } = req.user;

  try {
    const conversation = await ClientConversationModel.findOne({ clientId })
      .populate({
        path: 'messages.from',
        select: 'name superAdminPhoto fullName profilePhoto',
        model: userRole === 'superadmin' ? SuperAdminModel : userRole === 'client' ? ClientModel : AdminModel
      })
      .lean();

    const messages = conversation?.messages?.filter(msg => msg.from !== null) || [];
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching client chat history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chat history' });
  }
};

module.exports = {
  getPrivateChatHistory,
  getClientChatHistory,
};