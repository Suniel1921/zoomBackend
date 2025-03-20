const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { ConversationModel, GroupModel } = require('../models/newModel/chatModel');
const AdminModel = require('../models/newModel/adminModel');
const SuperAdminModel = require('../models/newModel/superAdminModel');

class WebSocketService {
  constructor() {
    this.clients = new Map(); // Map<userId: string, WebSocket>
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', async (ws, req) => {
      try {
        const url = new URL(req.url, 'ws://localhost');
        const token = url.searchParams.get('token');
        if (!token) throw new Error('No token provided');

        const decoded = jwt.verify(token, process.env.SECRET_KEY || 'your-secret-key');
        const userId = decoded._id.toString();
        this.clients.set(userId, ws);

        // Send online users to the new client
        const onlineUsers = Array.from(this.clients.keys());
        this.sendToClient(ws, { type: 'ONLINE_USERS', users: onlineUsers });

        // Notify others of new connection
        this.broadcast({ type: 'USER_ONLINE', userId }, userId);

        ws.on('message', async (message) => {
          try {
            const data = JSON.parse(message.toString());
            await this.handleMessage(data, userId, decoded.role);
          } catch (error) {
            console.error(`Error processing message from ${userId}:`, error);
            this.sendToClient(ws, { type: 'ERROR', message: 'Invalid message format' });
          }
        });

        ws.on('close', () => {
          this.clients.delete(userId);
          this.broadcast({ type: 'USER_OFFLINE', userId }, userId);
          console.log(`WebSocket disconnected: ${userId}`);
        });

        ws.on('error', (error) => {
          console.error(`WebSocket error for ${userId}:`, error);
        });

        this.sendToClient(ws, { type: 'CONNECTED', userId });
        console.log(`WebSocket connected: ${userId}`);
      } catch (error) {
        console.error('WebSocket connection error:', error.message);
        ws.close(1008, 'Authentication failed');
      }
    });
  }

  sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  broadcast(message, excludeUserId) {
    const messageString = JSON.stringify(message);
    for (const [userId, client] of this.clients) {
      if (userId !== excludeUserId && client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    }
  }

  async handleMessage(data, senderId, senderRole) {
    const Model = senderRole === 'superadmin' ? SuperAdminModel : AdminModel;
    if (!Model) {
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
        case 'USER_ONLINE':
          this.broadcast({ type: 'USER_ONLINE', userId: senderId }, senderId);
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  async handlePrivateMessage(fromId, toId, content, FromModel) {
    if (!toId || !content) return;

    try {
      const participants = [fromId, toId].sort();
      let conversation = await ConversationModel.findOne({ participants }) ||
        new ConversationModel({ participants });

      const message = {
        from: fromId,
        content,
        timestamp: new Date(),
        read: this.clients.has(toId), // Mark as read if recipient is online
      };

      conversation.messages.push(message);
      conversation.lastUpdated = new Date();
      const savedConversation = await conversation.save();

      const newMessage = savedConversation.messages[savedConversation.messages.length - 1];
      const sender = await FromModel.findById(fromId).select('name superAdminPhoto').lean();
      const populatedMessage = {
        _id: newMessage._id.toString(),
        from: { _id: fromId, name: sender.name, superAdminPhoto: sender.superAdminPhoto || null },
        content: newMessage.content,
        timestamp: newMessage.timestamp.toISOString(),
        read: newMessage.read,
      };

      [fromId, toId].forEach(id => {
        const ws = this.clients.get(id);
        if (ws) this.sendToClient(ws, {
          type: 'PRIVATE_MESSAGE',
          conversationId: savedConversation._id.toString(),
          message: populatedMessage,
        });
      });
    } catch (error) {
      console.error('Error handling private message:', error);
      throw error;
    }
  }

  async handleGroupMessage(fromId, groupId, content, FromModel) {
    if (!groupId || !content) return;

    try {
      const group = await GroupModel.findById(groupId);
      if (!group || !group.members.map(m => m.toString()).includes(fromId)) {
        console.warn(`User ${fromId} not in group ${groupId}`);
        return;
      }

      const message = {
        from: fromId,
        content,
        timestamp: new Date(),
        read: false, // Initially unread for all except sender
      };

      group.messages.push(message);
      group.lastUpdated = new Date();
      const savedGroup = await group.save();

      const newMessage = savedGroup.messages[savedGroup.messages.length - 1];
      const sender = await FromModel.findById(fromId).select('name superAdminPhoto').lean();
      const populatedMessage = {
        _id: newMessage._id.toString(),
        from: { _id: fromId, name: sender.name, superAdminPhoto: sender.superAdminPhoto || null },
        content: newMessage.content,
        timestamp: newMessage.timestamp.toISOString(),
        read: newMessage.read,
      };

      group.members.forEach(userId => {
        const ws = this.clients.get(userId.toString());
        if (ws) this.sendToClient(ws, {
          type: 'GROUP_MESSAGE',
          groupId,
          message: populatedMessage,
        });
      });
    } catch (error) {
      console.error('Error handling group message:', error);
      throw error;
    }
  }
}

module.exports = new WebSocketService();