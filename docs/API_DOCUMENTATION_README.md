# Chat API Documentation

This directory contains comprehensive API documentation for the Mom's Milk chat system.

## 📁 Available Files

### 1. `chat-api.json`
**Comprehensive API specification** in JSON format.

**Contains:**
- Complete REST API endpoints with examples
- WebSocket events (client→server and server→client)
- Request/response schemas
- Authentication details
- Error codes
- Code examples (JavaScript, React, curl)
- Best practices
- Message state flow diagrams

**Use for:**
- Developer reference
- API documentation generators
- Frontend integration planning
- Testing reference

---

### 2. `chat-api.postman_collection.json`
**Postman Collection** for REST API testing.

**How to import:**
1. Open Postman
2. Click "Import" button
3. Select `chat-api.postman_collection.json`
4. Collection will be imported with all endpoints

**Before testing:**
1. Update the `token` variable with your JWT token:
   - Click on the collection
   - Go to "Variables" tab
   - Update `token` value with your actual JWT token

2. (Optional) Update `baseUrl` if not using localhost:
   - Default: `http://localhost:3000`
   - Change to your server URL if different

**Endpoints included:**
- Get Chat Sessions
- Get Messages for a Session
- Send Message (REST)
- Mark Messages as Read
- Get Unread Count
- Get or Create Session

---

## 🚀 Quick Start Guide

### REST API Testing with Postman

1. **Import Collection**
   ```
   File → Import → chat-api.postman_collection.json
   ```

2. **Set Environment Variables**
   - `baseUrl`: http://localhost:3000
   - `token`: your-jwt-token-here

3. **Test an Endpoint**
   - Select "Get Chat Sessions"
   - Click "Send"
   - View response

### REST API Testing with curl

```bash
# Get chat sessions
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/chat/sessions?page=1&limit=20

# Get messages for a session
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/chat/sessions/1/messages?page=1&limit=50

# Send a message
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipientId": 2, "content": "Hello"}' \
  http://localhost:3000/chat/messages

# Mark messages as read
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messageIds": [1,2,3]}' \
  http://localhost:3000/chat/messages/read

# Get unread count
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/chat/unread-count
```

### WebSocket Testing

#### Option 1: HTML WebSocket Tester (Recommended)

Open `websocket-test-client.html` in your browser for a full-featured testing interface.

Features:
- Visual connection status
- All WebSocket events supported
- Real-time event log
- Easy-to-use UI
- No installation required

How to use:
1. Open `docs/websocket-test-client.html` in a browser
2. Enter your server URL (default: http://localhost:3000)
3. Paste your JWT token
4. Click "Connect"
5. Use the forms to test different events

#### Option 2: Node.js CLI Tester

Run the command-line WebSocket tester.

Installation:
```bash
cd docs
npm install socket.io-client
```

Usage:
```bash
node test-websocket.js <your-jwt-token>
# or
node test-websocket.js <your-jwt-token> http://your-server:3000
```

Features:
- Interactive menu
- Color-coded output
- All WebSocket events
- Real-time responses

#### Option 3: Socket.IO Client (Custom)

Using Socket.IO Client:

```javascript
const io = require('socket.io-client');

// Connect
const socket = io('http://localhost:3000/chat', {
  auth: { token: 'your-jwt-token' }
});

// Listen for connection
socket.on('connect', () => {
  console.log('Connected to chat');
});

// Send a message
socket.emit('sendMessage', {
  recipientId: 2,
  content: 'Hello!'
});

// Receive messages
socket.on('newMessage', (message) => {
  console.log('New message:', message);
});

// Disconnect
socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

**Using Browser Console:**

```javascript
// Include Socket.IO client library first
const socket = io('http://localhost:3000/chat', {
  auth: { token: localStorage.getItem('token') }
});

socket.on('connect', () => console.log('✅ Connected'));
socket.on('newMessage', msg => console.log('📨', msg));
socket.emit('sendMessage', { recipientId: 2, content: 'Hi' });
```

---

## 📖 API Overview

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat/sessions` | List all chat sessions |
| GET | `/chat/sessions/:id/messages` | Get messages for a session |
| POST | `/chat/messages` | Send message (REST fallback) |
| POST | `/chat/messages/read` | Mark messages as read |
| GET | `/chat/unread-count` | Get unread message count |
| GET | `/chat/session/:userId` | Get/create session with user |

### WebSocket Events

#### Client → Server

| Event | Purpose |
|-------|---------|
| `sendMessage` | Send a message |
| `joinSession` | Join a chat session room |
| `leaveSession` | Leave a chat session room |
| `typing` | Send typing indicator |
| `markAsRead` | Mark messages as read |
| `markAsDelivered` | Mark messages as delivered |

#### Server → Client

| Event | Purpose |
|-------|---------|
| `messageSent` | Confirmation of sent message |
| `newMessage` | New message received |
| `userTyping` | Other user is typing |
| `messagesRead` | Your messages were read |
| `messagesDelivered` | Your messages were delivered |

---

## 🔐 Authentication

All endpoints and WebSocket connections require JWT authentication.

### REST API
```
Authorization: Bearer <jwt-token>
```

### WebSocket
```javascript
io('http://localhost:3000/chat', {
  auth: { token: 'your-jwt-token' }
})
```

---

## 📱 Frontend Integration

### React Example

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function ChatComponent({ token, recipientId }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000/chat', {
      auth: { token }
    });

    newSocket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, [token]);

  const sendMessage = (content) => {
    socket?.emit('sendMessage', { recipientId, content });
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
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

    newSocket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, [token]);

  return (
    // Your React Native UI
  );
}
```

---

## ⚠️ Error Codes

| Code | Description | Example |
|------|-------------|---------|
| 401 | Unauthorized | Invalid/missing JWT token |
| 403 | Forbidden | No access to resource |
| 404 | Not Found | Session doesn't exist |
| 500 | Server Error | Internal error |

---

## ✅ Message States

Messages go through three states:

```
SENT (✓) → DELIVERED (✓✓) → READ (✓✓ blue)
```

### State Details

**SENT**
- Message saved to database
- Single checkmark: ✓
- `isDelivered: false, isRead: false`

**DELIVERED**
- Message received by recipient's device
- Double checkmark: ✓✓
- `isDelivered: true, isRead: false`

**READ**
- Message opened by recipient
- Double checkmark (blue): ✓✓
- `isDelivered: true, isRead: true`

---

## 🔄 Online/Offline Behavior

### Online User
```
User A → Send Message
    ↓
