const { ConversationModel, ClientConversationModel } = require('../models/newModel/chatModel');
const AdminModel = require('../models/newModel/adminModel');
const SuperAdminModel = require('../models/newModel/superAdminModel');
const ClientModel = require('../models/newModel/clientModel');
const mongoose = require ('mongoose')


const getPrivateChatHistory = async (req, res) => {
  const { otherUserId, page = 1, limit = 50 } = req.body;
  const { _id: userId, role: userRole } = req.user;

  try {
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const participants = [userId, otherUserId].sort();
    const conversation = await ConversationModel.findOne({ participants })
      .populate({
        path: 'messages.from',
        select: 'name superAdminPhoto profilePhoto fullName',
        model: userRole === 'superadmin' ? SuperAdminModel : AdminModel
      })
      .lean();

    const messages = conversation?.messages || [];
    const paginatedMessages = messages.slice((page - 1) * limit, page * limit);

    res.json({ success: true, messages: paginatedMessages, total: messages.length });
  } catch (error) {
    console.error('Error fetching private chat history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chat history' });
  }
};

const getClientChatHistory = async (req, res) => {
  try {
    const { clientId } = req.body;
    const user = req.user; // Assuming user is attached via middleware

    if (!clientId) {
      return res.status(400).json({ message: 'Client ID is required' });
    }

    const conversation = await ClientConversationModel.findOne({ clientId }).lean();
    if (!conversation) {
      return res.status(200).json({ messages: [] });
    }

    const messages = await Promise.all(
      conversation.messages.map(async (msg) => {
        const senderModel =
          msg.from.toString() === user._id.toString()
            ? user.role === 'superadmin'
              ? SuperAdminModel
              : user.role === 'client'
              ? ClientModel
              : AdminModel
            : msg.adminThatReplied
            ? msg.adminThatReplied === user._id.toString()
              ? user.role === 'superadmin'
                ? SuperAdminModel
                : AdminModel
              : AdminModel
            : ClientModel;

        const sender = await senderModel
          .findById(msg.from)
          .select('name fullName profilePhoto superAdminPhoto')
          .lean();

        return {
          _id: msg._id.toString(),
          from: {
            _id: sender._id.toString(),
            name: sender.name || sender.fullName || 'Unknown',
            profilePhoto: sender.profilePhoto || sender.superAdminPhoto || null,
          },
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          read: msg.read,
          adminThatReplied: msg.adminThatReplied?.toString() || null,
        };
      })
    );

    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching client chat history:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


module.exports = { getPrivateChatHistory, getClientChatHistory };