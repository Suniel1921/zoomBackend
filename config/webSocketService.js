// src/config/webSocketService.js
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { ConversationModel, GroupModel, ClientConversationModel } = require('../models/newModel/chatModel');
const AdminModel = require('../models/newModel/adminModel');
const SuperAdminModel = require('../models/newModel/superAdminModel');
const ClientModel = require('../models/newModel/clientModel');

class WebSocketService {
  constructor() {
    this.clients = new Map();
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', async (ws, req) => {
      try {
        const url = new URL(req.url, process.env.WS_URL || 'ws://localhost:3000');
        const token = url.searchParams.get('token');
        if (!token) throw new Error('No token provided');

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decoded._id.toString();
        this.clients.set(userId, ws);

        this.broadcastOnlineStatus();

        ws.on('message', async (message) => {
          try {
            const data = JSON.parse(message.toString());
            await this.handleMessage(data, userId, decoded.role);
          } catch (error) {
            this.sendError(ws, 'Invalid message format');
          }
        });

        ws.on('close', () => {
          this.clients.delete(userId);
          this.broadcastOnlineStatus();
        });

        ws.on('error', (error) => console.error(`WebSocket error for ${userId}:`, error));
        this.sendToClient(ws, { type: 'CONNECTED', userId });
      } catch (error) {
        ws.close(1008, 'Authentication failed');
      }
    });
  }

  sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  sendError(ws, message) {
    this.sendToClient(ws, { type: 'ERROR', message });
  }

  broadcastOnlineStatus() {
    const onlineUsers = Array.from(this.clients.keys());
    this.broadcast({ type: 'ONLINE_USERS', users: onlineUsers });
  }

  broadcast(message, excludeUserId = null) {
    const messageString = JSON.stringify(message);
    this.clients.forEach((client, userId) => {
      if (userId !== excludeUserId && client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  }

  async handleMessage(data, senderId, senderRole) {
    const FromModel = senderRole === 'superadmin' ? SuperAdminModel : 
                    senderRole === 'client' ? ClientModel : AdminModel;

    switch (data.type) {
      case 'PRIVATE_MESSAGE':
        await this.handlePrivateMessage(senderId, data.toUserId, data.content, FromModel);
        break;
      case 'GROUP_MESSAGE':
        await this.handleGroupMessage(senderId, data.groupId, data.content, FromModel);
        break;
      case 'CLIENT_MESSAGE':
        await this.handleClientMessage(senderId, data.clientId || senderId, data.content, 
          data.adminThatReplied, FromModel);
        break;
      case 'TYPING':
        await this.handleTyping(senderId, data.chatId, data.chatType);
        break;
    }
  }

  async handlePrivateMessage(fromId, toId, content, FromModel) {
    if (!toId || !content) return;

    const participants = [fromId, toId].sort();
    let conversation = await ConversationModel.findOne({ participants }) || 
                     new ConversationModel({ participants });
    const message = { from: fromId, content, timestamp: new Date(), read: this.clients.has(toId) };
    conversation.messages.push(message);
    conversation.lastUpdated = new Date();
    const savedConversation = await conversation.save();

    const newMessage = savedConversation.messages[savedConversation.messages.length - 1];
    const sender = await FromModel.findById(fromId).select('name superAdminPhoto').lean();
    const populatedMessage = this.populateMessage(newMessage, sender);

    [fromId, toId].forEach(userId => {
      const ws = this.clients.get(userId);
      if (ws) this.sendToClient(ws, { 
        type: 'PRIVATE_MESSAGE', 
        conversationId: savedConversation._id.toString(), 
        message: populatedMessage 
      });
    });
  }

  async handleGroupMessage(fromId, groupId, content, FromModel) {
    if (!groupId || !content) return;

    const group = await GroupModel.findById(groupId);
    if (!group || !group.members.map(m => m.toString()).includes(fromId)) return;

    const message = { from: fromId, content, timestamp: new Date(), read: false };
    group.messages.push(message);
    group.lastUpdated = new Date();
    const savedGroup = await group.save();

    const newMessage = savedGroup.messages[savedGroup.messages.length - 1];
    const sender = await FromModel.findById(fromId).select('name superAdminPhoto').lean();
    const populatedMessage = this.populateMessage(newMessage, sender);

    group.members.forEach(userId => {
      const ws = this.clients.get(userId.toString());
      if (ws) this.sendToClient(ws, { 
        type: 'GROUP_MESSAGE', 
        groupId, 
        message: populatedMessage 
      });
    });
  }

  async handleClientMessage(senderId, clientId, content, adminThatReplied, FromModel) {
    if (!content) return;

    let conversation = await ClientConversationModel.findOne({ clientId }) || 
                     new ClientConversationModel({ clientId });
    const message = { 
      from: senderId, 
      content, 
      timestamp: new Date(), 
      read: false, 
      adminThatReplied: adminThatReplied || null 
    };
    conversation.messages.push(message);
    conversation.lastUpdated = new Date();
    const savedConversation = await conversation.save();

    const newMessage = savedConversation.messages[savedConversation.messages.length - 1];
    const sender = await FromModel.findById(senderId).select('name fullName profilePhoto superAdminPhoto').lean();
    const populatedMessage = this.populateMessage(newMessage, sender, adminThatReplied);

    const allUsers = await Promise.all([
      AdminModel.find().select('_id').lean(),
      SuperAdminModel.find().select('_id').lean(),
      ClientModel.findById(clientId).select('_id').lean()
    ]).then(([admins, superAdmins, client]) => [
      ...admins.map(a => a._id.toString()),
      ...superAdmins.map(s => s._id.toString()),
      client?._id.toString()
    ].filter(Boolean));

    allUsers.forEach(userId => {
      const ws = this.clients.get(userId);
      if (ws) {
        this.sendToClient(ws, { 
          type: 'CLIENT_MESSAGE', 
          clientId, 
          message: populatedMessage 
        });
      }
    });
  }

  async handleTyping(senderId, chatId, chatType) {
    const message = { type: 'TYPING', chatId, chatType, userId: senderId };
    if (chatType === 'private') {
      const participants = chatId.split('-');
      const recipientId = participants.find(id => id !== senderId);
      const ws = this.clients.get(recipientId);
      if (ws) this.sendToClient(ws, message);
    } else if (chatType === 'group') {
      const group = await GroupModel.findById(chatId);
      if (group) group.members.forEach(userId => {
        if (userId.toString() !== senderId) {
          const ws = this.clients.get(userId.toString());
          if (ws) this.sendToClient(ws, message);
        }
      });
    } else if (chatType === 'client') {
      const admins = await Promise.all([
        AdminModel.find().select('_id').lean(),
        SuperAdminModel.find().select('_id').lean()
      ]).then(([admins, superAdmins]) => [...admins, ...superAdmins].map(a => a._id.toString()));
      admins.forEach(userId => {
        if (userId !== senderId) {
          const ws = this.clients.get(userId);
          if (ws) this.sendToClient(ws, message);
        }
      });
    }
  }

  populateMessage(message, sender, adminThatReplied = null) {
    return {
      _id: message._id.toString(),
      from: {
        _id: sender._id,
        name: sender.name || sender.fullName,
        superAdminPhoto: sender.superAdminPhoto || sender.profilePhoto || null
      },
      content: message.content,
      timestamp: message.timestamp.toISOString(),
      read: message.read,
      adminThatReplied
    };
  }
}

module.exports = new WebSocketService();