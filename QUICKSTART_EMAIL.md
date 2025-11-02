# Quick Start Guide - Email & Push Notifications

## Prerequisites
- Node.js 18+ installed
- MySQL database running
- Valid SMTP server credentials
- Firebase project configured

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```
This will install all required packages including:
- `nodemailer` (already in package.json)
- `@types/nodemailer` (already in package.json)
- All NestJS dependencies

### 2. Configure Environment Variables
Ensure your `.env` file has the SMTP configuration:

```env
# SMTP Email Configuration
SMTP_HOST=mail.gmail
SMTP_PORT=587
SMTP_USER=info@123123.app
SMTP_PASS=P312321
SMTP_SECURE=true

# Firebase Configuration (existing)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
# ... other Firebase vars
```

### 3. Generate Prisma Client
```bash
npm run prisma:generate
```

### 4. Run Migrations
```bash
npm run prisma:migrate
```

### 5. Start the Application

#### Development
```bash
npm run start:dev
```

#### Production
```bash
npm run build
npm run start:prod
```

#### Docker
```bash
docker-compose up -d
```

## Testing Email Functionality

### Test 1: OTP Email
```bash
curl -X POST http://localhost:3001/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "expiresAt": "2024-11-02T12:35:00.000Z"
}
```

**Check Email:**
- Subject: "Your OTP for Mom Milk App"
- Contains 6-digit OTP code
- Valid for 5 minutes

### Test 2: Milk Request Notification (Donor)
```bash
# First, get donor ID from database
# Then send a request to that donor

curl -X POST http://localhost:3001/requests/send-to-donor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "donorId": 1,
    "title": "Need breast milk urgently",
    "description": "For newborn baby",
    "quantity": 500,
    "urgency": "HIGH"
  }'
```

**Expected:**
- ✅ Email sent to donor
- ✅ Push notification sent to donor (if FCM token exists)
- ✅ In-app notification created

**Check Donor Email:**
- Subject: "🍼 New Milk Request Received"
- Contains request details
- Shows urgency level with color badge

### Test 3: Request Acceptance (Buyer)
```bash
# Donor accepts the request
curl -X PUT http://localhost:3001/requests/:requestId/accept \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DONOR_JWT_TOKEN"
```

**Expected:**
- ✅ Email sent to buyer
- ✅ Push notification sent to buyer (if FCM token exists)
- ✅ In-app notification created

**Check Buyer Email:**
- Subject: "✅ Your Request Has Been Accepted!"
- Contains donor's contact information
- Shows donor's phone number

### Test 4: Donor Availability Toggle
```bash
# Donor toggles availability to available
curl -X PUT http://localhost:3001/requests/availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DONOR_JWT_TOKEN" \
  -d '{"isAvailable": true}'
```

**Expected:**
- ✅ Emails sent to all users with accepted requests from this donor
- ✅ Push notifications sent to all affected users
- ✅ In-app notifications created for each user

**Check Affected User Emails:**
- Subject: "💝 Donor is Now Available!"
- Contains donor name and request title

## Monitoring & Debugging

### Check Logs
```bash
# Docker
docker logs moms_milk_api | grep "Email sent"
docker logs moms_milk_api | grep "SMTP"
docker logs moms_milk_api | grep "FCM"

# Local
npm run start:dev
# Watch console for email/notification logs
```

### Common Log Messages

**Successful:**
```
[MailService] SMTP transporter initialized successfully
[MailService] SMTP connection verified successfully
[MailService] Email sent successfully to user@example.com: <message-id>
[FirebaseService] Successfully sent message: projects/.../messages/...
```

**Warnings:**
```
[MailService] SMTP not configured, skipping email send
[FirebaseService] Firebase not initialized, skipping notification
```

**Errors:**
```
[MailService] Failed to send email to user@example.com: <error details>
[FirebaseService] Error sending FCM message: <error details>
```

## Troubleshooting

### Issue: Email not being sent

**Check 1: SMTP Configuration**
```bash
# Verify environment variables are loaded
grep SMTP .env
```

**Check 2: SMTP Connection**
```bash
# Test SMTP connection manually
telnet mail.gmail 587
# or
openssl s_client -connect mail.gmail:587 -starttls smtp
```

**Check 3: Credentials**
- For Gmail: Use "App Password" not regular password
- Enable "Less secure app access" or use OAuth2
- Verify SMTP_USER and SMTP_PASS are correct

**Check 4: Firewall**
```bash
# Check if port 587 is open
nc -zv mail.gmail 587
```

### Issue: Push Notifications not working

**Check 1: Firebase Configuration**
- Verify Firebase environment variables are set
- Check Firebase Console for service account status
- Ensure FCM is enabled in Firebase project

**Check 2: FCM Tokens**
```bash
# Query database to check if users have FCM tokens
# Connect to MySQL
mysql -u root moms_milk
SELECT id, name, email, fcmToken FROM User WHERE fcmToken IS NOT NULL;
```

**Check 3: Device Permissions**
- Ensure mobile app has notification permissions
- Check device notification settings

### Issue: TypeScript Errors

If you see TypeScript compilation errors:
```bash
# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npm run prisma:generate

# Rebuild project
npm run build
```

## Verification Checklist

- [ ] SMTP environment variables set in `.env`
- [ ] `npm install` completed successfully
- [ ] Prisma client generated
- [ ] Application starts without errors
- [ ] OTP email test passes
- [ ] Request notification test passes
- [ ] Acceptance notification test passes
- [ ] Availability notification test passes
- [ ] Logs show successful email sends
- [ ] Push notifications being sent (if FCM configured)

## Additional Configuration

### For Gmail SMTP

1. **Enable 2-Factor Authentication**
2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
   - Use this as `SMTP_PASS`

3. **Update .env:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_SECURE=false
```

### For Other SMTP Providers

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_SECURE=false
```

**AWS SES:**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
SMTP_SECURE=false
```

## Production Deployment

### Environment Variables
Make sure to set these in your production environment:
- All SMTP_* variables
- All FIREBASE_* variables
- DATABASE_URL
- JWT_SECRET

### Docker Deployment
```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f api

# Verify email functionality
docker exec moms_milk_api_prod curl -X POST http://localhost:3001/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Health Check
```bash
curl http://your-domain.com/health
```

## Support

For detailed documentation, see:
- `EMAIL_NOTIFICATION_IMPLEMENTATION.md` - Comprehensive documentation
- `IMPLEMENTATION_SUMMARY.md` - Quick reference

For issues:
1. Check application logs
2. Verify environment configuration
3. Test SMTP connection manually
4. Check Firebase Console
5. Review error messages in logs
