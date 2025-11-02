# Chat System Implementation Guide

## ✅ **Complete Chat System Implemented!**

Your SnowHub API now has a **fully functional real-time chat system** with:
- ✅ MongoDB storage (persistent messages)
- ✅ Socket.io (real-time messaging)
- ✅ Pagination (fast loading)
- ✅ Read receipts
- ✅ Typing indicators
- ✅ Online status
- ✅ Unread message counts

---

## 📋 **API Endpoints**

### **1. POST /api/chat** - Create or Get Chat

Create a new chat or get existing chat between two users.

**Request:**
```json
POST /api/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "participantId": "user_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "chat": {
    "id": "chat_123",
    "participants": [
      {
        "id": "user_1",
        "username": "johndoe",
        "avatar": "avatar.jpg"
      },
      {
        "id": "user_2",
        "username": "janedoe",
        "avatar": "avatar2.jpg"
      }
    ],
    "lastMessage": null,
    "unreadCount": 0,
    "createdAt": "2024-11-02T10:00:00Z"
  }
}
```

---

### **2. GET /api/chat** - Get User's Chats

Get all chats for the authenticated user (chat list).

**Request:**
```
GET /api/chat?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "chats": [
    {
      "id": "chat_123",
      "participant": {
        "id": "user_2",
        "username": "janedoe",
        "avatar": "avatar2.jpg"
      },
      "lastMessage": {
        "text": "Hey! How's it going?",
        "sender": "user_2",
        "timestamp": "2024-11-02T10:30:00Z"
      },
      "unreadCount": 3,
      "updatedAt": "2024-11-02T10:30:00Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 100,
    "limit": 20
  }
}
```

---

### **3. GET /api/chat/:chatId** - Get Specific Chat

Get details of a specific chat.

**Request:**
```
GET /api/chat/chat_123
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "chat": {
    "id": "chat_123",
    "participant": {
      "id": "user_2",
      "username": "janedoe",
      "avatar": "avatar2.jpg"
    },
    "lastMessage": {
      "text": "Hey! How's it going?",
      "sender": "user_2",
      "timestamp": "2024-11-02T10:30:00Z"
    },
    "unreadCount": 3,
    "createdAt": "2024-11-02T10:00:00Z",
    "updatedAt": "2024-11-02T10:30:00Z"
  }
}
```

---

### **4. GET /api/chat/:chatId/messages** - Get Messages

Get messages in a chat with pagination.

**Request:**
```
GET /api/chat/chat_123/messages?page=1&limit=50&before=2024-11-02T10:00:00Z
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Messages per page (default: 50)
- `before`: Timestamp to load older messages (optional)

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "msg_123",
      "sender": {
        "id": "user_1",
        "username": "johndoe",
        "avatar": "avatar.jpg"
      },
      "message": "Hey there!",
      "type": "text",
      "fileUrl": null,
      "readBy": 1,
      "isRead": true,
      "createdAt": "2024-11-02T10:00:00Z"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 150,
    "limit": 50,
    "hasMore": true
  }
}
```

---

### **5. POST /api/chat/:chatId/messages** - Send Message

Send a message via REST API (Socket.io also handles this).

**Request:**
```json
POST /api/chat/chat_123/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Hey! How are you?",
  "type": "text",
  "fileUrl": "" // optional, for images/files
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "msg_456",
    "sender": {
      "id": "user_1",
      "username": "johndoe",
      "avatar": "avatar.jpg"
    },
    "message": "Hey! How are you?",
    "type": "text",
    "fileUrl": null,
    "readBy": 0,
    "isRead": false,
    "createdAt": "2024-11-02T10:31:00Z"
  },
  "chatId": "chat_123"
}
```

---

### **6. PUT /api/chat/:chatId/read** - Mark Messages as Read

Mark all messages in a chat as read.

**Request:**
```
PUT /api/chat/chat_123/read
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

---

## 🔌 **Socket.io Events (Real-Time)**

### **Client → Server Events:**

#### **1. Connect to Socket.io**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token_here'
  }
});
```

#### **2. Join Chat Room**
```javascript
socket.emit('join_chat', chatId);
```

#### **3. Leave Chat Room**
```javascript
socket.emit('leave_chat', chatId);
```

#### **4. Send Message (Real-Time)**
```javascript
socket.emit('send_message', {
  chatId: 'chat_123',
  message: 'Hello!',
  type: 'text',
  fileUrl: '' // optional
});
```

#### **5. Typing Indicator**
```javascript
// Start typing
socket.emit('typing', {
  chatId: 'chat_123',
  isTyping: true
});

// Stop typing
socket.emit('typing', {
  chatId: 'chat_123',
  isTyping: false
});
```

#### **6. Mark Messages as Read**
```javascript
socket.emit('mark_read', {
  chatId: 'chat_123'
});
```

#### **7. User Online Status**
```javascript
socket.emit('user_online');
```

---

### **Server → Client Events:**

#### **1. New Message Received**
```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data);
  // data = { chatId, message: { id, sender, message, ... } }
});
```

#### **2. Chat Updated**
```javascript
socket.on('chat_updated', (data) => {
  console.log('Chat updated:', data);
  // data = { chatId, lastMessage, unreadCount }
  // Update chat list UI
});
```

#### **3. User Typing**
```javascript
socket.on('user_typing', (data) => {
  console.log('User typing:', data);
  // data = { chatId, userId, username, isTyping }
  // Show/hide typing indicator
});
```

