const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with CORS support
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Trust proxy - required when behind reverse proxies (Render, Heroku, etc.)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const categoryRoutes = require('./routes/categories');
const chatRoutes = require('./routes/chat');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SnowHub API is running',
    timestamp: new Date().toISOString()
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to SnowHub API',
    version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        posts: '/api/posts',
        users: '/api/users',
        comments: '/api/comments',
        chat: '/api/chat',
        health: '/api/health'
      }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Socket.io middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Attach user to socket
    socket.userId = user._id.toString();
    socket.user = user;
    
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.io connection handler
const activeUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.user.username} (${socket.userId})`);
  
  // Store user as active
  activeUsers.set(socket.userId, socket.id);

  // Join user's personal room (for notifications)
  socket.join(`user:${socket.userId}`);

  // Join all chat rooms where user is a participant
  Chat.find({ participants: socket.userId })
    .then(chats => {
      chats.forEach(chat => {
        socket.join(`chat:${chat._id}`);
      });
    })
    .catch(err => console.error('Error joining chat rooms:', err));

  // Handle joining a chat room
  socket.on('join_chat', (chatId) => {
    socket.join(`chat:${chatId}`);
    console.log(`📥 User ${socket.user.username} joined chat: ${chatId}`);
  });

  // Handle leaving a chat room
  socket.on('leave_chat', (chatId) => {
    socket.leave(`chat:${chatId}`);
    console.log(`📤 User ${socket.user.username} left chat: ${chatId}`);
  });

  // Handle sending a message (real-time)
  socket.on('send_message', async (data) => {
    try {
      const { chatId, message, type = 'text', fileUrl = '' } = data;

      if (!chatId || !message || !message.trim()) {
        socket.emit('error', { message: 'Chat ID and message are required' });
        return;
      }

      // Verify chat exists and user is participant
      const chat = await Chat.findById(chatId);
      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      const isParticipant = chat.participants.some(
        p => p.toString() === socket.userId
      );

      if (!isParticipant) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }

      // Create message in database
      const newMessage = await Message.create({
        chat: chatId,
        sender: socket.userId,
        message: message.trim(),
        type,
        fileUrl
      });

      // Mark as read by sender
      newMessage.markAsRead(socket.userId);
      await newMessage.save();

      // Populate sender info
      await newMessage.populate('sender', 'username avatar');

      // Update chat's last message
      chat.lastMessage = {
        text: message.trim(),
        sender: socket.userId,
        timestamp: new Date()
      };

      // Increment unread count for other participants
      chat.participants.forEach(participantId => {
        if (participantId.toString() !== socket.userId) {
          chat.incrementUnreadCount(participantId);
        }
      });

      await chat.save();

      // Format message for client
      const messageData = {
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
      };

      // Broadcast to all participants in the chat room
      io.to(`chat:${chatId}`).emit('new_message', {
        chatId,
        message: messageData
      });

      // Notify participants about chat update (for chat list)
      chat.participants.forEach(participantId => {
        io.to(`user:${participantId}`).emit('chat_updated', {
          chatId,
          lastMessage: chat.lastMessage,
          unreadCount: chat.getUnreadCount(participantId)
        });
      });

      console.log(`💬 Message sent in chat ${chatId} by ${socket.user.username}`);

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { chatId, isTyping } = data;
    if (chatId) {
      // Broadcast to other users in chat (not the sender)
      socket.to(`chat:${chatId}`).emit('user_typing', {
        chatId,
        userId: socket.userId,
        username: socket.user.username,
        isTyping
      });
    }
  });

  // Handle marking messages as read
  socket.on('mark_read', async (data) => {
    try {
      const { chatId } = data;

      if (!chatId) {
        return;
      }

      const chat = await Chat.findById(chatId);
      if (!chat) {
        return;
      }

      // Mark all unread messages in this chat as read
      await Message.updateMany(
        {
          chat: chatId,
          sender: { $ne: socket.userId },
          'readBy.user': { $ne: socket.userId }
        },
        {
          $push: {
            readBy: {
              user: socket.userId,
              readAt: Date.now()
            }
          }
        }
      );

      // Reset unread count
      chat.resetUnreadCount(socket.userId);
      await chat.save();

      // Notify other participants
      socket.to(`chat:${chatId}`).emit('messages_read', {
        chatId,
        userId: socket.userId
      });

    } catch (error) {
      console.error('Mark read error:', error);
    }
  });

  // Handle user going online/offline
  socket.on('user_online', () => {
    io.emit('user_status', {
      userId: socket.userId,
      status: 'online'
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.user.username} (${socket.userId})`);
    activeUsers.delete(socket.userId);
    
    // Notify others that user went offline
    socket.broadcast.emit('user_status', {
      userId: socket.userId,
      status: 'offline'
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║              🏔️  SnowHub API Server  ⛷️              ║
╠══════════════════════════════════════════════════════╣
║  Status: Running                                     ║
║  Port: ${PORT}                                        ║
║  Environment: ${process.env.NODE_ENV || 'development'}                            ║
║  Socket.io: Enabled ✅                               ║
║  Timestamp: ${new Date().toISOString()}              ║
╚══════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };

