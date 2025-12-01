# sentAt Field - Quick Reference

## 📝 What Changed?

Added `sentAt` timestamp to chat messages to track when each message was sent.

---

## 🎯 Key Information

| Item | Value |
|------|-------|
| **Field Name** | `sentAt` |
| **Type** | `DateTime?` (nullable) |
| **Database Column** | `sentAt DATETIME(3) NULL` |
| **Table** | `chat_messages` |
| **Migration** | `20251201072552_add_sent_at_to_chat_messages` |
| **Status** | ✅ Applied |

---

## 📊 Message Timestamps Overview

```
sentAt        → When sender clicked "Send"
deliveredAt   → When recipient received message  
readAt        → When recipient read message
createdAt     → Database record creation time
updatedAt     → Last database update time
```

---

## 💻 Code Changes

### Database Schema
```prisma
model ChatMessage {
  // ... other fields
  
  sentAt        DateTime? // ✨ NEW
  deliveredAt   DateTime?
  readAt        DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Chat Service
```typescript
const message = await this.prisma.chatMessage.create({
  data: {
    content,
    senderId,
    sessionId: session.id,
    sentAt: new Date(), // ✨ NEW
  },
});
```

---

## 📤 API Response Example

```json
{
  "id": 123,
  "content": "Hello!",
  "senderId": 1,
  "sessionId": 1,
  "isRead": true,
  "readAt": "2025-12-01T07:01:00Z",
  "isDelivered": true,
  "deliveredAt": "2025-12-01T07:00:30Z",
  "sentAt": "2025-12-01T07:00:00Z",      ← NEW
  "createdAt": "2025-12-01T07:00:00Z",
  "updatedAt": "2025-12-01T07:01:00Z"
}
```

---

## 🔌 WebSocket Events

### Sending Message
```javascript
socket.emit('sendMessage', {
  recipientId: 2,
  content: 'Hello!'
});
```

### Receiving Confirmation
```javascript
socket.on('messageSent', (data) => {
  console.log(data.sentAt); // "2025-12-01T07:00:00Z"
});
```

### Receiving New Message
```javascript
socket.on('newMessage', (message) => {
  console.log(message.sentAt); // "2025-12-01T07:00:00Z"
});
```

---

## 🎨 UI Display Examples

### Basic Display
```typescript
const sentTime = new Date(message.sentAt);
display(`Sent at ${sentTime.toLocaleTimeString()}`);
```

### Message Status Icons
```typescript
if (message.readAt) {
  return '✓✓ Read';
} else if (message.deliveredAt) {
  return '✓ Delivered';
} else if (message.sentAt) {
  return '🕐 Sent';
}
```

### Calculate Delays
```typescript
// Time to deliver
const deliveryTime = 
  new Date(message.deliveredAt) - new Date(message.sentAt);

// Time to read
const readTime = 
  new Date(message.readAt) - new Date(message.sentAt);
```

---

## 🧪 Testing

### REST API
```bash
# Send message
curl -X POST http://localhost:3000/chat/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipientId": 2, "content": "Test"}'

# Get messages
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/chat/sessions/1/messages
```

### Database
```sql
-- View recent messages with sentAt
SELECT id, content, sentAt, deliveredAt, readAt 
FROM chat_messages 
ORDER BY sentAt DESC 
LIMIT 10;
```

---

## ⚠️ Important Notes

1. **New messages only**: Old messages have `sentAt = null`
2. **Always set**: All new messages will have sentAt populated
3. **Use for display**: Use `sentAt` for showing users when message was sent
4. **Not same as createdAt**: Though usually the same, they serve different purposes

---

## 📚 Full Documentation

- Detailed changelog: `docs/CHANGELOG_SENT_AT_FIELD.md`
- API documentation: `docs/chat-api.json`
- WebSocket testing: `docs/WEBSOCKET_TESTING_GUIDE.md`

---

**Updated:** December 1, 2025
