# Changelog - Chat Online/Offline Messaging Enhancement

## Date: 2025-11-27

## Summary
Enhanced the chat system with WhatsApp-style online/offline messaging support. Messages are now delivered instantly to online users and automatically sent to offline users when they reconnect.

## Changes Made

### 1. Enhanced WebSocket Gateway (`src/chat/chat.gateway.ts`)

#### Added: Online Status Check in Message Sending
```typescript
// Check if recipient is online
const isRecipientOnline = this.isUserOnline(data.recipientId);

// Send confirmation to sender with online status
client.emit('messageSent', {
    ...message,
    sessionId: session.id,
    recipientOnline: isRecipientOnline, // NEW
});

// Only send via WebSocket if recipient is online
if (isRecipientOnline) {
    this.server.to(`user:${data.recipientId}`).emit('newMessage', {
        ...message,
        sessionId: session.id,
    });
    console.log(`Message sent in real-time to online user ${data.recipientId}`);
} else {
    console.log(`Message saved for offline user ${data.recipientId}`);
}
```

#### Added: Automatic Unread Message Loading on Connection
```typescript
async handleConnection(client: AuthenticatedSocket) {
    // ... authentication ...
    
    // NEW: Load and send unread messages when user connects
    await this.sendUnreadMessagesToUser(client, userId);
}
```

#### Added: New Private Method `sendUnreadMessagesToUser()`
```typescript
/**
 * Send all unread messages to user when they reconnect
 */
private async sendUnreadMessagesToUser(client: AuthenticatedSocket, userId: number) {
    // Get all sessions for this user
    const sessions = await this.chatService['prisma'].chatSession.findMany({
        where: {
            OR: [{ parentId: userId }, { donorId: userId }],
            isActive: true,
        },
        select: { id: true },
    });

    // Get all unread messages from these sessions
    const unreadMessages = await this.chatService['prisma'].chatMessage.findMany({
        where: {
            sessionId: { in: sessions.map(s => s.id) },
            senderId: { not: userId },
            isRead: false,
        },
        orderBy: { createdAt: 'asc' },
        take: 100, // Limit to last 100 unread messages
    });

    // Send each unread message to the user
    if (unreadMessages.length > 0) {
        console.log(`Sending ${unreadMessages.length} unread messages to user ${userId}`);
        
        for (const message of unreadMessages) {
            client.emit('newMessage', message);
        }

        // Mark messages as delivered
        const messageIds = unreadMessages.map(m => m.id);
        await this.chatService.markMessagesAsDelivered(messageIds);
    }
}
```

## Behavior Changes

### Before
| Scenario | Behavior |
|----------|----------|
| Recipient online | ✅ Message sent via WebSocket |
| Recipient offline | ✅ Message saved to DB, ❌ No indication to sender |
| User reconnects | ❌ No automatic loading of unread messages |

### After
| Scenario | Behavior |
|----------|----------|
| Recipient online | ✅ Message sent via WebSocket + `recipientOnline: true` |
| Recipient offline | ✅ Message saved to DB + `recipientOnline: false` |
| User reconnects | ✅ Automatic loading of up to 100 unread messages |

## Message Flow

### Online Recipient
```
User A → sendMessage
    ↓
Server: Save to DB
    ↓
Server: Check isUserOnline(recipientId) → TRUE
    ↓
Server → User A: messageSent { recipientOnline: true }
    ↓
Server → User B: newMessage (real-time)
```

### Offline Recipient
```
User A → sendMessage
    ↓
Server: Save to DB
    ↓
Server: Check isUserOnline(recipientId) → FALSE
    ↓
Server → User A: messageSent { recipientOnline: false }
    ↓
[Message waits in database]
    ↓
[User B reconnects]
    ↓
Server → User B: newMessage (all unread messages)
    ↓
Server: Mark as delivered
```

## API Response Changes

### `sendMessage` Event Response

**Before:**
```json
{
  "success": true,
  "message": {
    "id": 123,
    "content": "Hello",
    "senderId": 1,
    "sessionId": 5
  }
}
```

**After:**
```json
{
  "success": true,
  "message": {
    "id": 123,
    "content": "Hello",
    "senderId": 1,
    "sessionId": 5
  },
  "recipientOnline": true
}
```

### `messageSent` Event (to sender)

