import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SendMessageDto } from "./dto/send-message.dto";

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get or create a chat session between two users
   */
  async getOrCreateSession(userId1: number, userId2: number) {
    // Get user types to determine correct parent and donor assignment
    const [user1, user2] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId1 },
        select: { id: true, userType: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userId2 },
        select: { id: true, userType: true },
      }),
    ]);

    if (!user1 || !user2) {
      throw new NotFoundException('One or both users not found');
    }

    // Assign parentId (BUYER/ADMIN) and donorId (DONOR) based on userType
    let parentId: number;
    let donorId: number;

    if (user1.userType === 'DONOR' && user2.userType === 'DONOR') {
      // Both are donors - use numeric ordering as fallback
      [parentId, donorId] = [userId1, userId2].sort((a, b) => a - b);
    } else if (user1.userType === 'DONOR') {
      // user1 is donor, user2 is parent
      donorId = userId1;
      parentId = userId2;
    } else if (user2.userType === 'DONOR') {
      // user2 is donor, user1 is parent
      donorId = userId2;
      parentId = userId1;
    } else {
      // Both are non-donors (BUYER/ADMIN) - use numeric ordering as fallback
      [parentId, donorId] = [userId1, userId2].sort((a, b) => a - b);
    }

    // Fetch session with last message
    let session = await this.prisma.chatSession.findUnique({
      where: {
        parentId_donorId: { parentId, donorId },
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // Create if not exists
    if (!session) {
      session = await this.prisma.chatSession.create({
        data: { parentId, donorId },
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });
    }

    const lastMessage = session.messages?.[0] || null;

    // Determine the OTHER user relative to the requester (userId1)
    // The other user is the one who is NOT userId1
    const otherUserId = userId1 === session.parentId ? session.donorId : session.parentId;

    const otherUser = await this.prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        name: true,
        email: true,
        userType: true,
      },
    });

    // Unread messages for the current user
    const unreadCount = await this.prisma.chatMessage.count({
      where: {
        sessionId: session.id,
        isRead: false,
        senderId: otherUserId, // unread = messages sent by other user
      },
    });

    // Build formatted response
    const formattedSession = {
      id: session.id,
      parentId: session.parentId,
      donorId: session.donorId,
      lastMessageAt: lastMessage?.createdAt || session.createdAt,
      isActive: session.isActive,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      otherUser,
      unreadCount,
      lastMessage,
    };

    return formattedSession;
  }

  /**
   * Get all chat sessions for a user with pagination
   */
  async getUserSessions(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      this.prisma.chatSession.findMany({
        where: {
          OR: [{ parentId: userId }, { donorId: userId }],
          isActive: true,
        },
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: {
          lastMessageAt: "desc",
        },
        skip,
        take: limit,
      }),
      this.prisma.chatSession.count({
        where: {
          OR: [{ parentId: userId }, { donorId: userId }],
          isActive: true,
        },
      }),
    ]);

    // Get other participant details for each session
    const sessionsWithParticipants = await Promise.all(
      sessions.map(async (session) => {
        const otherUserId =
          session.parentId === userId ? session.donorId : session.parentId;
        const otherUser = await this.prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
          },
        });

        // Count unread messages for this session
        const unreadCount = await this.prisma.chatMessage.count({
          where: {
            sessionId: session.id,
            senderId: otherUserId,
            isRead: false,
          },
        });

        return {
          ...session,
          otherUser,
          unreadCount,
          lastMessage: session.messages[0] || null,
        };
      })
    );

    return {
      sessions: sessionsWithParticipants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get messages for a specific session
   */
  async getSessionMessages(
    sessionId: number,
    userId: number,
    page: number = 1,
    limit: number = 50
  ) {
    // Verify user is part of this session
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException("Chat session not found");
    }

    if (session.parentId !== userId && session.donorId !== userId) {
      throw new ForbiddenException(
        "You do not have access to this chat session"
      );
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.chatMessage.count({
        where: { sessionId },
      }),
    ]);

    return {
      messages: messages.reverse(), // Return in chronological order
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Send a message
   */
  async sendMessage(senderId: number, dto: SendMessageDto) {
    const { recipientId, content } = dto;

    // Verify both users exist
    const [sender, recipient] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: senderId } }),
      this.prisma.user.findUnique({ where: { id: recipientId } }),
    ]);

    if (!sender || !recipient) {
      throw new NotFoundException("User not found");
    }

    // Get or create session
    const session = await this.getOrCreateSession(senderId, recipientId);

    // Create message
    const message = await this.prisma.chatMessage.create({
      data: {
        content,
        senderId,
        sessionId: session.id,
        sentAt: new Date(),
      },
    });

    // Update session's lastMessageAt
    await this.prisma.chatSession.update({
      where: { id: session.id },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(userId: number, messageIds: number[]) {
    // Verify user has access to these messages (they should be the recipient)
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        id: { in: messageIds },
      },
      include: {
        session: true,
      },
    });

    // Filter messages where user is the recipient (not the sender)
    const validMessageIds = messages
      .filter((msg) => {
        const isParticipant =
          msg.session.parentId === userId || msg.session.donorId === userId;
        const isNotSender = msg.senderId !== userId;
        return isParticipant && isNotSender;
      })
      .map((msg) => msg.id);

    if (validMessageIds.length === 0) {
      return { updated: 0 };
    }

    const result = await this.prisma.chatMessage.updateMany({
      where: {
        id: { in: validMessageIds },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { updated: result.count };
  }

  /**
   * Mark messages as delivered
   */
  async markMessagesAsDelivered(messageIds: number[]) {
    const result = await this.prisma.chatMessage.updateMany({
      where: {
        id: { in: messageIds },
        isDelivered: false,
      },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    return { updated: result.count };
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: number) {
    const sessions = await this.prisma.chatSession.findMany({
      where: {
        OR: [{ parentId: userId }, { donorId: userId }],
        isActive: true,
      },
      select: {
        id: true,
        parentId: true,
        donorId: true,
      },
    });

    const unreadCount = await this.prisma.chatMessage.count({
      where: {
        sessionId: { in: sessions.map((s) => s.id) },
        senderId: { not: userId },
        isRead: false,
      },
    });

    return { unreadCount };
  }
}
