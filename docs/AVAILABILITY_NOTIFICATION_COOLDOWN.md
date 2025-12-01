# Availability Notification Cooldown Feature

## Overview

This feature implements a 24-hour cooldown period for email notifications when a donor updates their availability status. This prevents spam and ensures that parents/buyers don't receive excessive emails when donors frequently change their availability status.

## How It Works

### The Problem
Previously, every time a donor changed their status to "available", all parents/buyers with accepted requests would receive an email notification. If a donor toggled their availability multiple times in a short period, this would result in notification spam.

### The Solution
Now, email notifications are only sent once per 24-hour period, regardless of how many times the donor changes their availability status within that timeframe.

## Implementation Details

### Database Changes

A new field has been added to the `User` model to track the last time an availability notification email was sent:

```prisma
model User {
  // ... other fields
  lastAvailabilityNotificationAt DateTime? // Track last time availability notification was sent
}
```

### Logic Flow

1. **Donor Updates Availability**: When a donor changes their status from "unavailable" to "available"

2. **Check Cooldown**: The system checks if 24 hours have passed since `lastAvailabilityNotificationAt`

3. **Conditional Notification**:
   - **Email Notification**: Only sent if 24+ hours have passed (or if it's the first time)
   - **In-App Notification**: Always sent (no cooldown)
   - **FCM Push Notification**: Always sent (no cooldown)

4. **Update Timestamp**: If an email was sent, update `lastAvailabilityNotificationAt` to the current time

### Code Implementation

#### Service Method: `shouldSendAvailabilityEmail`
```typescript
private shouldSendAvailabilityEmail(lastNotificationAt: Date | null): boolean {
    if (!lastNotificationAt) {
        // Never sent a notification before, allow it
        return true;
    }

    const now = new Date();
    const hoursSinceLastNotification = (now.getTime() - lastNotificationAt.getTime()) / (1000 * 60 * 60);
    
    // Only allow email if 24 hours have passed
    return hoursSinceLastNotification >= 24;
}
```

#### Updated `updateAvailability` Method
```typescript
async updateAvailability(donorId: number, updateDto: UpdateAvailabilityDto) {
    const donor = await this.prisma.user.findUnique({
        where: { id: donorId },
        select: { 
            id: true, 
            userType: true, 
            name: true, 
            isAvailable: true, 
            lastAvailabilityNotificationAt: true 
        },
    });

    // ... validation code ...

    const wasUnavailable = !donor.isAvailable;
    const isBecomingAvailable = updateDto.isAvailable;

    await this.prisma.user.update({
        where: { id: donorId },
        data: { isAvailable: updateDto.isAvailable },
    });

    // If donor is becoming available, notify users
    if (wasUnavailable && isBecomingAvailable) {
        const shouldSendEmail = this.shouldSendAvailabilityEmail(donor.lastAvailabilityNotificationAt);
        await this.notifyUsersOfAvailability(donorId, donor.name, shouldSendEmail);
        
        // Update the last notification timestamp if email was sent
        if (shouldSendEmail) {
            await this.prisma.user.update({
                where: { id: donorId },
                data: { lastAvailabilityNotificationAt: new Date() },
            });
        }
    }

    return {
        success: true,
        message: `Availability updated to ${updateDto.isAvailable ? 'available' : 'unavailable'}`,
    };
}
```

#### Updated `notifyUsersOfAvailability` Method
```typescript
private async notifyUsersOfAvailability(donorId: number, donorName: string, sendEmail: boolean = true) {
    // Get donor's contact information
    const donor = await this.prisma.user.findUnique({
        where: { id: donorId },
        select: {
            email: true,
            facebookLink: true,
            instagramLink: true,
        },
    });

    // Find users who have accepted requests from this donor
    const acceptedRequests = await this.prisma.milkRequest.findMany({
        where: {
            donorId: donorId,
            status: RequestStatus.ACCEPTED,
        },
        include: {
            requester: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    fcmToken: true,
                },
            },
        },
    });

    // Create notifications and conditionally send emails
    for (const request of acceptedRequests) {
        // Always create in-app notification
        await this.prisma.requestNotification.create({
            data: {
                userId: request.requester.id,
                title: 'Donor Available!',
                message: `${donorName} is now available and might be able to help with your request: "${request.title}"`,
                type: 'AVAILABILITY_UPDATE',
                requestId: request.id,
            },
        });

        // Only send email notification if 24-hour cooldown has passed
        if (sendEmail) {
            try {
                await this.mailService.sendAvailabilityNotificationEmail(
                    request.requester.email,
                    request.requester.name,
                    donorName,
                    request.title,
                    donor?.email,
                    donor?.facebookLink,
                    donor?.instagramLink
                );
            } catch (error) {
                console.error(`Failed to send availability email to ${request.requester.email}:`, error);
            }
        }

        // Always send FCM push notification if user has token
        if (request.requester.fcmToken) {
            // ... FCM notification code ...
        }
    }
}
```

## Notification Behavior Summary

| Notification Type | Behavior | Cooldown |
|-------------------|----------|----------|
| **Email** | Sent to parents/buyers with accepted requests | ✅ 24 hours |
| **In-App** | Stored in database for all users with accepted requests | ❌ None (always sent) |
| **FCM Push** | Sent to mobile devices of users with accepted requests | ❌ None (always sent) |

## Benefits

1. **Reduced Email Spam**: Parents/buyers won't be overwhelmed with emails if donors frequently toggle availability
2. **Better User Experience**: Users still get real-time in-app and push notifications
3. **Cost Efficiency**: Reduces email sending costs
4. **Professional Communication**: Maintains professional communication standards

## Edge Cases Handled

### Case 1: First Time Availability Change
- **Scenario**: Donor has never changed availability to "available" before
- **Behavior**: Email is sent immediately (no previous timestamp exists)
- **Result**: `lastAvailabilityNotificationAt` is set to current time

### Case 2: Multiple Changes Within 24 Hours
- **Scenario**: Donor toggles availability multiple times within 24 hours
- **Behavior**: Only the first "available" status triggers email, subsequent changes don't
- **Result**: Users get one email per 24-hour period

### Case 3: Changes After 24 Hours
- **Scenario**: Donor changes to "available" after 24+ hours have passed
- **Behavior**: Email is sent again
- **Result**: `lastAvailabilityNotificationAt` is updated to new time

### Case 4: Unavailable → Available → Unavailable → Available (within 24h)
- **Scenario**: Donor changes status multiple times
- **Behavior**: 
  - First "available": Email sent ✅
  - "Unavailable": No notifications
  - Second "available" (within 24h): In-app + push only, no email ❌
- **Result**: Only one email sent despite multiple status changes

## Testing

### Manual Testing Steps

1. **Test First Availability Change**:
   ```
   1. Create a donor account
   2. Create a parent account with an accepted request from that donor
   3. Change donor availability to "available"
   4. Verify email is sent to parent
   5. Check that lastAvailabilityNotificationAt is set in database
   ```

2. **Test 24-Hour Cooldown**:
   ```
   1. Using the same donor from above
   2. Change availability to "unavailable"
   3. Change availability back to "available" (within 24 hours)
   4. Verify NO email is sent to parent
   5. Verify in-app notification IS created
   6. Verify FCM notification IS sent (if fcmToken exists)
   ```

3. **Test After 24 Hours**:
   ```
   1. Wait 24+ hours (or manually update lastAvailabilityNotificationAt in DB)
   2. Change donor availability to "available"
   3. Verify email IS sent to parent
   4. Check that lastAvailabilityNotificationAt is updated to new time
   ```

### API Endpoint

```http
PATCH /requests/availability
Authorization: Bearer <donor-jwt-token>
Content-Type: application/json

{
  "isAvailable": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Availability updated to available"
}
```

## Database Migration

To apply this feature, run:

```bash
npm run prisma:migrate -- --name add_availability_notification_cooldown
```

This will add the `lastAvailabilityNotificationAt` field to the `users` table.

## Monitoring

Monitor the following to ensure the feature works correctly:

1. **Email Sending Frequency**: Should decrease significantly for active donors
2. **User Feedback**: Parents should report fewer emails but still be informed of availability
3. **Notification Counts**: In-app and FCM notifications should remain frequent
4. **Database Field**: Check that `lastAvailabilityNotificationAt` is being updated correctly

## Future Enhancements

Potential improvements to consider:

1. **Configurable Cooldown Period**: Allow admins to set the cooldown duration (e.g., 12h, 24h, 48h)
2. **User Preferences**: Let parents choose their own email frequency
3. **Digest Emails**: Instead of individual emails, send a daily digest of all availability changes
4. **Different Cooldowns by Notification Type**: E.g., 24h for email, 6h for push notifications
5. **Analytics Dashboard**: Show email frequency metrics to admins

## Related Files

- `prisma/schema.prisma` - Database schema with new field
- `src/requests/services/request.service.ts` - Service implementation
- `src/requests/dto/request.dto.ts` - DTO definitions
- `src/requests/controllers/request.controller.ts` - API endpoint

## Support

For issues or questions, please contact the development team or create an issue in the project repository.
