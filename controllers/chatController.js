const AdminModel = require('../models/newModel/adminModel');
const SuperAdminModel = require('../models/newModel/superAdminModel');
const { ConversationModel, GroupModel } = require('../models/newModel/chatModel');
const webSocketService = require('../config/webSocketService');

const getPrivateChatHistory = async (req, res) => {
  const { otherUserId } = req.body;
  const userId = req.user._id;
  const userRole = req.user.role;

  try {
    const participants = [userId, otherUserId].sort();
    const conversation = await ConversationModel.findOne({ participants })
      .populate({
        path: 'messages.from',
        select: 'name superAdminPhoto',
        model: userRole === 'superadmin' ? SuperAdminModel : AdminModel,
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
  const userId = req.user._id;
  const userRole = req.user.role;

  try {
    const group = await GroupModel.findById(groupId)
      .populate({
        path: 'messages.from',
        select: 'name superAdminPhoto',
        model: userRole === 'superadmin' ? SuperAdminModel : AdminModel,
      })
      .lean();

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }
    if (!group.members.includes(userId)) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this group' });
    }

    res.json({ success: true, messages: group.messages });
  } catch (error) {
    console.error('Error fetching group chat history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch group chat history' });
  }
};

const markMessagesAsRead = async (req, res) => {
  const { chatId, isGroup } = req.body;
  const userId = req.user._id;

  try {
    if (isGroup) {
      const group = await GroupModel.findById(chatId);
      if (!group || !group.members.includes(userId)) {
        return res.status(403).json({ success: false, error: 'Not authorized' });
      }
      group.messages = group.messages.map(msg => ({
        ...msg,
        read: msg.from.toString() !== userId ? true : msg.read,
      }));
      await group.save();
    } else {
      const participants = [userId, chatId].sort();
      const conversation = await ConversationModel.findOne({ participants });
      if (!conversation) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }
      conversation.messages = conversation.messages.map(msg => ({
        ...msg,
        read: msg.from.toString() !== userId ? true : msg.read,
      }));
      await conversation.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark messages as read' });
  }
};

const createGroup = async (req, res) => {
  const { name, members } = req.body;
  const createdBy = req.user._id;

  if (!name || !members || !Array.isArray(members)) {
    return res.status(400).json({ success: false, error: 'Name and members are required' });
  }

  try {
    const group = new GroupModel({
      name,
      members: [...new Set([...members, createdBy])],
      createdBy,
    });
    await group.save();

    const FromModel = req.user.role === 'superadmin' ? SuperAdminModel : AdminModel;
    const creator = await FromModel.findById(createdBy).select('name').lean();
    group.members.forEach(userId => {
      const ws = webSocketService.clients.get(userId.toString());
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'GROUP_CREATED',
          group: { _id: group._id, name: group.name },
          createdBy: createdBy,
          createdByName: creator.name,
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
  const userId = req.user._id;

  try {
    const groups = await GroupModel.find({ members: userId })
      .select('name _id lastUpdated')
      .lean();
    res.json({ success: true, groups });
  } catch (error) {
    console.error('Error fetching group list:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch group list' });
  }
};

module.exports = {
  getPrivateChatHistory,
  getGroupChatHistory,
  createGroup,
  getGroupList,
  markMessagesAsRead,
};




