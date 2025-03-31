// src/controllers/chatController.js
const { ConversationModel, GroupModel, ClientConversationModel } = require('../models/newModel/chatModel');
const AdminModel = require('../models/newModel/adminModel');
const SuperAdminModel = require('../models/newModel/superAdminModel');
const ClientModel = require('../models/newModel/clientModel');
const webSocketService = require('../config/webSocketService');

const getPrivateChatHistory = async (req, res) => {
  const { otherUserId } = req.body;
  const { _id: userId, role: userRole } = req.user;

  try {
    const participants = [userId, otherUserId].sort();
    const conversation = await ConversationModel.findOne({ participants })
      .populate({
        path: 'messages.from',
        select: 'name superAdminPhoto',
        model: userRole === 'superadmin' ? SuperAdminModel : AdminModel
      })
      .lean();

    res.json({ success: true, messages: conversation?.messages || [] });
  } catch (error) {
    console.error('Error fetching private chat history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chat history' });
  }
};

const getGroupChatHistory = async (req, res) => {
  const { groupId } = req.body;
  const { _id: userId, role: userRole } = req.user;

  try {
    const group = await GroupModel.findById(groupId)
      .populate({
        path: 'messages.from',
        select: 'name superAdminPhoto',
        model: userRole === 'superadmin' ? SuperAdminModel : AdminModel
      })
      .lean();

    if (!group || !group.members.includes(userId)) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    res.json({ success: true, messages: group.messages });
  } catch (error) {
    console.error('Error fetching group chat history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch group chat history' });
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

const createGroup = async (req, res) => {
  const { name, members } = req.body;
  const { _id: createdBy, role: userRole } = req.user;

  if (!name || !members || !Array.isArray(members)) {
    return res.status(400).json({ success: false, error: 'Name and members are required' });
  }

  try {
    const group = new GroupModel({
      name,
      members: [...new Set([...members, createdBy])],
      createdBy
    });
    await group.save();

    const FromModel = userRole === 'superadmin' ? SuperAdminModel : AdminModel;
    const creator = await FromModel.findById(createdBy).select('name').lean();

    group.members.forEach(userId => {
      const ws = webSocketService.clients.get(userId.toString());
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'GROUP_CREATED',
          group: { _id: group._id, name: group.name },
          createdBy,
          createdByName: creator.name
        }));
      }
    });

    res.status(201).json({ success: true, group });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ success: false, error: 'Failed to create group' });
  }
};

const getGroupList = async (req, res) => {
  const { _id: userId } = req.user;

  try {
    const groups = await GroupModel.find({ members: userId }).select('name _id lastUpdated').lean();
    res.json({ success: true, groups });
  } catch (error) {
    console.error('Error fetching group list:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch group list' });
  }
};

const getClientConversations = async (req, res) => {
  try {
    const conversations = await ClientConversationModel.find({}).select('clientId').lean();
    res.json({ success: true, conversations });
  } catch (error) {
    console.error('Error fetching client conversations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch client conversations' });
  }
};

module.exports = {
  getPrivateChatHistory,
  getGroupChatHistory,
  getClientChatHistory,
  createGroup,
  getGroupList,
  getClientConversations,
};