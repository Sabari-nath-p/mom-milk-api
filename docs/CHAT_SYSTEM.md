# Chat System Documentation

## Overview

The chat system enables real-time communication between parents and donors in the Mom's Milk application. It features WhatsApp-style continuous sessions with complete message history, read receipts, delivery status, and typing indicators.

## Features

- **Persistent Chat Sessions**: One continuous session per parent-donor pair
- **Real-time Messaging**: WebSocket-based instant message delivery
- **Message History**: Complete chat history with pagination
- **Read Receipts**: Track when messages are read
- **Delivery Status**: Know when messages are delivered
- **Typing Indicators**: See when the other person is typing
- **Unread Count**: Get total unread messages across all sessions
- **REST API Fallback**: Send messages via REST if WebSocket is unavailable
- **Online/Offline Messaging**: Messages delivered instantly to online users, saved for offline users
- **Automatic History Loading**: Unread messages automatically sent when users reconnect

## Database Schema

### ChatSession
- `id`: Unique session identifier
- `parentId`: ID of one participant
- `donorId`: ID of the other participant
- `lastMessageAt`: Timestamp of the last message
- `isActive`: Session status
- Unique constraint on `(parentId, donorId)` ensures one session per pair

### ChatMessage
- `id`: Unique message identifier
- `content`: Message text content
- `senderId`: ID of the user who sent the message
- `sessionId`: Reference to the chat session
- `isRead`: Whether the message has been read
- `readAt`: Timestamp when message was read
- `isDelivered`: Whether the message was delivered
- `deliveredAt`: Timestamp when message was delivered
- `createdAt`: Message creation timestamp

## REST API Endpoints

All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

### 1. Get Chat Sessions
```http
GET /chat/sessions?page=1&limit=20
```

**Response:**
```json
{
  "sessions": [
    {
      "id": 1,
      "parentId": 1,
      "donorId": 2,
      "lastMessageAt": "2025-11-24T13:00:00Z",
      "isActive": true,
      "otherUser": {
        "id": 2,
        "name": "John Doe",
        "email": "john@example.com",
        "userType": "DONOR"
      },
      "unreadCount": 3,
      "lastMessage": {
        "id": 100,
        "content": "Hello!",
        "senderId": 2,
        "createdAt": "2025-11-24T13:00:00Z"
      }
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### 2. Get Messages for a Session
```http
GET /chat/sessions/:sessionId/messages?page=1&limit=50
```

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "content": "Hello, I need milk for my baby",
      "senderId": 1,
      "sessionId": 1,
      "isRead": true,
      "readAt": "2025-11-24T13:01:00Z",
      "isDelivered": true,
      "deliveredAt": "2025-11-24T13:00:30Z",
      "createdAt": "2025-11-24T13:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

### 3. Send Message (REST Fallback)
```http
POST /chat/messages
Content-Type: application/json

{
  "recipientId": 2,
  "content": "Hello, I need milk for my baby"
}
```

**Response:**
```json
{
  "id": 101,
  "content": "Hello, I need milk for my baby",
  "senderId": 1,
  "sessionId": 1,
  "isRead": false,
  "isDelivered": false,
  "createdAt": "2025-11-24T13:00:00Z"
}
```

### 4. Mark Messages as Read
```http
POST /chat/messages/read
Content-Type: application/json

{
  "messageIds": [1, 2, 3]
}
```

**Response:**
```json
{
  "updated": 3
}
```

### 5. Get Unread Count
```http
GET /chat/unread-count
```

**Response:**
```json
{
  "unreadCount": 5
}
```

### 6. Get or Create Session with User
```http
GET /chat/session/:otherUserId
```

**Response:**
```json
{
  "id": 1,
  "parentId": 1,
  "donorId": 2,
  "lastMessageAt": "2025-11-24T13:00:00Z",
  "isActive": true
}
```

## WebSocket API

### Connection

Connect to the WebSocket server at `/chat` namespace:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'your-jwt-token'
  }
});

// OR using authorization header
const socket = io('http://localhost:3000/chat', {
  extraHeaders: {
    authorization: 'Bearer your-jwt-token'
  }
});
```

### Events

#### Client → Server Events

##### 1. Send Message
```javascript
socket.emit('sendMessage', {
  recipientId: 2,
  content: 'Hello, I need milk for my baby'
});
```

**Response:**
```javascript
socket.on('messageSent', (data) => {
  console.log('Message sent:', data);
  // { id, content, senderId, sessionId, createdAt, ... }
});
```

##### 2. Join Session
```javascript
socket.emit('joinSession', {
  sessionId: 1
});
```

##### 3. Leave Session
```javascript
socket.emit('leaveSession', {
  sessionId: 1
});
```

