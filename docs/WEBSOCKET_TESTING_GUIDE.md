# WebSocket Testing Guide

Complete guide for testing the Mom's Milk chat WebSocket API.

## 🔧 Available Tools

### 1. HTML WebSocket Tester (Recommended) ⭐

**File:** `websocket-test-client.html`

**Best for:** Visual testing, beginners, quick testing

#### Features
- ✅ Beautiful web interface
- ✅ Real-time connection status
- ✅ Event log with color coding
- ✅ All WebSocket events supported
- ✅ No installation required
- ✅ Works in any modern browser
- ✅ Keyboard shortcuts (Ctrl+Enter to send)

#### How to Use

1. **Open the file**
   ```bash
   # Open in default browser
   start docs/websocket-test-client.html
   
   # Or open manually
   # Navigate to docs/websocket-test-client.html in your browser
   ```

2. **Configure connection**
   - Server URL: `http://localhost:3000` (or your server)
   - JWT Token: Paste your authentication token

3. **Click "Connect"**
   - Status will change to 🟢 Connected

4. **Test features**
   - Send Message: Fill form and click "Send Message"
   - Join/Leave Session: Enter session ID and click button
   - Typing Indicators: Test "Start Typing" / "Stop Typing"
   - Mark Actions: Enter message IDs and mark as read/delivered

5. **Watch the event log**
   - All events appear in real-time
   - Color-coded by type (success, error, info, warning)
   - Timestamps included

#### Screenshot

```
┌─────────────────────────────────────────┐
│ 🔌 Chat WebSocket Tester               │
│ Test your Mom's Milk chat WebSocket    │
├─────────────────────────────────────────┤
│ Connection Settings    │ Send Message   │
│ Server: localhost:3000 │ Recipient: 2   │
│ Token: [paste here]    │ Message: Hi!   │
│ 🟢 Connected           │ [Send Message] │
├─────────────────────────────────────────┤
│ Event Log                               │
│ [12:30:15] ✅ Connected successfully!   │
│ [12:30:20] 📤 Message Sent: {...}       │
│ [12:30:21] 📨 New Message Received      │
└─────────────────────────────────────────┘
```

---

### 2. Node.js CLI Tester

**File:** `test-websocket.js`

**Best for:** Command line users, automation, scripting

#### Features
- ✅ Interactive CLI menu
- ✅ Color-coded terminal output
- ✅ All WebSocket events
- ✅ Keyboard-driven interface
- ✅ Real-time event display
- ✅ No browser needed

#### Installation

```bash
# Navigate to docs directory
cd docs

# Install socket.io-client
npm install socket.io-client
```

#### Usage

```bash
# Basic usage
node test-websocket.js YOUR_JWT_TOKEN

# With custom server
node test-websocket.js YOUR_JWT_TOKEN http://your-server:3000
```

#### Example Session

```bash
$ node test-websocket.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

🔌 Mom's Milk Chat WebSocket Tester

Server: http://localhost:3000/chat
Token: eyJhbGciOiJIUzI1NiIsI...

────────────────────────────────────────────────────────────────────────────────
[7:15:30 PM] ℹ️  Connecting to http://localhost:3000/chat...
[7:15:30 PM] ✅ Connected successfully!
[7:15:30 PM] ✅ Socket ID: abc123xyz
────────────────────────────────────────────────────────────────────────────────

📋 Available Commands:
  1. Send Message
  2. Join Session
  3. Leave Session
  4. Start Typing
  5. Stop Typing
  6. Mark as Read
  7. Mark as Delivered
  8. Show Menu
  9. Disconnect
  0. Exit

> 1
Recipient ID: 2
Message: Hello from CLI!
[7:15:45 PM] ℹ️  Sending message: "Hello from CLI!" to user 2
────────────────────────────────────────────────────────────────────────────────
[7:15:45 PM] ✅ 📤 Message Sent:
{
  "id": 123,
  "content": "Hello from CLI!",
  "senderId": 1,
  "sessionId": 5,
  "recipientOnline": true
}
────────────────────────────────────────────────────────────────────────────────
> 
```

---

### 3. Custom Socket.IO Client

**Best for:** Custom integration, automated testing

#### Basic Example

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000/chat', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => {
  console.log('Connected!');
  
  // Send a message
  socket.emit('sendMessage', {
    recipientId: 2,
    content: 'Hello!'
  });
});

socket.on('newMessage', (message) => {
  console.log('Received:', message);
});
```

#### Advanced Example with All Events

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000/chat', {
  auth: { token: process.env.JWT_TOKEN }
});

// Connection events
socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

// Message events
socket.on('messageSent', (data) => {
  console.log('📤 Sent:', data);
});

socket.on('newMessage', (data) => {
  console.log('📨 Received:', data);
  
  // Auto-mark as delivered
  socket.emit('markAsDelivered', {
    messageIds: [data.id]
  });
});

// Typing events
socket.on('userTyping', (data) => {
  if (data.isTyping) {
    console.log(`⌨️  User ${data.userId} is typing...`);
  }
});

// Read/Delivered events
socket.on('messagesRead', (data) => {
  console.log(`✓✓ Read by user ${data.readBy}:`, data.messageIds);
});

socket.on('messagesDelivered', (data) => {
  console.log('✓ Delivered:', data.messageIds);
});

// Send a message after connecting
socket.on('connect', () => {
  socket.emit('sendMessage', {
    recipientId: 2,
    content: 'Test message'
  });
});
```

