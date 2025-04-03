const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { ConversationModel, ClientConversationModel } = require('../models/newModel/chatModel');
const AdminModel = require('../models/newModel/adminModel');
const SuperAdminModel = require('../models/newModel/superAdminModel');
const ClientModel = require('../models/newModel/clientModel');

class SocketService {
  constructor() {
    this.clients = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: ['https://crm.zoomcreatives.jp', 'http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.on('connection', (socket) => {
      const token = socket.handshake.query.token;
      if (!token) return socket.disconnect(true);

      try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decoded._id.toString();
        this.clients.set(userId, socket);
        socket.userId = userId;
        socket.role = decoded.role;

        socket.join(userId);
        this.broadcastOnlineStatus();

        socket.on('privateMessage', (data) => this.handlePrivateMessage(socket, data));
        socket.on('clientMessage', (data) => this.handleClientMessage(socket, data));
        socket.on('typing', (data) => this.handleTyping(socket, data));
        socket.on('disconnect', () => {
          this.clients.delete(userId);
          this.broadcastOnlineStatus();
        });
      } catch (error) {
        socket.disconnect(true);
      }
    });
  }

  broadcastOnlineStatus() {
    const onlineUsers = Array.from(this.clients.keys());
    this.io.emit('onlineUsers', { users: onlineUsers });
  }

  async handlePrivateMessage(socket, { toUserId, content }) {
    const fromId = socket.userId;
    const FromModel = socket.role === 'superadmin' ? SuperAdminModel : AdminModel;

    if (!toUserId || !content) return;

    const participants = [fromId, toUserId].sort();
    let conversation = await ConversationModel.findOne({ participants }) || new ConversationModel({ participants });
    const message = { from: fromId, content, timestamp: new Date(), read: this.clients.has(toUserId) };
    conversation.messages.push(message);
    conversation.lastUpdated = new Date();
    const savedConversation = await conversation.save();

    const newMessage = savedConversation.messages[savedConversation.messages.length - 1];
    const sender = await FromModel.findById(fromId).select('name superAdminPhoto profilePhoto fullName').lean();
    const populatedMessage = this.populateMessage(newMessage, sender);

    console.log('Emitting privateMessage:', { fromId, toUserId, message: populatedMessage });
    this.io.to(fromId).to(toUserId).emit('privateMessage', {
      conversationId: participants.join('-'), // Ensure this matches the chatKey format
      message: populatedMessage,
    });
  }

  async handleClientMessage(socket, { clientId, content }) {
    const senderId = socket.userId;
    const FromModel = socket.role === 'superadmin' ? SuperAdminModel : socket.role === 'client' ? ClientModel : AdminModel;

    if (!content) return;

    let conversation = await ClientConversationModel.findOne({ clientId }) || new ClientConversationModel({ clientId });
    const message = {
      from: senderId,
      content,
      timestamp: new Date(),
      read: false,
      adminThatReplied: socket.role !== 'client' ? senderId : null,
    };
    conversation.messages.push(message);
    conversation.lastUpdated = new Date();
    const savedConversation = await conversation.save();

    const newMessage = savedConversation.messages[savedConversation.messages.length - 1];
    const sender = await FromModel.findById(senderId).select('name fullName profilePhoto superAdminPhoto').lean();
    const populatedMessage = this.populateMessage(newMessage, sender, message.adminThatReplied);

    const allUsers = await Promise.all([
      AdminModel.find().select('_id').lean(),
      SuperAdminModel.find().select('_id').lean(),
      ClientModel.findById(clientId).select('_id').lean(),
    ]).then(([admins, superAdmins, client]) => [
      ...admins.map((a) => a._id.toString()),
      ...superAdmins.map((s) => s._id.toString()),
      client?._id.toString(),
    ].filter(Boolean));

    console.log('Emitting clientMessage:', { clientId, message: populatedMessage });
    allUsers.forEach((userId) => this.io.to(userId).emit('clientMessage', { clientId, message: populatedMessage }));
  }

  async handleTyping(socket, { chatId, chatType }) {
    if (chatType === 'private') {
      const participants = chatId.split('-');
      const recipientId = participants.find((id) => id !== socket.userId);
      this.io.to(recipientId).emit('typing', { chatId, chatType, userId: socket.userId });
    } else if (chatType === 'client') {
      const allUsers = await Promise.all([
        AdminModel.find().select('_id').lean(),
        SuperAdminModel.find().select('_id').lean(),
        ClientModel.findById(chatId).select('_id').lean(),
      ]).then(([admins, superAdmins, client]) => [
        ...admins.map((a) => a._id.toString()),
        ...superAdmins.map((s) => s._id.toString()),
        client?._id.toString(),
      ].filter(Boolean));

      allUsers.forEach((userId) => {
        if (userId !== socket.userId) this.io.to(userId).emit('typing', { chatId, chatType, userId: socket.userId });
      });
    }
  }

  populateMessage(message, sender, adminThatReplied = null) {
    return {
      _id: message._id.toString(),
      from: {
        _id: sender._id,
        name: sender.name || sender.fullName || 'Unknown',
        profilePhoto: sender.profilePhoto || sender.superAdminPhoto || null,
      },
      content: message.content,
      timestamp: message.timestamp.toISOString(),
      read: message.read,
      adminThatReplied,
    };
  }
}

module.exports = new SocketService();