#### **4. Messages Read**
```javascript
socket.on('messages_read', (data) => {
  console.log('Messages read:', data);
  // data = { chatId, userId }
  // Update read receipts in UI
});
```

#### **5. User Status (Online/Offline)**
```javascript
socket.on('user_status', (data) => {
  console.log('User status:', data);
  // data = { userId, status: 'online' | 'offline' }
  // Update online status indicator
});
```

#### **6. Error**
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  // Handle error
});
```

#### **7. Connect**
```javascript
socket.on('connect', () => {
  console.log('Connected to Socket.io');
});
```

#### **8. Disconnect**
```javascript
socket.on('disconnect', () => {
  console.log('Disconnected from Socket.io');
});
```

---

## 💻 **Frontend Integration Example**

### **React/Next.js Example:**

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function ChatComponent({ chatId, token }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Connect to Socket.io
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    setSocket(newSocket);

    // Join chat room
    newSocket.emit('join_chat', chatId);

    // Listen for new messages
    newSocket.on('new_message', (data) => {
      if (data.chatId === chatId) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    // Listen for typing
    newSocket.on('user_typing', (data) => {
      if (data.chatId === chatId && data.userId !== currentUserId) {
        setIsTyping(data.isTyping);
      }
    });

    // Cleanup on unmount
    return () => {
      newSocket.emit('leave_chat', chatId);
      newSocket.disconnect();
    };
  }, [chatId, token]);

  // Load initial messages
  useEffect(() => {
    fetch(`http://localhost:5000/api/chat/${chatId}/messages?limit=50`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessages(data.messages);
        }
      });
  }, [chatId]);

  // Send message
  const sendMessage = (text) => {
    socket.emit('send_message', {
      chatId,
      message: text,
      type: 'text'
    });
  };

  // Typing indicator
  const handleTyping = (isTyping) => {
    socket.emit('typing', {
      chatId,
      isTyping
    });
  };

  return (
    <div>
      {/* Messages */}
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.sender.username}:</strong> {msg.message}
        </div>
      ))}

      {/* Typing indicator */}
      {isTyping && <div>User is typing...</div>}

      {/* Input */}
      <input
        onInput={(e) => handleTyping(e.target.value.length > 0)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            sendMessage(e.target.value);
            e.target.value = '';
            handleTyping(false);
          }
        }}
      />
    </div>
  );
}
```

---

## 📊 **Database Models**

### **Chat Model:**
- `participants`: Array of user IDs
- `type`: 'direct' or 'group'
- `lastMessage`: Last message info
- `unreadCount`: Per-user unread counts

### **Message Model:**
- `chat`: Chat ID reference
- `sender`: User ID who sent
- `message`: Message text
- `type`: 'text', 'image', 'file'
- `readBy`: Array of users who read it
- `fileUrl`: For images/files

---

## ⚡ **Performance Optimizations**

### **1. Pagination**
- Load only last 50 messages initially
- Load older messages on scroll up
- Use `before` parameter for cursor-based pagination

### **2. Indexing**
```javascript
// Already added in models:
Messages.index({ chat: 1, createdAt: -1 });
Chats.index({ participants: 1 });
```

### **3. Socket.io Rooms**
- Users join chat rooms automatically
- Messages broadcast only to room participants
- Efficient message delivery

### **4. Unread Counts**
- Stored in Chat model (not calculated each time)
- Fast to query
- Updated in real-time

---

## 🔒 **Security**

- ✅ JWT authentication for Socket.io
- ✅ Users can only access their own chats
- ✅ Participants verified before message send
- ✅ All endpoints protected

---

## 📝 **Message Types**

Currently supported:
- `text`: Regular text messages
- `image`: Image messages (store filename from R2)
- `file`: File messages (store filename from R2)

---

## 🎯 **Complete Flow**

1. **User A opens chat with User B**
   - Frontend calls `POST /api/chat` with User B's ID
   - Backend creates or returns existing chat
   - Frontend connects to Socket.io with token
   - Socket joins chat room automatically

2. **User A sends message**
   - Option A: Via Socket.io `send_message` event (instant)
   - Option B: Via REST API `POST /api/chat/:id/messages` (also instant via Socket.io broadcast)
   - Message saved to MongoDB
   - Broadcast to User B via Socket.io
   - User B receives message in real-time

3. **User B receives message**
   - Socket.io event `new_message` received
   - Message displayed in UI
   - Unread count incremented
   - Chat list updated via `chat_updated` event

4. **User B reads messages**
   - Frontend calls `PUT /api/chat/:id/read` OR
   - Socket.io emits `mark_read` event
   - All messages marked as read
   - Unread count reset to 0

---

## ✅ **Features Implemented**

- ✅ Create/get chats
- ✅ Get chat list with pagination
- ✅ Get messages with pagination
- ✅ Send messages (REST + Socket.io)
- ✅ Real-time messaging
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Unread message counts
- ✅ Online/offline status
- ✅ Message persistence (MongoDB)
- ✅ Fast queries with indexes

---

## 🚀 **Ready to Use!**

Your chat system is **fully functional** and **production-ready**! 

**To test:**
1. Create a chat: `POST /api/chat` with another user's ID
2. Connect to Socket.io with your JWT token
3. Send messages and watch them appear in real-time!

**The system handles everything:**
- Message storage ✅
- Real-time delivery ✅
- Performance optimization ✅
- Security ✅

🎉 **Chat system complete!**

