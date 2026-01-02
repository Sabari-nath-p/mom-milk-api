/**
 * Test script to verify iOS push notifications are being sent correctly from backend
 * 
 * Usage: node test-ios-notification.js
 * 
 * Make sure to:
 * 1. Replace IOS_FCM_TOKEN with an actual iOS device token from your database
 * 2. Run this script to test if the backend can send to iOS
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (same as your service)
try {
    const serviceAccount = require('./firebase-service-account.json');
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    
    console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    process.exit(1);
}

// Replace this with an actual iOS FCM token from your database
const IOS_FCM_TOKEN = 'PASTE_YOUR_IOS_DEVICE_TOKEN_HERE';

async function testIOSNotification() {
    console.log('\n📱 Testing iOS Push Notification...\n');
    
    const message = {
        token: IOS_FCM_TOKEN,
        notification: {
            title: 'iOS Test Notification',
            body: 'Testing backend iOS notification delivery',
        },
        data: {
            type: 'TEST',
            timestamp: new Date().toISOString(),
        },
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
            headers: {
                'apns-priority': '10',
            },
        },
    };
    
    try {
        const response = await admin.messaging().send(message);
        console.log('✅ SUCCESS: Notification sent to iOS device');
        console.log('📤 Response:', response);
        console.log('\n🎉 Backend is configured correctly for iOS!');
    } catch (error) {
        console.error('❌ FAILED: Error sending notification');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Provide specific guidance based on error
        if (error.code === 'messaging/invalid-registration-token') {
            console.log('\n⚠️  The FCM token is invalid or expired');
            console.log('   → Make sure you\'re using a valid iOS device token');
            console.log('   → The token may have expired, try getting a fresh one from the iOS app');
        } else if (error.code === 'messaging/registration-token-not-registered') {
            console.log('\n⚠️  The FCM token is not registered');
            console.log('   → The token may be for a different Firebase project');
            console.log('   → Make sure the iOS app is using the same Firebase project');
        } else if (error.code === 'messaging/invalid-apns-credentials') {
            console.log('\n⚠️  APNs credentials are not configured correctly');
            console.log('   → Go to Firebase Console → Project Settings → Cloud Messaging');
            console.log('   → Upload your APNs Authentication Key or APNs Certificate');
            console.log('   → Make sure it matches your iOS app\'s Bundle ID');
        }
    }
}

// Run the test
testIOSNotification()
    .then(() => {
        console.log('\n✅ Test completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });
