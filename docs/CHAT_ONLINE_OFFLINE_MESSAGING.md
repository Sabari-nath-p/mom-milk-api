# Chat System: Online/Offline Messaging

## Overview

The chat system implements **WhatsApp-style messaging** where messages are delivered in real-time to online users and stored for offline users to receive when they reconnect.

## How It Works

### 🎯 Core Principle

**Every message is ALWAYS saved to the database first**, regardless of whether the recipient is online or offline. This ensures message history is never lost.

```
User A sends message to User B
    ↓
1. ✅ Save to database (always)
2. ✅ Check if User B is online
3a. If ONLINE  → Send via WebSocket (real-time)
3b. If OFFLINE → Message waits in database
```

## Message Flow Diagrams

### Scenario 1: Both Users Online

```
User A (Online)                    Server                    User B (Online)
     |                               |                              |
     |---- sendMessage ------------->|                              |
     |                               |                              |
     |                         [Save to DB]                         |
     |                               |                              |
     |                         [Check: B online?]                   |
     |                               |                              |
     |<-- messageSent (confirmed) ---|                              |
     |    { recipientOnline: true }  |                              |
     |                               |                              |
     |                               |---- newMessage ------------->|
     |                               |    (real-time delivery)      |
     |                               |                              |
```

✅ Message saved to DB  
✅ Delivered instantly via WebSocket  
✅ Sender knows recipient received it

### Scenario 2: Recipient Offline

```
User A (Online)                    Server                    User B (OFFLINE)
     |                               |                              
     |---- sendMessage ------------->|                              
     |                               |                              
     |                         [Save to DB]                         
     |                               |                              
     |                         [Check: B online?]                   
     |                         [Answer: NO]                   
     |                               |                              
     |<-- messageSent (confirmed) ---|                              
     |    { recipientOnline: false } |                              
     |                               |                              
     |                         [Message waits                       
     |                          in database]                        
```

✅ Message saved to DB  
❌ Not sent via WebSocket (user offline)  
✅ Sender knows recipient is offline

### Scenario 3: User Reconnects

```
User B (Reconnecting)              Server                    Database
     |                               |                              |
     |---- Connect (JWT token) ----->|                              |
     |                               |                              |
     |                         [Authenticate]                       |
     |                               |                              |
     |                               |---- Query unread messages -->|
     |                               |<--- Return unread messages --|
     |                               |                              |
     |<-- newMessage (message 1) ----|                              |
     |<-- newMessage (message 2) ----|                              |
     |<-- newMessage (message 3) ----|                              |
     |                               |                              |
     |                         [Mark as delivered]                  |
     |                               |                              |
```

✅ All unread messages sent automatically  
✅ Messages marked as delivered  
✅ User receives full chat history

## Implementation Details

### 1. Online Status Tracking

```typescript
// Map to track connected users
private userSockets: Map<number, Set<string>> = new Map();

// Check if user is online
isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId) && 
           this.userSockets.get(userId).size > 0;
}
```

**Key Points:**
- Each user ID maps to a Set of socket IDs
- Users can have multiple connections (multiple devices/tabs)
- User is "online" if they have at least one active socket

### 2. Message Sending Logic

```typescript
// ALWAYS save to database first
const message = await this.chatService.sendMessage(senderId, {
    recipientId: data.recipientId,
    content: data.content,
});

// Check online status
const isRecipientOnline = this.isUserOnline(data.recipientId);

// Send to sender (confirmation)
client.emit('messageSent', {
    ...message,
    sessionId: session.id,
    recipientOnline: isRecipientOnline, // Let sender know
});

// If recipient is online, deliver in real-time
if (isRecipientOnline) {
    this.server.to(`user:${data.recipientId}`).emit('newMessage', {
        ...message,
        sessionId: session.id,
    });
}
// If offline, message stays in DB until they reconnect
```

### 3. Reconnection Logic

```typescript
async handleConnection(client: AuthenticatedSocket) {
    // ... authentication ...
    
    // Automatically load and send unread messages
    await this.sendUnreadMessagesToUser(client, userId);
}

private async sendUnreadMessagesToUser(client: AuthenticatedSocket, userId: number) {
    // Get all unread messages
    const unreadMessages = await this.prisma.chatMessage.findMany({
        where: {
            sessionId: { in: userSessionIds },
            senderId: { not: userId },
            isRead: false,
        },
        orderBy: { createdAt: 'asc' },
        take: 100, // Last 100 unread messages
    });

    // Send each message to the user
    for (const message of unreadMessages) {
        client.emit('newMessage', message);
    }

    // Mark as delivered
    await this.chatService.markMessagesAsDelivered(messageIds);
}
```

## Database Schema

### ChatMessage Table

```sql
CREATE TABLE chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    senderId INT NOT NULL,
    sessionId INT NOT NULL,
    
    -- Status tracking
    isRead BOOLEAN DEFAULT FALSE,
    readAt DATETIME NULL,
    isDelivered BOOLEAN DEFAULT FALSE,
    deliveredAt DATETIME NULL,
    
    createdAt DATETIME DEFAULT NOW(),
    updatedAt DATETIME DEFAULT NOW()
);
```

**Field Meanings:**
- `isDelivered = false` → Message not yet received by recipient (offline)
- `isDelivered = true` → Message delivered to recipient's device
- `isRead = false` → Message received but not opened/read
- `isRead = true` → Message opened and read by recipient

## Message States

