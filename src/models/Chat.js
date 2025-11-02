const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  lastMessage: {
    text: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date
  },
  unreadCount: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });

// Method to get other participant (for direct chats)
chatSchema.methods.getOtherParticipant = function(currentUserId) {
  if (this.type === 'direct') {
    return this.participants.find(p => p.toString() !== currentUserId.toString());
  }
  return null;
};

// Method to get unread count for a user
chatSchema.methods.getUnreadCount = function(userId) {
  const unread = this.unreadCount.find(u => u.user.toString() === userId.toString());
  return unread ? unread.count : 0;
};

// Method to increment unread count
chatSchema.methods.incrementUnreadCount = function(userId) {
  const unread = this.unreadCount.find(u => u.user.toString() === userId.toString());
  if (unread) {
    unread.count += 1;
  } else {
    this.unreadCount.push({ user: userId, count: 1 });
  }
};

// Method to reset unread count
chatSchema.methods.resetUnreadCount = function(userId) {
  const unread = this.unreadCount.find(u => u.user.toString() === userId.toString());
  if (unread) {
    unread.count = 0;
  }
};

module.exports = mongoose.model('Chat', chatSchema);