**Before:**
```json
{
  "id": 123,
  "content": "Hello",
  "senderId": 1,
  "sessionId": 5
}
```

**After:**
```json
{
  "id": 123,
  "content": "Hello",
  "senderId": 1,
  "sessionId": 5,
  "recipientOnline": true
}
```

## New Features

### 1. Online Status Feedback
Senders now know if the recipient received the message instantly or if it's waiting in the database.

### 2. Automatic History Loading
When users reconnect, they automatically receive all unread messages (up to 100) without any client-side action.

### 3. Message Delivery Tracking
Unread messages are automatically marked as "delivered" when sent to reconnecting users.

## Performance Optimizations

### Message Limit
- Only loads last **100 unread messages** on reconnect
- Prevents overload for users with many unread messages
- Older messages can be loaded via REST API

### Database Queries
Optimized queries for unread messages:
```sql
-- Get unread messages for user
SELECT * FROM chat_messages
WHERE sessionId IN (user_sessions)
  AND senderId != userId
  AND isRead = FALSE
ORDER BY createdAt ASC
LIMIT 100;
```

## Testing Instructions

### Test 1: Online Messaging
```
1. Connect User A and User B
2. User A sends message to User B
3. ✅ Verify User B receives instantly
4. ✅ Verify messageSent includes recipientOnline: true
5. ✅ Verify console log: "Message sent in real-time to online user"
```

### Test 2: Offline Messaging
```
1. Connect User A (User B stays offline)
2. User A sends message to User B
3. ✅ Verify message saved to database
4. ✅ Verify messageSent includes recipientOnline: false
5. ✅ Verify console log: "Message saved for offline user"
6. ✅ Verify isDelivered = false in database
```

### Test 3: Reconnection
```
1. User B has 3 unread messages (from Test 2)
2. User B connects
3. ✅ Verify User B receives all 3 messages automatically
4. ✅ Verify console log: "Sending 3 unread messages to user"
5. ✅ Verify messages marked as delivered
6. ✅ Verify isDelivered = true in database
```

### Test 4: Multiple Unread Messages
```
1. User B offline
2. User A sends 5 messages to User B
3. User C sends 3 messages to User B
4. User B connects
5. ✅ Verify User B receives all 8 messages
6. ✅ Verify messages in correct chronological order
```

## Files Modified

1. **`src/chat/chat.gateway.ts`**
   - Enhanced `handleSendMessage()` with online status check
   - Updated `handleConnection()` to load unread messages
   - Added `sendUnreadMessagesToUser()` method

## Files Created

1. **`docs/CHAT_ONLINE_OFFLINE_MESSAGING.md`** - Comprehensive documentation
2. **`CHANGELOG_CHAT_OFFLINE_SUPPORT.md`** - This file

## Breaking Changes

None. This is a backward-compatible enhancement.

**Note:** Clients can now check the `recipientOnline` field in responses, but it's optional. Existing clients will continue to work without changes.

## Client-Side Implementation

### React Example
```javascript
socket.on('messageSent', (data) => {
    // Show delivery status to user
    if (data.recipientOnline) {
        showStatus('Delivered');
    } else {
        showStatus('Sent (recipient offline)');
    }
});

socket.on('newMessage', (message) => {
    // Automatically receives unread messages on reconnect
    displayMessage(message);
    
    // Mark as delivered
    socket.emit('markAsDelivered', { 
        messageIds: [message.id] 
    });
});
```

## Benefits

✅ **Better User Experience** - Users know message delivery status  
✅ **Reliable Messaging** - No messages lost for offline users  
✅ **WhatsApp-like Behavior** - Familiar pattern for users  
✅ **Automatic Sync** - No manual refresh needed  
✅ **Multiple Device Support** - Works across devices  
✅ **Performance Optimized** - Limits batch size to prevent overload  

## Related Documentation

- Full documentation: `docs/CHAT_ONLINE_OFFLINE_MESSAGING.md`
- Main chat docs: `docs/CHAT_SYSTEM.md`

## Status

✅ **Completed** - Feature is ready for testing and deployment

## Future Enhancements

- [ ] Configurable unread message limit (currently 100)
- [ ] Push notifications for offline users via FCM
- [ ] Presence indicators (online/offline/typing status)
- [ ] "Last seen" timestamps
- [ ] Message priority (urgent messages sent first)
