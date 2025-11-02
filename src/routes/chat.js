const express = require('express');
const router = express.Router();
const {
  createOrGetChat,
  getUserChats,
  getChat,
  getMessages,
  sendMessage,
  markAsRead
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All chat routes require authentication
router.use(protect);

// Chat management
router.post('/', createOrGetChat); // Create or get existing chat
router.get('/', getUserChats); // Get user's chats list
router.get('/:chatId', getChat); // Get specific chat
router.put('/:chatId/read', markAsRead); // Mark messages as read

// Messages
router.get('/:chatId/messages', getMessages); // Get messages in chat
router.post('/:chatId/messages', sendMessage); // Send message

module.exports = router;