##### 4. Typing Indicator
```javascript
// Start typing
socket.emit('typing', {
  recipientId: 2,
  isTyping: true
});

// Stop typing
socket.emit('typing', {
  recipientId: 2,
  isTyping: false
});
```

##### 5. Mark as Read
```javascript
socket.emit('markAsRead', {
  messageIds: [1, 2, 3]
});
```

##### 6. Mark as Delivered
```javascript
socket.emit('markAsDelivered', {
  messageIds: [4, 5, 6]
});
```

#### Server → Client Events

##### 1. New Message Received
```javascript
socket.on('newMessage', (data) => {
  console.log('New message:', data);
  // { id, content, senderId, sessionId, createdAt, ... }
});
```

##### 2. User Typing
```javascript
socket.on('userTyping', (data) => {
  console.log('User typing:', data);
  // { userId, isTyping }
});
```

##### 3. Messages Read
```javascript
socket.on('messagesRead', (data) => {
  console.log('Messages read:', data);
  // { messageIds: [1, 2, 3], readBy: 2 }
});
```

##### 4. Messages Delivered
```javascript
socket.on('messagesDelivered', (data) => {
  console.log('Messages delivered:', data);
  // { messageIds: [1, 2, 3] }
});
```

## Frontend Integration Examples

### React Example with Socket.IO

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function ChatComponent({ token, recipientId }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io('http://localhost:3000/chat', {
      auth: { token }
    });

    // Listen for new messages
    newSocket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
      
      // Mark as delivered
      newSocket.emit('markAsDelivered', {
        messageIds: [message.id]
      });
    });

    // Listen for message confirmation
    newSocket.on('messageSent', (message) => {
      setMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [token]);

  const sendMessage = () => {
    if (socket && inputMessage.trim()) {
      socket.emit('sendMessage', {
        recipientId,
        content: inputMessage
      });
      setInputMessage('');
    }
  };

  const handleTyping = (isTyping) => {
    if (socket) {
      socket.emit('typing', {
        recipientId,
        isTyping
      });
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id}>
            <p>{msg.content}</p>
            <small>
              {msg.isDelivered ? '✓✓' : '✓'}
              {msg.isRead ? ' Read' : ''}
            </small>
          </div>
        ))}
      </div>
      <input
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onFocus={() => handleTyping(true)}
        onBlur={() => handleTyping(false)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
```

### React Native Example

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function ChatScreen({ token, recipientId }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newSocket = io('http://your-api-url.com/chat', {
      auth: { token },
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat');
    });

    newSocket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [token]);

  return (
    // Your React Native UI here
  );
}
```

## Migration Guide

### Running the Migration

To create the database tables, run:

```bash
npm run prisma:migrate
```

This will create the `chat_sessions` and `chat_messages` tables.

### Rollback

To rollback the migration:

```bash
npx prisma migrate reset
```

## Security Considerations

1. **Authentication**: All WebSocket connections require valid JWT tokens
2. **Authorization**: Users can only access their own sessions and messages
3. **Validation**: All inputs are validated using class-validator
4. **Session Access**: Users can only view messages from sessions they're part of

## Performance Optimization

1. **Pagination**: All list endpoints support pagination to handle large datasets
2. **Indexes**: Database indexes on frequently queried fields (sessionId, senderId, etc.)
3. **Connection Management**: Efficient socket connection tracking per user
4. **Message Batching**: Support for marking multiple messages as read/delivered at once

## Testing

### Testing WebSocket Connection

Use a tool like [Socket.IO Client](https://socket.io/docs/v4/client-installation/) or Postman to test WebSocket connections:

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000/chat', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => {
  console.log('Connected!');
  
  socket.emit('sendMessage', {
    recipientId: 2,
    content: 'Test message'
  });
});
```

### Testing REST API

Use curl or Postman:

```bash
# Get sessions
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/chat/sessions

# Send message
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipientId": 2, "content": "Hello"}' \
  http://localhost:3000/chat/messages
```

## Troubleshooting

### WebSocket Connection Issues

1. **CORS errors**: Update the CORS configuration in `chat.gateway.ts`
2. **Authentication failures**: Verify JWT token is valid and properly formatted
3. **Connection drops**: Check network stability and server logs

### Database Issues

1. **Migration errors**: Ensure database is running and accessible
2. **Unique constraint violations**: Session already exists for user pair
3. **Foreign key errors**: Verify user IDs exist before creating sessions

## Future Enhancements

- [ ] File/image sharing in chat
- [ ] Voice messages
- [ ] Message reactions/emojis
- [ ] Message editing and deletion
- [ ] Push notifications for new messages
- [ ] Search within conversations
- [ ] Message encryption
- [ ] Group chat support
