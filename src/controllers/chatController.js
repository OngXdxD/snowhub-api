const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get or create chat between two users
// @route   POST /api/chat
// @access  Private
exports.createOrGetChat = async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Can't create chat with yourself
    if (participantId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create chat with yourself'
      });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if chat already exists between these two users
    let chat = await Chat.findOne({
      type: 'direct',
      participants: { $all: [req.user._id, participantId] }
    }).populate('participants', 'username avatar');

    if (chat) {
      // Chat exists, return it
      return res.status(200).json({
        success: true,
        chat: {
          id: chat._id,
          participants: chat.participants.map(p => ({
            id: p._id,
            username: p.username,
            avatar: p.avatar
          })),
          lastMessage: chat.lastMessage,
          unreadCount: chat.getUnreadCount(req.user._id),
          createdAt: chat.createdAt
        }
      });
    }

    // Create new chat
    chat = await Chat.create({
      participants: [req.user._id, participantId],
      type: 'direct',
      unreadCount: [
        { user: req.user._id, count: 0 },
        { user: participantId, count: 0 }
      ]
    });

    await chat.populate('participants', 'username avatar');

    res.status(201).json({
      success: true,
      chat: {
        id: chat._id,
        participants: chat.participants.map(p => ({
          id: p._id,
          username: p.username,
          avatar: p.avatar
        })),
        lastMessage: chat.lastMessage,
        unreadCount: 0,
        createdAt: chat.createdAt
      }
    });

  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's chats
// @route   GET /api/chat
// @access  Private
exports.getUserChats = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Find all chats where user is a participant
    const chats = await Chat.find({
      participants: req.user._id
    })
      .populate('participants', 'username avatar')
      .populate('lastMessage.sender', 'username avatar')
      .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Chat.countDocuments({
      participants: req.user._id
    });

    // Format chats for response
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.getOtherParticipant(req.user._id);
      return {
        id: chat._id,
        participant: otherParticipant ? {
          id: otherParticipant._id,
          username: otherParticipant.username,
          avatar: otherParticipant.avatar
        } : null,
        lastMessage: chat.lastMessage,
        unreadCount: chat.getUnreadCount(req.user._id),
        updatedAt: chat.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      chats: formattedChats,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });

  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get chat by ID
// @route   GET /api/chat/:chatId
// @access  Private
exports.getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants', 'username avatar');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(
      p => p._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this chat'
      });
    }

    const otherParticipant = chat.getOtherParticipant(req.user._id);

    res.status(200).json({
      success: true,
      chat: {
        id: chat._id,
        participant: otherParticipant ? {
          id: otherParticipant._id,
          username: otherParticipant.username,
          avatar: otherParticipant.avatar
        } : null,
        lastMessage: chat.lastMessage,
        unreadCount: chat.getUnreadCount(req.user._id),
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }
    });

  } catch (error) {
    console.error('Get chat error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get messages for a chat
// @route   GET /api/chat/:chatId/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before; // Timestamp for pagination

    // Check if chat exists and user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const isParticipant = chat.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view messages in this chat'
      });
    }

    // Build query for pagination
    let query = { chat: chatId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Get messages (newest first, then reverse for display)
    const messages = await Message.find(query)
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit);

    const total = await Message.countDocuments({ chat: chatId });

    // Reverse to show oldest first (for chat UI)
    const formattedMessages = messages.reverse().map(msg => ({
      id: msg._id,
      sender: {
        id: msg.sender._id,
        username: msg.sender.username,
        avatar: msg.sender.avatar
      },
      message: msg.message,
      type: msg.type,
      fileUrl: msg.fileUrl || null,
      readBy: msg.readBy.length,
      isRead: msg.isReadBy(req.user._id),
      createdAt: msg.createdAt
    }));

    res.status(200).json({
      success: true,
      messages: formattedMessages,
      pagination: {
        current: page,
        total,
        limit,
        hasMore: messages.length === limit
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Send message
// @route   POST /api/chat/:chatId/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message, type = 'text', fileUrl = '' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }

    // Check if chat exists and user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const isParticipant = chat.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this chat'
      });
    }

    // Create message
    const newMessage = await Message.create({
      chat: chatId,
      sender: req.user._id,
      message: message.trim(),
      type,
      fileUrl
    });

    // Mark as read by sender
    newMessage.markAsRead(req.user._id);
    await newMessage.save();

    // Update chat's last message
    chat.lastMessage = {
      text: message.trim(),
      sender: req.user._id,
      timestamp: new Date()
    };

    // Increment unread count for other participants
    chat.participants.forEach(participantId => {
      if (participantId.toString() !== req.user._id.toString()) {
        chat.incrementUnreadCount(participantId);
      }
    });

    await chat.save();

    // Populate sender info
    await newMessage.populate('sender', 'username avatar');

    // Return message (Socket.io will broadcast this)
    res.status(201).json({
      success: true,
      message: {
        id: newMessage._id,
        sender: {
          id: newMessage.sender._id,
          username: newMessage.sender.username,
          avatar: newMessage.sender.avatar
        },
        message: newMessage.message,
        type: newMessage.type,
        fileUrl: newMessage.fileUrl || null,
        readBy: newMessage.readBy.length,
        isRead: false,
        createdAt: newMessage.createdAt
      },
      chatId: chatId
    });

    // Note: Real-time broadcasting will be handled by Socket.io in server.js

  } catch (error) {
    console.error('Send message error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/:chatId/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Check if chat exists and user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const isParticipant = chat.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Mark all unread messages in this chat as read
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: req.user._id }, // Not sent by current user
        'readBy.user': { $ne: req.user._id } // Not already read by current user
      },
      {
        $push: {
          readBy: {
            user: req.user._id,
            readAt: Date.now()
          }
        }
      }
    );

    // Reset unread count for this user
    chat.resetUnreadCount(req.user._id);
    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

