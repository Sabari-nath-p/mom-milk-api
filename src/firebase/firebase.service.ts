import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

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

    constructor() {
        this.initializeFirebase();
    }

    private initializeFirebase() {
        try {
            // Check if Firebase app is already initialized
            if (admin.apps.length === 0) {
                const serviceAccountPath = join(process.cwd(), 'firebase-service-account.json');
                const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
                
                this.app = admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
                    projectId: serviceAccount.project_id,
                });
                this.logger.log('Firebase Admin SDK initialized successfully');
            } else {
                this.app = admin.apps[0];
                this.logger.log('Firebase Admin SDK already initialized');
            }
        } catch (error) {
            this.logger.error('Failed to initialize Firebase Admin SDK:', error);
            throw error;
        }
    }

    /**
     * Send a notification to a single device
     */
    async sendNotification(message: FCMMessage): Promise<string> {
        try {
            const fcmMessage: admin.messaging.Message = {
                token: message.token,
                notification: {
                    title: message.notification.title,
                    body: message.notification.body,
                    imageUrl: message.notification.imageUrl,
                },
                data: message.data || {},
                android: message.android || {
                    priority: 'high',
                    notification: {
                        priority: 'high',
                        defaultSound: true,
                        defaultVibrateTimings: true,
                    },
                },
                apns: message.apns || {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            };

            const response = await admin.messaging().send(fcmMessage);
            this.logger.log(`Successfully sent message: ${response}`);
            return response;
        } catch (error) {
            this.logger.error('Error sending FCM message:', error);
            throw error;
        }
    }

    /**
     * Send notifications to multiple devices
     */
    async sendMulticastNotification(
        tokens: string[],
        notification: FCMNotificationPayload,
        data?: { [key: string]: string },
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
                    priority: 'high',
                    notification: {
                        priority: 'high',
                        defaultSound: true,
                        defaultVibrateTimings: true,
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            };

            const response = await admin.messaging().sendEachForMulticast(message);
            this.logger.log(`Successfully sent multicast message to ${response.successCount} devices`);
            
            if (response.failureCount > 0) {
                this.logger.warn(`Failed to send to ${response.failureCount} devices`);
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        this.logger.error(`Error for token ${tokens[idx]}: ${resp.error?.message}`);
                    }
                });
            }

            return response;
        } catch (error) {
            this.logger.error('Error sending multicast FCM message:', error);
            throw error;
        }
    }

    /**
     * Subscribe tokens to a topic
     */
    async subscribeToTopic(tokens: string[], topic: string): Promise<any> {
        try {
            const response = await admin.messaging().subscribeToTopic(tokens, topic);
            this.logger.log(`Successfully subscribed ${response.successCount} tokens to topic: ${topic}`);
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
            const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
            this.logger.log(`Successfully unsubscribed ${response.successCount} tokens from topic: ${topic}`);
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
        data?: { [key: string]: string },
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
                    priority: 'high',
                    notification: {
                        priority: 'high',
                        defaultSound: true,
                        defaultVibrateTimings: true,
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            };

            const response = await admin.messaging().send(message);
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
            await admin.messaging().send({
                token,
                data: { test: 'true' },
            }, true); // dry run
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
        requestId: number,
    ): Promise<string> {
        return this.sendNotification({
            token,
            notification: {
                title: 'New Milk Request! 🍼',
                body: `${requesterName} has sent you a milk request: "${requestTitle}"`,
                imageUrl: 'https://your-app-url.com/icon-milk-request.png', // Optional
            },
            data: {
                type: 'MILK_REQUEST',
                requestId: requestId.toString(),
                requesterName,
                clickAction: 'MILK_REQUEST_CLICK',
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
        requestId: number,
    ): Promise<string> {
        return this.sendNotification({
            token,
            notification: {
                title: 'Request Accepted! ✅',
                body: `${donorName} has accepted your milk request: "${requestTitle}"`,
                imageUrl: 'https://your-app-url.com/icon-accepted.png', // Optional
            },
            data: {
                type: 'REQUEST_ACCEPTED',
                requestId: requestId.toString(),
                donorName,
                clickAction: 'REQUEST_ACCEPTED_CLICK',
            },
        });
    }

    /**
     * Send donor availability notification
     */
    async sendDonorAvailabilityNotification(
        tokens: string[],
        donorName: string,
    ): Promise<admin.messaging.BatchResponse> {
        return this.sendMulticastNotification(
            tokens,
            {
                title: 'Donor Available! 💝',
                body: `${donorName} is now available and might be able to help with your requests`,
                imageUrl: 'https://your-app-url.com/icon-available.png', // Optional
            },
            {
                type: 'DONOR_AVAILABLE',
                donorName,
                clickAction: 'DONOR_AVAILABLE_CLICK',
            },
        );
    }
}
