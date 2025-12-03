# Mom's Milk API Documentation

Welcome to the Mom's Milk API documentation! This directory contains all the resources you need to integrate with our chat system.

---

## 📚 Chat API Documentation

### For Frontend Developers

**Main Documentation:** [`CHAT_API_DOCUMENTATION.md`](./CHAT_API_DOCUMENTATION.md)

This comprehensive guide includes:
- ✅ REST API endpoints with examples
- ✅ WebSocket API with all events
- ✅ Complete React & React Native integration examples
- ✅ Message structure and status tracking
- ✅ Best practices and error handling
- ✅ Testing tools and troubleshooting

**Start here!** This is the single source of truth for chat integration.

---

## 🧪 Testing Resources

### 1. Postman Collection
**File:** [`chat-api.postman_collection.json`](./chat-api.postman_collection.json)

Import this into Postman to test all REST API endpoints:
- Get chat sessions
- Get messages
- Send messages
- Mark as read
- Get unread count

### 2. HTML WebSocket Tester
**File:** [`websocket-test-client.html`](./websocket-test-client.html)

Open in browser for visual WebSocket testing:
- Real-time connection monitoring
- Send/receive messages
- Test typing indicators
- Mark messages as read/delivered
- Color-coded event log

### 3. Node.js CLI Tester
**File:** [`test-websocket.js`](./test-websocket.js)

Command-line WebSocket testing tool:
```bash
cd docs
npm install socket.io-client
node test-websocket.js YOUR_JWT_TOKEN
```

### 4. API Specification (JSON)
**File:** [`chat-api.json`](./chat-api.json)

Complete API specification in JSON format for:
- API documentation tools
- Code generation
- Reference

---

## 🚀 Quick Start

1. **Read the Documentation**
   - Open [`CHAT_API_DOCUMENTATION.md`](./CHAT_API_DOCUMENTATION.md)
   - Review the REST and WebSocket APIs
   - Check the React/React Native examples

2. **Get Authentication Token**
   - Login via your auth endpoint
   - Copy the JWT token

3. **Test with Tools**
   - Import Postman collection
   - Try the HTML WebSocket tester
   - Test REST endpoints with curl

4. **Integrate in Your App**
   - Use the React/React Native examples
   - Implement WebSocket connection
   - Handle all events (newMessage, messageSent, etc.)

---

## 📂 File Structure

```
docs/
├── README.md                           ← You are here
├── CHAT_API_DOCUMENTATION.md          ← Main documentation (START HERE)
├── chat-api.json                       ← API spec (JSON format)
├── chat-api.postman_collection.json   ← Postman collection
├── websocket-test-client.html         ← Browser-based tester
└── test-websocket.js                   ← CLI tester
```

---

## 🔑 Key Features

- **Real-time Messaging** - WebSocket-based instant delivery
- **Offline Support** - Messages saved when user is offline
- **Read Receipts** - Double checkmark (✓✓) when read
- **Delivery Status** - Single checkmark (✓) when delivered
- **Typing Indicators** - See when other user is typing
- **Auto-Reconnection** - Unread messages loaded on reconnect
- **REST Fallback** - Use REST API when WebSocket unavailable

---

## 💡 Common Tasks

### Connect to WebSocket
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
  auth: { token: 'your-jwt-token' }
});
```

### Send a Message
```javascript
socket.emit('sendMessage', {
  recipientId: 2,
  content: 'Hello!'
});
```

### Receive Messages
```javascript
socket.on('newMessage', (message) => {
  console.log('New message:', message);
  
  // Mark as delivered
  socket.emit('markAsDelivered', {
    messageIds: [message.id]
  });
});
```

### Get Chat Sessions (REST)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/chat/sessions
```

---

## 📞 Support

Having issues? Check:
1. **Main Documentation** - Most questions answered there
2. **Server Logs** - Look for error messages
3. **Browser Console** - Check for WebSocket errors
4. **JWT Token** - Ensure it's valid and not expired
5. **Testing Tools** - Use Postman or HTML tester to isolate issues

---

## 🎯 For Backend/API Developers

If you need backend documentation:
- Check the source code in `src/chat/`
- Review Prisma schema in `prisma/schema.prisma`
- See migrations in `prisma/migrations/`

---

**Last Updated:** December 2, 2025  
**Version:** 1.0.0