✅ Save to DB
    ↓
✅ Check: User B online? → YES
    ↓
✅ Send via WebSocket (instant)
```

### Offline User
```
User A → Send Message
    ↓
✅ Save to DB
    ↓
✅ Check: User B online? → NO
    ↓
💾 Message waits in database
    ↓
[User B reconnects]
    ↓
✅ Auto-send unread messages (up to 100)
```

---

## 🛠️ Best Practices

1. **Always save messages to database first** before WebSocket
2. **Mark as delivered** when receiving via `newMessage`
3. **Mark as read** when user opens/views the chat
4. **Handle disconnections** with reconnection logic
5. **Use `recipientOnline`** to show delivery status
6. **Implement typing indicators** for better UX
7. **Load older messages** via REST API on scroll
8. **Use WebSocket for real-time**, REST as fallback
9. **Store JWT securely** (not in localStorage for production)
10. **Implement exponential backoff** for reconnection

---

## 📚 Additional Documentation

- **Main Chat Documentation**: `CHAT_SYSTEM.md`
- **Online/Offline Messaging**: `CHAT_ONLINE_OFFLINE_MESSAGING.md`
- **Changelog**: `CHANGELOG_CHAT_OFFLINE_SUPPORT.md`

---

## 🧪 Testing Checklist

### REST API Testing
- [ ] Get chat sessions with valid token
- [ ] Get messages for a specific session
- [ ] Send message via REST
- [ ] Mark messages as read
- [ ] Get unread count
- [ ] Test with invalid token (401)
- [ ] Test with invalid session ID (404)

### WebSocket Testing
- [ ] Connect with valid token
- [ ] Send message to online user
- [ ] Send message to offline user
- [ ] Receive messages
- [ ] Typing indicators
- [ ] Mark as read/delivered
- [ ] Reconnection with unread messages
- [ ] Disconnect handling

---

## 💡 Tips

### For Testing
- Use Postman for REST API testing
- Use Socket.IO client for WebSocket testing
- Check browser console for WebSocket events
- Monitor network tab for real-time events

### For Development
- Refer to `chat-api.json` for complete specs
- Use code examples as starting templates
- Follow message state flow for UI updates
- Implement proper error handling

### For Debugging
- Check JWT token validity
- Verify WebSocket connection status
- Monitor console logs for events
- Test both online and offline scenarios

---

## 📞 Support

For issues or questions:
- Check main documentation in `CHAT_SYSTEM.md`
- Review code examples in `chat-api.json`
- Test endpoints using Postman collection
- Verify WebSocket connection and authentication

---

## 📄 License

Part of the Mom's Milk API project.
