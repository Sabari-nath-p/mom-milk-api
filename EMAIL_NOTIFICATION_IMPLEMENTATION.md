# Email and Notification Implementation Guide

## Overview
This document describes the implementation of email notifications and push notifications in the Mom Milk API. The system now supports both SMTP email notifications and Firebase Cloud Messaging (FCM) push notifications.

## Environment Variables

Add the following SMTP configuration variables to your `.env` file:

```env
# SMTP Email Configuration
SMTP_HOST=mail.gmail
SMTP_PORT=587
SMTP_USER=info@123123.app
SMTP_PASS=P312321
SMTP_SECURE=true
```

### Variable Descriptions:
- **SMTP_HOST**: The SMTP server hostname (e.g., smtp.gmail.com for Gmail)
- **SMTP_PORT**: The SMTP port (587 for TLS, 465 for SSL)
- **SMTP_USER**: Your email account username
- **SMTP_PASS**: Your email account password or app-specific password
- **SMTP_SECURE**: Set to `true` for port 465 (SSL), `false` for other ports (TLS/STARTTLS)

## Architecture

### New Components

#### 1. Mail Module (`src/mail/`)
- **mail.service.ts**: Core email service using nodemailer
- **mail.module.ts**: NestJS module for mail functionality

### Email Service Features

The `MailService` provides the following methods:

1. **sendOtpEmail(email, otp)**: Sends OTP verification emails
2. **sendRequestNotificationEmail(...)**: Notifies donors of new milk requests
3. **sendRequestAcceptedEmail(...)**: Notifies buyers when their request is accepted
4. **sendAvailabilityNotificationEmail(...)**: Notifies users when donor becomes available

### Email Templates

All emails include:
- Professional HTML templates with inline CSS
- Responsive design for mobile devices
- Fallback plain text versions
- Branded styling with app colors

## Notification Flow

### 1. OTP Authentication
**Trigger**: User requests OTP during login/registration

**Email Sent**: 
- **To**: User's email
- **Subject**: "Your OTP for Mom Milk App"
- **Content**: 6-digit OTP code, valid for 5 minutes

**Push Notification**: None

**Implementation**: `src/auth/auth.service.ts` → `sendOtp()`

---

### 2. Donor Receives Request
**Trigger**: Buyer sends milk request to specific donor

**Email Sent**:
- **To**: Donor's email
- **Subject**: "🍼 New Milk Request Received"
- **Content**: Requester name, request title, description, quantity, urgency level

**Push Notification**:
- **To**: Donor's FCM token
- **Title**: "New Milk Request! 🍼"
- **Body**: "{RequesterName} has sent you a milk request: {RequestTitle}"
- **Data**: `type: MILK_REQUEST`, `requestId`, `requesterName`

**Implementation**: `src/requests/services/request.service.ts` → `sendRequestToSpecificDonor()`

---

### 3. Donor Accepts Request
**Trigger**: Donor accepts a pending milk request

**Email Sent**:
- **To**: Buyer's email
- **Subject**: "✅ Your Request Has Been Accepted!"
- **Content**: Donor name, donor phone number, request title, contact information

**Push Notification**:
- **To**: Buyer's FCM token
- **Title**: "Request Accepted! ✅"
- **Body**: "{DonorName} has accepted your milk request: {RequestTitle}"
- **Data**: `type: REQUEST_ACCEPTED`, `requestId`, `donorName`

**Implementation**: `src/requests/services/request.service.ts` → `acceptRequest()`

---

### 4. Donor Toggles Availability
**Trigger**: Donor changes availability status from unavailable to available

**Email Sent**:
- **To**: All users with accepted requests from this donor
- **Subject**: "💝 Donor is Now Available!"
- **Content**: Donor name, associated request title

**Push Notification**:
- **To**: FCM tokens of all users with accepted requests
- **Title**: "Donor Available! 💝"
- **Body**: "{DonorName} is now available and might be able to help with your request: {RequestTitle}"
- **Data**: `type: AVAILABILITY_UPDATE`, `donorName`, `requestId`

**Implementation**: `src/requests/services/request.service.ts` → `updateAvailability()` → `notifyUsersOfAvailability()`

---

## Error Handling

### Graceful Degradation
- Email failures do NOT cause API requests to fail
- If SMTP is not configured, emails are skipped with warning logs
- Push notification failures are logged but don't block the process
- Users can still use default OTP (759409) if email delivery fails

### Logging
All notification attempts are logged:
- Successful sends: `INFO` level
- Failed sends: `ERROR` level with full error details
- SMTP configuration issues: `WARN` level

## Integration Points

### Modified Files

1. **src/auth/auth.module.ts**
   - Added `MailModule` import

2. **src/auth/auth.service.ts**
   - Injected `MailService`
   - Updated `sendOtp()` to use `mailService.sendOtpEmail()`
   - Removed old placeholder email method

3. **src/requests/requests.module.ts**
   - Added `MailModule` import

4. **src/requests/services/request.service.ts**
   - Injected `MailService`
   - Updated `sendRequestToSpecificDonor()` for email + push notification
   - Updated `acceptRequest()` for email + push notification
   - Updated `notifyUsersOfAvailability()` for email + push notification