---

## 📋 Testing Checklist

### Connection Testing
- [ ] Connect with valid JWT token
- [ ] Connect with invalid token (should fail)
- [ ] Connect to wrong URL (should fail)
- [ ] Disconnect and reconnect
- [ ] Check connection status updates

### Message Testing
- [ ] Send message to online user
- [ ] Send message to offline user
- [ ] Receive `messageSent` confirmation
- [ ] Check `recipientOnline` field
- [ ] Receive `newMessage` event
- [ ] Send empty message (should fail)
- [ ] Send to invalid recipient (should fail)

### Session Testing
- [ ] Join a session
- [ ] Leave a session
- [ ] Join invalid session
- [ ] Join/leave same session multiple times

### Typing Indicator Testing
- [ ] Start typing
- [ ] Stop typing
- [ ] Receive typing notification from other user
- [ ] Multiple typing indicators

### Read/Delivered Testing
- [ ] Mark messages as read
- [ ] Mark messages as delivered
- [ ] Verify sender receives notifications
- [ ] Mark with invalid message IDs

### Reconnection Testing
- [ ] Disconnect and reconnect
- [ ] Receive unread messages on reconnect
- [ ] Messages are marked as delivered
- [ ] Connection state is restored

---

## 🐛 Troubleshooting

### Connection Failed

**Problem:** Cannot connect to WebSocket

**Solutions:**
1. Verify server is running
   ```bash
   curl http://localhost:3000/health
   ```

2. Check JWT token validity
   - Token should not be expired
   - Token should be from your authentication endpoint

3. Verify server URL
   - Should be `http://localhost:3000` (not `/chat`)
   - Include protocol (http:// or https://)

4. Check CORS settings
   - Server should allow your origin
   - Check browser console for CORS errors

### Authentication Error

**Problem:** "Connection error: Unauthorized"

**Solutions:**
1. Get fresh JWT token
   ```bash
   # Login via your auth endpoint
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "password"}'
   ```

2. Verify token format
   - Should be the raw JWT string
   - Don't include "Bearer " prefix for WebSocket
   - Check for extra spaces or newlines

### Messages Not Received

**Problem:** Can send but not receive messages

**Solutions:**
1. Check event listeners
   ```javascript
   socket.on('newMessage', (data) => {
     console.log('Received:', data);
   });
   ```

2. Verify recipient is different from sender
   - Can't send messages to yourself

3. Check database
   - Message should be saved even if not delivered

4. Monitor event log
   - HTML tester shows all events in real-time

### Token Expired

**Problem:** "Session expired" or similar

**Solutions:**
1. Refresh your token
2. Re-authenticate
3. Reconnect with new token

---

## 💡 Tips & Best Practices

### For Development
1. **Keep the HTML tester open** while developing
   - See real-time events
   - Quick testing of changes

2. **Use multiple browser tabs**
   - Test online/offline scenarios
   - Simulate multiple users

3. **Monitor the event log**
   - Understand event flow
   - Debug issues quickly

### For Testing
1. **Test edge cases**
   - Invalid inputs
   - Offline recipients
   - Network disconnections

2. **Use the CLI tester** for automation
   - Script repetitive tests
   - Integration testing

3. **Check both directions**
   - Send and receive
   - Read receipts work both ways

### For Production
1. **Never hardcode tokens**
   ```javascript
   // Bad
   const token = 'eyJhbGciOiJI...';
   
   // Good
   const token = process.env.JWT_TOKEN;
   ```

2. **Handle errors gracefully**
   ```javascript
   socket.on('connect_error', (error) => {
     // Implement exponential backoff
     // Show user-friendly message
   });
   ```

3. **Implement reconnection logic**
   ```javascript
   const socket = io(url, {
     auth: { token },
     reconnection: true,
     reconnectionDelay: 1000,
     reconnectionAttempts: 5
   });
   ```

---

## 📚 Related Documentation

- **API Specification:** `chat-api.json`
- **Postman Collection:** `chat-api.postman_collection.json`
- **Main Documentation:** `API_DOCUMENTATION_README.md`
- **Chat System Overview:** `CHAT_SYSTEM.md`

---

## ⌨️ Keyboard Shortcuts (HTML Tester)

- `Ctrl + Enter` - Send message
- `F5` - Refresh page
- `Esc` - Clear current input

---

## 🎯 Quick Start

### Fastest way to test (1 minute)

1. **Get your JWT token**
   - Login via your app or Postman
   - Copy the token

2. **Open HTML tester**
   ```bash
   start docs/websocket-test-client.html
   ```

3. **Connect**
   - Paste token
   - Click "Connect"

4. **Send a test message**
   - Recipient ID: 2
   - Message: "Hello!"
   - Click "Send Message"

Done! ✅

---

## 📞 Support

If you encounter issues:
1. Check the event log for error details
2. Verify server is running and accessible
3. Confirm JWT token is valid
4. Review main documentation
5. Check browser/terminal console for errors

---

**Happy Testing!** 🚀
