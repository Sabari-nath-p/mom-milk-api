import { Injectable, Logger } from "@nestjs/common";
import * as admin from "firebase-admin";
import { PrismaService } from "../prisma/prisma.service";

export interface FCMNotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
  imageUrl?: string;
}

export interface FCMMessage {
  token: string;
  notification: FCMNotificationPayload;
  data?: { [key: string]: string };
  android?: admin.messaging.AndroidConfig;
  apns?: admin.messaging.ApnsConfig;
  webpush?: admin.messaging.WebpushConfig;
}

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private app: admin.app.App;

  constructor(private prisma: PrismaService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // Check if Firebase app is already initialized
      if (admin.apps.length === 0) {
        // Try to use environment variables first, then fall back to service account file
        const serviceAccount = this.getServiceAccountConfig();

        this.app = admin.initializeApp({
          credential: admin.credential.cert(
            serviceAccount as admin.ServiceAccount
          ),
          projectId: serviceAccount.project_id,
        });
        this.logger.log("Firebase Admin SDK initialized successfully");
      } else {
        this.app = admin.apps[0];
        this.logger.log("Firebase Admin SDK already initialized");
      }
    } catch (error) {
      this.logger.error("Failed to initialize Firebase Admin SDK:", error);
      // Don't throw error to prevent app from crashing
      // Firebase features will be disabled but app will still work
      this.logger.warn("Firebase features will be disabled");
    }
  }

  private getServiceAccountConfig() {
    // Try environment variables first (for Docker/production)
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL
    ) {
      return {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "",
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID || "",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || "",
        universe_domain: "googleapis.com",
      };
    }

    // Fall back to local service account file (for development)
    try {
      const { readFileSync } = require("fs");
      const { join } = require("path");
      const serviceAccountPath = join(
        process.cwd(),
        "firebase-service-account.json"
      );
      return JSON.parse(readFileSync(serviceAccountPath, "utf8"));
    } catch (error) {
      throw new Error(
        "Firebase configuration not found. Please set environment variables or provide firebase-service-account.json file."
      );
    }
  }

  /**
   * Send a notification to a single device
   */
  async sendNotification(message: FCMMessage): Promise<string> {
    try {
      if (!this.app) {
        this.logger.warn("Firebase not initialized, skipping notification");
        return "firebase-not-initialized";
      }

      const fcmMessage: admin.messaging.Message = {
        token: message.token,
        notification: {
          title: message.notification.title,
          body: message.notification.body,
          imageUrl: message.notification.imageUrl,
        },
        data: message.data || {},
        android: message.android || {
          priority: "high",
          notification: {
            priority: "high",
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: message.apns || {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
              contentAvailable: true,
              mutableContent: true,
            },
          },
          headers: {
            "apns-priority": "10",
          },
        },
      };

      const response = await this.app.messaging().send(fcmMessage);
      this.logger.log(`Successfully sent message: ${response}`);
      return response;
    } catch (error) {
      this.logger.error("Error sending FCM message:", error);
      throw error;
    }
  }

  /**
   * Send notifications to multiple devices
   */
  async sendMulticastNotification(
    tokens: string[],
    notification: FCMNotificationPayload,
    data?: { [key: string]: string }
  ): Promise<admin.messaging.BatchResponse> {
    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: data || {},
        android: {
          priority: "high",
          notification: {
            priority: "high",
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
              contentAvailable: true,
              mutableContent: true,
            },
          },
          headers: {
            "apns-priority": "10",
          },
        },
      };

      const response = await this.app.messaging().sendEachForMulticast(message);
      this.logger.log(
        `Successfully sent multicast message to ${response.successCount} devices`
      );

      if (response.failureCount > 0) {
        this.logger.warn(`Failed to send to ${response.failureCount} devices`);
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            this.logger.error(
              `Error for token ${tokens[idx]}: ${resp.error?.message}`
            );
          }
        });
      }

      return response;
    } catch (error) {
      this.logger.error("Error sending multicast FCM message:", error);
      throw error;
    }
  }

  /**
   * Subscribe tokens to a topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<any> {
    try {
      const response = await this.app
        .messaging()
        .subscribeToTopic(tokens, topic);
      this.logger.log(
        `Successfully subscribed ${response.successCount} tokens to topic: ${topic}`
      );
      return response;
    } catch (error) {
      this.logger.error(`Error subscribing to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe tokens from a topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<any> {
    try {
      const response = await this.app
        .messaging()
        .unsubscribeFromTopic(tokens, topic);
      this.logger.log(
        `Successfully unsubscribed ${response.successCount} tokens from topic: ${topic}`
      );
      return response;
    } catch (error) {
      this.logger.error(`Error unsubscribing from topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Send notification to a topic
   */
  async sendToTopic(
    topic: string,
    notification: FCMNotificationPayload,
    data?: { [key: string]: string }
  ): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: data || {},
        android: {
          priority: "high",
          notification: {
            priority: "high",
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
              contentAvailable: true,
              mutableContent: true,
            },
          },
          headers: {
            "apns-priority": "10",
          },
        },
      };

      const response = await this.app.messaging().send(message);
      this.logger.log(`Successfully sent topic message: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`Error sending message to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Validate FCM token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      await this.app.messaging().send(
        {
          token,
          data: { test: "true" },
        },
        true
      ); // dry run
      return true;
    } catch (error) {
      this.logger.warn(`Invalid FCM token: ${token}`);
      return false;
    }
  }

  /**
   * Send milk request notification
   */
  async sendMilkRequestNotification(
    token: string,
    requesterName: string,
    requestTitle: string,
    requestId: number
  ): Promise<string> {
    return this.sendNotification({
      token,
      notification: {
        title: "New Milk Request! 🍼",
        body: `${requesterName} has sent you a milk request: "${requestTitle}"`,
        imageUrl: "https://your-app-url.com/icon-milk-request.png", // Optional
      },
      data: {
        type: "MILK_REQUEST",
        requestId: requestId.toString(),
        requesterName,
        clickAction: "MILK_REQUEST_CLICK",
      },
    });
  }

  /**
   * Send request accepted notification
   */
  async sendRequestAcceptedNotification(
    token: string,
    donorName: string,
    requestTitle: string,
    requestId: number
  ): Promise<string> {
    return this.sendNotification({
      token,
      notification: {
        title: "Request Accepted! ✅",
        body: `${donorName} has accepted your milk request: "${requestTitle}"`,
        imageUrl: "https://your-app-url.com/icon-accepted.png", // Optional
      },
      data: {
        type: "REQUEST_ACCEPTED",
        requestId: requestId.toString(),
        donorName,
        clickAction: "REQUEST_ACCEPTED_CLICK",
      },
    });
  }

  /**
   * Send request declined notification
   */
  async sendRequestDeclinedNotification(
    requesterId: number,
    requesterName: string,
    donorName: string,
    requestTitle: string,
    reason?: string
  ): Promise<void> {
    if (!this.app) {
      console.warn(
        "Firebase Admin SDK not initialized. Cannot send notification."
      );
      return;
    }

    try {
      // Get user's FCM token
      const user = await this.prisma.user.findUnique({
        where: { id: requesterId },
        select: { fcmToken: true },
      });

      if (!user?.fcmToken) {
        console.warn(`No FCM token found for user ${requesterId}`);
        return;
      }

      await this.sendNotification({
        token: user.fcmToken,
        notification: {
          title: "Request Declined ❌",
          body: `${donorName} has declined your milk request: "${requestTitle}". ${reason || "No reason provided."}`,
        },
        data: {
          type: "REQUEST_DECLINED",
          donorName,
          requestTitle,
          reason: reason || "",
          clickAction: "REQUEST_DECLINED_CLICK",
        },
      });
    } catch (error) {
      console.error("Error sending request declined notification:", error);
    }
  }

  /**
   * Send donor availability notification
   */
  async sendDonorAvailabilityNotification(
    tokens: string[],
    donorName: string
  ): Promise<admin.messaging.BatchResponse> {
    return this.sendMulticastNotification(
      tokens,
      {
        title: "Donor Available! 💝",
        body: `${donorName} is now available and might be able to help with your requests`,
        imageUrl: "https://your-app-url.com/icon-available.png", // Optional
      },
      {
        type: "DONOR_AVAILABLE",
        donorName,
        clickAction: "DONOR_AVAILABLE_CLICK",
      }
    );
  }

  /**
   * Send custom notification to user by phone number
   */
  async sendCustomNotificationByPhone(
    phone: string,
    title: string,
    body: string
  ): Promise<{ userId: number; phone: string }> {
    if (!this.app) {
      throw new Error(
        "Firebase Admin SDK not initialized. Cannot send notification."
      );
    }

    try {
      // Find user by phone number
      const user = await this.prisma.user.findFirst({
        where: { phone: phone },
        select: { id: true, phone: true, fcmToken: true, name: true },
      });

      if (!user) {
        throw new Error(`User not found with phone number: ${phone}`);
      }

      if (!user.fcmToken) {
        throw new Error(
          `No FCM token registered for user: ${user.name} (${phone})`
        );
      }

      this.logger.log(
        `Sending custom notification to user ${user.name} (ID: ${user.id}, Phone: ${phone})`
      );

      // Send notification
      await this.sendNotification({
        token: user.fcmToken,
        notification: {
          title: title,
          body: body,
        },
        data: {
          type: "CUSTOM_NOTIFICATION",
          phone: phone,
          clickAction: "CUSTOM_NOTIFICATION_CLICK",
        },
      });

      this.logger.log(`Custom notification sent successfully to ${user.name}`);

      return {
        userId: user.id,
        phone: user.phone,
      };
    } catch (error) {
      this.logger.error(
        `Error sending custom notification to phone ${phone}:`,
        error
      );
      throw error;
    }
  }
}
