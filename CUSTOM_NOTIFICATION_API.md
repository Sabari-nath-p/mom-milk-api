# Custom Push Notification API

## Overview
This API allows administrators to send custom push notifications to users by their phone number. It's useful for sending important updates, announcements, or personalized messages to specific users.

## Endpoint

### Send Custom Notification
**POST** `/notifications/send-custom`

Send a custom push notification with a title and body to a specific user identified by their phone number.

#### Authentication
- **Required**: Yes (JWT Bearer Token)
- **Role**: Admin only

#### Request Body
```json
{
  "phone": "+1234567890",
  "title": "Important Update",
  "body": "You have a new message from the support team"
}
```

#### Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phone | string | Yes | Phone number of the user to send notification to |
| title | string | Yes | Notification title |
| body | string | Yes | Notification body text |

#### Response

**Success (200 OK)**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "userId": 123,
  "phone": "+1234567890"
}
```

**Error Responses**

**404 Not Found** - User not found or no FCM token registered
```json
{
  "statusCode": 404,
  "message": "User not found with phone number: +1234567890"
}
```

**500 Internal Server Error** - Failed to send notification
```json
{
  "statusCode": 500,
  "message": "Firebase Admin SDK not initialized. Cannot send notification."
}
```

## Usage Examples

### cURL
```bash
# Login as admin first
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Send custom notification
curl -X POST http://localhost:3001/notifications/send-custom \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "phone": "+1234567890",
    "title": "Important Update",
    "body": "Your milk request has been processed"
  }'
```

### Using the Test Script
```bash
# Run the interactive test script
./test-custom-notification.sh
```

The script will:
1. Login as admin
2. Prompt you for the phone number
3. Prompt you for the notification title
4. Prompt you for the notification body
5. Send the notification and show the response

### JavaScript/TypeScript
```typescript
async function sendCustomNotification(phone: string, title: string, body: string) {
  // Login first to get token
  const loginResponse = await fetch('http://localhost:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'admin123'
    })
  });
  
  const { access_token } = await loginResponse.json();
  
  // Send notification
  const response = await fetch('http://localhost:3001/notifications/send-custom', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`
    },
    body: JSON.stringify({ phone, title, body })
  });
  
  return await response.json();
}

// Usage
sendCustomNotification(
  '+1234567890',
  'Order Update',
  'Your milk donation request has been accepted!'
);
```

### Python
```python
import requests

def send_custom_notification(phone, title, body):
    # Login first
    login_response = requests.post(
        'http://localhost:3001/auth/login',
        json={
            'email': 'admin@example.com',
            'password': 'admin123'
        }
    )
    token = login_response.json()['access_token']
    
    # Send notification
    response = requests.post(
        'http://localhost:3001/notifications/send-custom',
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        },
        json={
            'phone': phone,
            'title': title,
            'body': body
        }
    )
    
    return response.json()

# Usage
result = send_custom_notification(
    '+1234567890',
    'Important Update',
    'Your request has been processed'
)
print(result)
```

## Requirements

### User Requirements
1. **User must exist**: The phone number must be registered in the system
2. **FCM Token required**: The user must have a valid FCM token registered (they must have logged into the mobile app at least once)
3. **Phone number format**: Phone number should include country code (e.g., +1234567890)

### Admin Requirements
1. **Admin authentication**: Only users with admin role can send custom notifications
2. **Valid JWT token**: Must include valid Bearer token in Authorization header

## How It Works

1. **Authentication**: The endpoint verifies the admin JWT token using `JwtAuthGuard` and `AdminGuard`
2. **User Lookup**: The service finds the user by phone number in the database
3. **FCM Token Check**: Verifies the user has a registered FCM token
4. **Send Notification**: Uses Firebase Cloud Messaging to send the push notification
5. **Response**: Returns success status with user ID and phone number

## Notification Delivery

The notification will appear on the user's device as:
- **Title**: Your custom title
- **Body**: Your custom body text
- **Type**: `CUSTOM_NOTIFICATION` (in notification data)
- **Click Action**: `CUSTOM_NOTIFICATION_CLICK` (for app routing)

## Testing

### Prerequisites
1. Start the API server: `./start.sh`
2. Ensure Firebase is properly configured
3. Have an admin account created
4. Have a test user with:
   - Registered phone number
   - Valid FCM token (logged into mobile app)

### Test Steps
1. Run the test script: `./test-custom-notification.sh`
2. Enter the phone number of the test user
3. Enter a test title (e.g., "Test Notification")
4. Enter a test body (e.g., "This is a test message")
5. Verify the notification appears on the user's device

### Troubleshooting

**"User not found"**
- Verify the phone number exists in the database
- Check the phone number format includes country code

**"No FCM token registered"**
- User needs to login to the mobile app first
- FCM token is registered during mobile app login

**"Firebase not initialized"**
- Check Firebase environment variables in `.env`
- Verify `firebase-service-account.json` exists (for local development)
- Check Docker container logs: `docker logs moms_milk_api_dev`

**"Unauthorized"**
- Verify you're using a valid admin JWT token
- Check token hasn't expired
- Ensure user has admin role in database

## API Documentation

Access the full API documentation at:
- Swagger UI: `http://localhost:3001/api-docs`
- Look for the **Firebase Notifications** section

## Security Considerations

1. **Admin Only**: This endpoint is restricted to admin users to prevent abuse
2. **Rate Limiting**: Consider implementing rate limiting for production
3. **Phone Validation**: Phone numbers should be validated before use
4. **Content Filtering**: Consider filtering notification content for inappropriate text
5. **Logging**: All notification attempts are logged for audit purposes

## Use Cases

1. **Emergency Alerts**: Send urgent notifications to specific users
2. **Customer Support**: Send personalized messages from support team
3. **Order Updates**: Notify users about request status changes
4. **Promotional Messages**: Send special offers to specific users
5. **Account Notifications**: Inform users about account-related events
6. **System Announcements**: Send important system updates

## Future Enhancements

Potential improvements for this feature:
- Bulk notifications to multiple phone numbers
- Scheduled notifications
- Notification templates
- Rich media support (images, buttons)
- Delivery status tracking
- Notification history/logs
- User preferences for notification types