```
┌─────────────────────────────────────────────────────────┐
│ Message Lifecycle                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  SENT (saved to DB)                                     │
│    ↓                                                    │
│  [Recipient online?]                                    │
│    ↓                ↘                                   │
│   YES              NO                                   │
│    ↓                ↓                                   │
│  DELIVERED    PENDING (in DB)                           │
│  (real-time)       ↓                                    │
│    ↓          [User reconnects]                         │
│    ↓                ↓                                   │
│    ↓           DELIVERED                                │
│    ↓                ↓                                   │
│    └───────→  READ  ←──────┘                            │
│         (user opens chat)                               │
└─────────────────────────────────────────────────────────┘
```

## WebSocket Events

### Client → Server Events

#### 1. Send Message
```javascript
socket.emit('sendMessage', {
    recipientId: 123,
    content: 'Hello!'
});
```

**Response:**
```javascript
socket.on('messageSent', (data) => {
    console.log(data);
    // {
    //   id: 456,
    //   content: 'Hello!',
    //   senderId: 789,
    //   sessionId: 1,
    //   recipientOnline: true,  // ← Know if recipient got it
    //   createdAt: '2025-11-27...'
    // }
});
```

### Server → Client Events

#### 1. New Message (for recipient)
```javascript
socket.on('newMessage', (message) => {
    console.log('New message received:', message);
    // {
    //   id: 456,
    //   content: 'Hello!',
    //   senderId: 789,
    //   sessionId: 1,
    //   isRead: false,
    //   isDelivered: true,
    //   createdAt: '2025-11-27...'
    // }
    
    // Display in UI
    displayMessage(message);
    
    // Mark as delivered (if not already)
    socket.emit('markAsDelivered', { messageIds: [message.id] });
    
    // Mark as read when user opens the chat
    socket.emit('markAsRead', { messageIds: [message.id] });
});
```

## Client-Side Implementation

### React Example

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function ChatComponent({ token, recipientId }) {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isRecipientOnline, setIsRecipientOnline] = useState(false);

    useEffect(() => {
        // Connect to WebSocket
        const newSocket = io('http://localhost:3000/chat', {
            auth: { token }
        });

        // Listen for new messages (including history on reconnect)
        newSocket.on('newMessage', (message) => {
            setMessages(prev => [...prev, message]);
            
            // Auto-mark as delivered when received
            newSocket.emit('markAsDelivered', {
                messageIds: [message.id]
            });
        });

        // Listen for confirmation when sending
        newSocket.on('messageSent', (data) => {
            setMessages(prev => [...prev, data]);
            setIsRecipientOnline(data.recipientOnline);
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, [token]);

    const sendMessage = (content) => {
        if (socket && content.trim()) {
            socket.emit('sendMessage', {
                recipientId,
                content
            });
        }
    };

    return (
        <div>
            {/* Show online status */}
            <div>
                Status: {isRecipientOnline ? '🟢 Online' : '⚫ Offline'}
            </div>
            
            {/* Messages */}
            <div>
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
            
            {/* Input */}
            <input 
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        sendMessage(e.target.value);
                        e.target.value = '';
                    }
                }}
            />
        </div>
    );
}
```

## Testing Scenarios

### Test 1: Both Users Online
```
1. User A and User B both connect
2. User A sends message
3. ✅ Verify User B receives instantly
4. ✅ Verify messageSent shows recipientOnline: true
5. ✅ Verify message saved in database
```

### Test 2: Recipient Offline
```
1. User A connects (User B offline)
2. User A sends message to User B
3. ✅ Verify messageSent shows recipientOnline: false
4. ✅ Verify message saved in database
5. ✅ Verify isDelivered = false
```

### Test 3: Offline User Reconnects
```
1. User B has 3 unread messages (from Test 2)
2. User B connects
3. ✅ Verify User B receives all 3 messages automatically
4. ✅ Verify messages marked as delivered
5. ✅ Verify isDelivered = true in database
```

### Test 4: Multiple Devices
```
1. User A connects on phone and laptop
2. User B sends message to User A
3. ✅ Verify message appears on both devices
4. ✅ Verify message only stored once in DB
5. ✅ Mark as read on phone
6. ✅ Verify read status updates on laptop
```

## Performance Considerations

### Message Limit on Reconnect
```typescript
take: 100, // Limit to last 100 unread messages
```

**Why?** If a user has been offline for weeks, sending thousands of messages at once could:
- Overload the WebSocket connection
- Cause UI lag
- Waste bandwidth

**Solution:** Load messages in batches:
1. Send last 100 unread on connect
2. User can request more via REST API
3. Implement "Load More" button in UI

### Database Indexes

Ensure these indexes exist for performance:
```sql
CREATE INDEX idx_session_sender_read 
    ON chat_messages(sessionId, senderId, isRead);

CREATE INDEX idx_session_created 
    ON chat_messages(sessionId, createdAt);
```

## Troubleshooting

### Messages Not Delivering in Real-Time

**Check:**
1. Is recipient actually online? Check `userSockets` Map
2. Is WebSocket connection stable?
3. Check server logs for delivery confirmation

**Debug:**
```javascript
console.log(`User ${recipientId} online:`, this.isUserOnline(recipientId));
console.log(`Active sockets:`, Array.from(this.userSockets.keys()));
```

### Messages Not Loading on Reconnect

**Check:**
1. Is `sendUnreadMessagesToUser()` being called?
2. Are sessions correctly linked to user?
3. Check database for unread messages

**Debug:**
```sql
SELECT * FROM chat_messages 
WHERE sessionId IN (user_session_ids)
  AND senderId != user_id
  AND isRead = FALSE;
```

## Summary

✅ **Messages always saved to database**  
✅ **Online users receive messages instantly**  
✅ **Offline users get messages on reconnect**  
✅ **Message delivery status tracked**  
✅ **Read receipts supported**  
✅ **Multiple device support**  
✅ **WhatsApp-style behavior**  

This implementation ensures reliable message delivery regardless of online status!
