# Chat API Documentation - Frontend Developer Guide

**Version:** 1.0.0  
**Last Updated:** December 2, 2025  
**Base URL:** `http://localhost:3000`  
**WebSocket URL:** `ws://localhost:3000/chat`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [REST API Endpoints](#rest-api-endpoints)
4. [WebSocket API](#websocket-api)
5. [Message Structure](#message-structure)
6. [Frontend Integration](#frontend-integration)
7. [Testing Tools](#testing-tools)
8. [Error Handling](#error-handling)

---

## Overview

The Mom's Milk chat system provides real-time messaging between parents and donors with the following features:

- ✅ **Real-time messaging** via WebSocket
- ✅ **Persistent chat sessions** - One continuous conversation per user pair
- ✅ **Message history** with pagination
- ✅ **Read receipts** (✓✓)
- ✅ **Delivery status** (✓)
- ✅ **Typing indicators**
- ✅ **Online/Offline messaging** - Messages saved when recipient is offline
- ✅ **Automatic reconnection** - Unread messages delivered on reconnect
- ✅ **REST API fallback** for when WebSocket is unavailable

### How It Works

```
User A sends message
    ↓
Message saved to database
    ↓
If User B is ONLINE → Delivered instantly via WebSocket
If User B is OFFLINE → Saved for later (delivered on reconnect)
    ↓
User B receives message
    ↓
Mark as delivered (✓)
    ↓
User B reads message
    ↓
Mark as read (✓✓)
```

---

## Authentication

All API requests require JWT authentication.

### REST API
```http
Authorization: Bearer <your-jwt-token>
```

### WebSocket
```javascript
const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

---

## REST API Endpoints

### 1. Get Chat Sessions

Get all chat conversations for the authenticated user.

**Endpoint:** `GET /chat/sessions`

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/chat/sessions?page=1&limit=20"
```

**Response:**
```json
{
  "sessions": [
    {
      "id": 1,
      "parentId": 1,
      "donorId": 2,
      "lastMessageAt": "2025-12-01T07:00:00Z",
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
        "createdAt": "2025-12-01T07:00:00Z"
      },
      "createdAt": "2025-11-25T10:00:00Z",
      "updatedAt": "2025-12-01T07:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### 2. Get Messages for a Session

Get paginated messages for a specific chat session.

**Endpoint:** `GET /chat/sessions/:sessionId/messages`

**Path Parameters:**
- `sessionId` (required) - ID of the chat session

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 50)

**Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/chat/sessions/1/messages?page=1&limit=50"
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
      "readAt": "2025-12-01T07:01:00Z",
      "isDelivered": true,
      "deliveredAt": "2025-12-01T07:00:30Z",
      "sentAt": "2025-12-01T07:00:00Z",
      "createdAt": "2025-12-01T07:00:00Z",
      "updatedAt": "2025-12-01T07:01:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

---

### 3. Send Message (REST Fallback)

Send a message via REST API when WebSocket is unavailable.

**Endpoint:** `POST /chat/messages`

**Request Body:**
```json
{
  "recipientId": 2,
  "content": "Hello, I need milk for my baby"
}
```

**Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipientId": 2, "content": "Hello"}' \
  http://localhost:3000/chat/messages
```

**Response:**
```json
{
  "id": 101,
  "content": "Hello, I need milk for my baby",
  "senderId": 1,
  "sessionId": 1,
  "isRead": false,
  "readAt": null,
  "isDelivered": false,
  "deliveredAt": null,
  "sentAt": "2025-12-01T07:00:00Z",
  "createdAt": "2025-12-01T07:00:00Z",
  "updatedAt": "2025-12-01T07:00:00Z"
}
```

---

### 4. Mark Messages as Read

Mark multiple messages as read at once.

**Endpoint:** `POST /chat/messages/read`

**Request Body:**
```json
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

---

### 5. Get Unread Message Count

Get total unread messages across all sessions.

**Endpoint:** `GET /chat/unread-count`

**Response:**
```json
{
  "unreadCount": 5
}
```

---

### 6. Get or Create Session with User

Get existing session or create new one with another user.

**Endpoint:** `GET /chat/session/:otherUserId`

**Path Parameters:**
- `otherUserId` (required) - ID of the other user

**Response:**
```json
{
  "id": 1,
  "parentId": 1,
  "donorId": 2,
  "lastMessageAt": "2025-12-01T07:00:00Z",
  "isActive": true,
  "messages": [],
  "createdAt": "2025-11-25T10:00:00Z",
  "updatedAt": "2025-12-01T07:00:00Z"
}
```

---

## WebSocket API

### Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected!');
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

### Client → Server Events

#### 1. Send Message

Send a real-time message to another user.

```javascript
socket.emit('sendMessage', {
  recipientId: 2,
  content: 'Hello, I need milk for my baby'
});

// Response confirmation
socket.on('messageSent', (data) => {
  console.log('Message sent:', data);
  /*
  {
    id: 123,
    content: "Hello, I need milk for my baby",
    senderId: 1,
    sessionId: 1,
    recipientOnline: true,  // Whether recipient was online
    isRead: false,
    isDelivered: false,
    sentAt: "2025-12-01T07:00:00Z",
    createdAt: "2025-12-01T07:00:00Z"
  }
  */
});
```

#### 2. Join Session

Join a specific chat session room (optional).

```javascript
socket.emit('joinSession', {
  sessionId: 1
});
```

#### 3. Leave Session

Leave a specific chat session room.

```javascript
socket.emit('leaveSession', {
  sessionId: 1
});
```

#### 4. Typing Indicator

Show typing status to other user.

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

#### 5. Mark as Read

Mark messages as read.

```javascript
socket.emit('markAsRead', {
  messageIds: [1, 2, 3]
});
```

#### 6. Mark as Delivered

Mark messages as delivered.

```javascript
socket.emit('markAsDelivered', {
  messageIds: [4, 5, 6]
});
```

---

### Server → Client Events

#### 1. New Message

Receive new messages from other users OR unread messages on reconnect.

```javascript
socket.on('newMessage', (message) => {
  console.log('New message received:', message);
  /*
  {
    id: 456,
    content: "Hi there!",
    senderId: 2,
    sessionId: 1,
    isRead: false,
    isDelivered: false,
    sentAt: "2025-12-01T07:00:00Z",
    createdAt: "2025-12-01T07:00:00Z"
  }
  */
  
  // Auto-mark as delivered
  socket.emit('markAsDelivered', {
    messageIds: [message.id]
  });
});
```

**Important:** When you reconnect, up to 100 unread messages are automatically sent via this event.

#### 2. User Typing

Another user is typing.

```javascript
socket.on('userTyping', (data) => {
  console.log('User typing:', data);
  /*
  {
    userId: 2,
    isTyping: true
  }
  */
});
```

#### 3. Messages Read

Your messages were read by recipient.

```javascript
socket.on('messagesRead', (data) => {
  console.log('Messages read:', data);
  /*
  {
    messageIds: [1, 2, 3],
    readBy: 2
  }
  */
});
```

#### 4. Messages Delivered

Your messages were delivered to recipient.

```javascript
socket.on('messagesDelivered', (data) => {
  console.log('Messages delivered:', data);
  /*
  {
    messageIds: [4, 5, 6]
  }
  */
});
```

---

## Message Structure

### Message Object

```typescript
{
  id: number;                    // Unique message ID
  content: string;               // Message text
  senderId: number;              // Who sent the message
  sessionId: number;             // Which chat session
  
  // Status tracking
  isRead: boolean;               // Has it been read?
  readAt: string | null;         // When it was read
  isDelivered: boolean;          // Has it been delivered?
  deliveredAt: string | null;    // When it was delivered
  sentAt: string | null;         // When sender sent it
  
  // Timestamps
  createdAt: string;             // Database creation time
  updatedAt: string;             // Last update time
}
```

### Message Status Icons

```typescript
if (message.readAt) {
  return '✓✓ Read';              // Double check - read
} else if (message.deliveredAt) {
  return '✓ Delivered';          // Single check - delivered
} else if (message.sentAt) {
  return '🕐 Sent';              // Clock - sent
}
```

---

## Frontend Integration

### React Example

Complete React chat component with all features:

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function ChatComponent({ token, recipientId }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io('http://localhost:3000/chat', {
      auth: { token }
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected');
      setConnected(false);
    });

    // Receive new messages
    newSocket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
      
      // Auto-mark as delivered
      newSocket.emit('markAsDelivered', {
        messageIds: [message.id]
      });
    });

    // Confirmation that message was sent
    newSocket.on('messageSent', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Other user typing
    newSocket.on('userTyping', (data) => {
      setIsTyping(data.isTyping);
    });

    // Messages read by recipient
    newSocket.on('messagesRead', (data) => {
      setMessages(prev => prev.map(msg => 
        data.messageIds.includes(msg.id)
          ? { ...msg, isRead: true, readAt: new Date().toISOString() }
          : msg
      ));
    });

    // Messages delivered
    newSocket.on('messagesDelivered', (data) => {
      setMessages(prev => prev.map(msg =>
        data.messageIds.includes(msg.id)
          ? { ...msg, isDelivered: true, deliveredAt: new Date().toISOString() }
          : msg
      ));
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

  const handleTyping = (typing) => {
    if (socket) {
      socket.emit('typing', {
        recipientId,
        isTyping: typing
      });
    }
  };

  return (
    <div className="chat-container">
      {/* Connection Status */}
      <div className="status">
        {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      {/* Messages */}
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={msg.senderId === recipientId ? 'received' : 'sent'}>
            <p>{msg.content}</p>
            <small>
              {msg.isRead ? '✓✓ Read' : msg.isDelivered ? '✓ Delivered' : '🕐 Sent'}
              {' '}
              {new Date(msg.sentAt).toLocaleTimeString()}
            </small>
          </div>
        ))}
        {isTyping && <div className="typing">Other user is typing...</div>}
      </div>

      {/* Input */}
      <div className="input-area">
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onFocus={() => handleTyping(true)}
          onBlur={() => handleTyping(false)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatComponent;
```

---

### React Native Example

```javascript
import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Button } from 'react-native';
import io from 'socket.io-client';

function ChatScreen({ token, recipientId }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

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
      
      // Mark as delivered
      newSocket.emit('markAsDelivered', {
        messageIds: [message.id]
      });
    });

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

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.content}</Text>
            <Text>{item.isRead ? '✓✓' : item.isDelivered ? '✓' : '🕐'}</Text>
          </View>
        )}
      />
      <View style={{ flexDirection: 'row' }}>
        <TextInput
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type a message..."
          style={{ flex: 1 }}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}

export default ChatScreen;
```

---

## Testing Tools

### 1. Using Postman

Import the Postman collection: `docs/chat-api.postman_collection.json`

Set these variables:
- `baseUrl`: `http://localhost:3000`
- `token`: Your JWT token

### 2. Using curl

```bash
# Get sessions
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/chat/sessions

# Get messages
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/chat/sessions/1/messages

# Send message
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipientId": 2, "content": "Hello"}' \
  http://localhost:3000/chat/messages

# Mark as read
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messageIds": [1, 2, 3]}' \
  http://localhost:3000/chat/messages/read

# Get unread count
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/chat/unread-count
```

### 3. HTML WebSocket Tester

Open `docs/websocket-test-client.html` in your browser for a visual WebSocket testing interface.

### 4. Node.js CLI Tester

```bash
cd docs
npm install socket.io-client
node test-websocket.js YOUR_JWT_TOKEN
```

---

## Error Handling

### Common Errors

#### 401 Unauthorized
- **Cause:** Invalid or expired JWT token
- **Solution:** Refresh your token and reconnect

#### 403 Forbidden
- **Cause:** Trying to access messages from a session you're not part of
- **Solution:** Only access your own sessions

#### 404 Not Found
- **Cause:** Session or user doesn't exist
- **Solution:** Verify IDs are correct

#### WebSocket Connection Failed
- **Causes:**
  - Invalid JWT token
  - CORS issues
  - Server not running
- **Solutions:**
  - Check token validity
  - Verify server URL is correct
  - Check server logs

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

---

## Best Practices

### 1. Connection Management

```javascript
// Keep socket in global state (React Context, Redux, etc.)
// Reuse single connection instead of creating multiple

const [socket, setSocket] = useState(null);

useEffect(() => {
  const newSocket = io(url, { auth: { token } });
  setSocket(newSocket);
  return () => newSocket.close(); // Cleanup on unmount
}, [token]);
```

### 2. Auto-Mark as Delivered

```javascript
socket.on('newMessage', (message) => {
  // Always mark received messages as delivered
  socket.emit('markAsDelivered', {
    messageIds: [message.id]
  });
});
```

### 3. Mark as Read When Viewing

```javascript
// When user opens/views chat
useEffect(() => {
  if (isViewingChat && unreadMessages.length > 0) {
    socket.emit('markAsRead', {
      messageIds: unreadMessages.map(m => m.id)
    });
  }
}, [isViewingChat, unreadMessages]);
```

### 4. Reconnection Logic

```javascript
const socket = io(url, {
  auth: { token },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

socket.on('connect', () => {
  console.log('Connected/Reconnected');
  // Unread messages automatically sent by server
});
```

### 5. Handle Connection Loss

```javascript
socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Server disconnected, manually reconnect
    socket.connect();
  }
  // else automatic reconnection will happen
});
```

---

## Quick Start Checklist

1. ✅ Get JWT token from authentication endpoint
2. ✅ Connect to WebSocket: `io('http://localhost:3000/chat', { auth: { token } })`
3. ✅ Listen for `newMessage` event
4. ✅ Auto-mark received messages as delivered
5. ✅ Send messages with `sendMessage` event
6. ✅ Mark messages as read when user views them
7. ✅ Handle connection/disconnection events
8. ✅ Show typing indicators
9. ✅ Display message status icons (✓, ✓✓, 🕐)

---

## Support

For issues or questions:
- Check server logs for errors
- Verify JWT token is valid
- Ensure server is running on correct port
- Test with provided tools (Postman, HTML tester)
- Review browser console for WebSocket errors

---

## Changelog

### Version 1.0.0 (December 2025)
- ✅ Real-time messaging via WebSocket
- ✅ REST API endpoints
- ✅ Read receipts and delivery status
- ✅ Typing indicators
- ✅ Online/offline messaging support
- ✅ Automatic unread message delivery on reconnect
- ✅ `sentAt` field for tracking message send time

---

**Happy Coding!** 🚀
