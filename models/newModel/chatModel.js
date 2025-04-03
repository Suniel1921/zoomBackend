const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, required: true },
  content: { type: String, required: true, maxlength: 2000 },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  adminThatReplied: { type: mongoose.Schema.Types.ObjectId, default: null }
});

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
  messages: [messageSchema],
  lastUpdated: { type: Date, default: Date.now }
}, { indexes: [{ key: { participants: 1 } }] });

const clientConversationSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, required: true },
  messages: [messageSchema],
  lastUpdated: { type: Date, default: Date.now }
}, { indexes: [{ key: { clientId: 1 } }] });

const ConversationModel = mongoose.model('Conversation', conversationSchema);
const ClientConversationModel = mongoose.model('ClientConversation', clientConversationSchema);

module.exports = { ConversationModel, ClientConversationModel };