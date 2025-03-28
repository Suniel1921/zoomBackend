const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    adminThatReplied: { type: mongoose.Schema.Types.ObjectId, default: null }
});

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
    messages: [messageSchema],
    lastUpdated: { type: Date, default: Date.now }
});

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    messages: [messageSchema],
    createdAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
});

const clientConversationSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, required: true },
    messages: [messageSchema],
    lastUpdated: { type: Date, default: Date.now }
});

const ConversationModel = mongoose.model('Conversation', conversationSchema);
const GroupModel = mongoose.model('Group', groupSchema);
const ClientConversationModel = mongoose.model('ClientConversation', clientConversationSchema);

module.exports = { ConversationModel, GroupModel, ClientConversationModel };