## Testing

### Test Email Configuration

1. **Gmail**: 
   - Use App Password (not regular password)
   - Enable "Less secure app access" or use OAuth2

2. **Testing SMTP**:
```bash
# Check if SMTP is configured
curl http://localhost:3001/auth/send-otp -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test Scenarios

1. **OTP Email**:
   - Register new user
   - Verify OTP email is received
   - Confirm email format is correct

2. **Request Notification**:
   - Create milk request to specific donor
   - Verify donor receives both email and push notification

3. **Request Acceptance**:
   - Donor accepts request
   - Verify buyer receives both email and push notification
   - Confirm donor contact info is included

4. **Availability Toggle**:
   - Donor with accepted requests toggles availability to available
   - Verify all associated buyers receive email and push notification

## Push Notification Integration Status

### ✅ Properly Integrated

All push notifications are now properly integrated for:

1. **Donor receives request** → FCM notification sent
2. **Buyer request accepted** → FCM notification sent
3. **Donor availability update** → FCM notification sent to all relevant users

### Firebase Methods Used

From `src/firebase/firebase.service.ts`:
- `sendMilkRequestNotification()`: For new requests to donors
- `sendRequestAcceptedNotification()`: For accepted requests to buyers
- `sendNotification()`: Generic method for availability updates

## Database Schema

### User Table (Required Fields for Notifications)
- `email`: Required for email notifications
- `fcmToken`: Required for push notifications
- `phone`: Included in acceptance emails

### Request Notification Table
Stores in-app notifications:
- `userId`: Recipient
- `title`: Notification title
- `message`: Notification message
- `type`: Notification type (e.g., REQUEST_ACCEPTED, AVAILABILITY_UPDATE)
- `requestId`: Associated request
- `isRead`: Read status
- `createdAt`: Timestamp

## Production Deployment

### SMTP Configuration

1. **Update environment variables** in your production `.env` or hosting platform
2. **Use production email service** (Gmail, SendGrid, AWS SES, etc.)
3. **Monitor email delivery** rates and bounce rates
4. **Set up SPF and DKIM** records for better deliverability

### Recommended SMTP Providers

1. **SendGrid**: Free tier available, reliable
2. **AWS SES**: Cost-effective for high volume
3. **Gmail**: Good for development, limited for production
4. **Mailgun**: Developer-friendly, good documentation

### Firebase Configuration

Ensure Firebase Admin SDK is properly configured with:
- Valid service account credentials
- Proper environment variables set
- FCM tokens are being collected from mobile apps

## Security Considerations

1. **SMTP Credentials**: Store securely, never commit to Git
2. **Email Content**: Don't include sensitive data (passwords, full phone numbers in subject)
3. **Rate Limiting**: Consider rate limiting OTP sends per email
4. **TLS/SSL**: Always use encrypted connections (SMTP_SECURE=true for port 465)
5. **FCM Tokens**: Validate and refresh expired tokens

## Monitoring and Maintenance

### Metrics to Track

1. Email delivery rate
2. Email bounce rate
3. Push notification delivery rate
4. User engagement with notifications
5. SMTP connection failures

### Logs to Monitor

```bash
# Check email sending logs
docker logs moms_milk_api | grep "Email sent"

# Check SMTP errors
docker logs moms_milk_api | grep "SMTP"

# Check FCM errors
docker logs moms_milk_api | grep "FCM"
```

## Troubleshooting

### Email Not Sending

1. **Check SMTP configuration** in environment variables
2. **Verify SMTP credentials** are correct
3. **Test SMTP connection** manually:
   ```bash
   telnet mail.gmail.com 587
   ```
4. **Check logs** for error messages
5. **Verify firewall** allows outbound SMTP connections

### Push Notifications Not Sending

1. **Verify Firebase configuration** is correct
2. **Check FCM tokens** are being stored in database
3. **Ensure Firebase Admin SDK** is initialized
4. **Check user's device** has granted notification permissions
5. **Verify FCM service** is active on Firebase Console

### Common Issues

**Issue**: "SMTP not configured, skipping email send"
- **Solution**: Add SMTP environment variables

**Issue**: "Invalid login" error
- **Solution**: Use app-specific password for Gmail

**Issue**: "Connection timeout"
- **Solution**: Check firewall/network settings, verify SMTP host and port

**Issue**: "Firebase not initialized"
- **Solution**: Set Firebase environment variables or add service account JSON

## Future Enhancements

1. **Email Templates**: Use template engine (Handlebars, Pug) for more flexibility
2. **Email Queue**: Implement job queue (Bull, BeeQueue) for better performance
3. **Email Analytics**: Track open rates, click rates
4. **User Preferences**: Allow users to configure notification preferences
5. **Email Verification**: Add email verification flow
6. **Unsubscribe Links**: Add opt-out mechanism for marketing emails
7. **Multi-language Support**: Send emails in user's preferred language
8. **Rich Push Notifications**: Add images, action buttons to push notifications

## Support

For issues or questions:
1. Check logs: `docker logs moms_milk_api`
2. Review error messages in console
3. Verify environment configuration
4. Test with default OTP (759409) if email fails
5. Check Firebase Console for FCM delivery status
