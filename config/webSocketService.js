const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { ConversationModel, GroupModel } = require('../models/newModel/chatModel');
const AdminModel = require("../models/newModel/adminModel");
const SuperAdminModel = require("../models/newModel/superAdminModel");

class WebSocketService {
  constructor() {
    this.clients = new Map();
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', async (ws, req) => {
      try {
        const token = new URL(req.url, 'ws://localhost').searchParams.get('token');
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decoded._id.toString();
        this.clients.set(userId, ws);

        ws.on('message', async (message) => {
          const data = JSON.parse(message.toString());
          await this.handleMessage(data, userId, decoded.role);
        });

        ws.on('close', () => {
          this.clients.delete(userId);
          console.log(`WebSocket disconnected: ${userId}`);
        });

        ws.on('error', (error) => {
          console.error(`WebSocket error for ${userId}:`, error);
        });

        ws.send(JSON.stringify({ type: 'CONNECTED', userId }));
        console.log(`WebSocket connected: ${userId}`);
      } catch (error) {
        console.error('WebSocket connection error:', error);
        ws.terminate();
      }
    });
  }

  async handleMessage(data, senderId, senderRole) {
    let Model;
    switch (senderRole) {
      case 'superadmin':
        Model = SuperAdminModel;
        break;
      case 'admin':
        Model = AdminModel;
        break;
      default:
        console.error('Invalid sender role:', senderRole);
        return;
    }

    try {
      switch (data.type) {
        case 'PRIVATE_MESSAGE':
          await this.handlePrivateMessage(senderId, data.toUserId, data.content, Model);
          break;
        case 'GROUP_MESSAGE':
          await this.handleGroupMessage(senderId, data.groupId, data.content, Model);
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  async handlePrivateMessage(fromId, toId, content, FromModel) {
    try {
      const participants = [fromId, toId].sort();
      let conversation = await ConversationModel.findOne({ participants });

      if (!conversation) {
        conversation = new ConversationModel({ participants });
      }

      const message = {
        from: fromId,
        content,
        timestamp: new Date(),
        read: false
      };

      conversation.messages.push(message);
      conversation.lastUpdated = new Date();
      const savedConversation = await conversation.save();

      const newMessage = savedConversation.messages[savedConversation.messages.length - 1];
      const sender = await FromModel.findById(fromId).select('name superAdminPhoto').lean();
      const populatedMessage = {
        _id: newMessage._id,
        from: {
          _id: fromId,
          name: sender.name,
          superAdminPhoto: sender.superAdminPhoto
        },
        content: newMessage.content,
        timestamp: newMessage.timestamp,
        read: newMessage.read
      };

      [fromId, toId].forEach(id => {
        const ws = this.clients.get(id);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'PRIVATE_MESSAGE',
            conversationId: savedConversation._id,
            message: populatedMessage
          }));
        }
      });
    } catch (error) {
      console.error('Error handling private message:', error);
      throw error;
    }
  }

  async handleGroupMessage(fromId, groupId, content, FromModel) {
    try {
      const group = await GroupModel.findById(groupId);
      if (!group || !group.members.includes(fromId)) return;

      const message = {
        from: fromId,
        content,
        timestamp: new Date(),
        read: false
      };

      group.messages.push(message);
      group.lastUpdated = new Date();
      const savedGroup = await group.save();

      const newMessage = savedGroup.messages[savedGroup.messages.length - 1];
      const sender = await FromModel.findById(fromId).select('name superAdminPhoto').lean();
      const populatedMessage = {
        _id: newMessage._id,
        from: {
          _id: fromId,
          name: sender.name,
          superAdminPhoto: sender.superAdminPhoto
        },
        content: newMessage.content,
        timestamp: newMessage.timestamp,
        read: newMessage.read
      };

      group.members.forEach(userId => {
        const ws = this.clients.get(userId.toString());
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'GROUP_MESSAGE',
            groupId,
            message: populatedMessage
          }));
        }
      });
    } catch (error) {
      console.error('Error handling group message:', error);
      throw error;
    }
  }
}

module.exports = new WebSocketService();