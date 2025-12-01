# Quick Reference: 24-Hour Email Notification Cooldown

## What Changed?

When a donor updates their availability to "available", email notifications to parents/buyers now have a **24-hour cooldown** period.

## Notification Rules

```
┌─────────────────┬──────────────┬────────────┐
│ Notification    │ When Sent    │ Cooldown   │
├─────────────────┼──────────────┼────────────┤
│ 📧 Email        │ Once/24h     │ ✅ Yes     │
│ 📱 In-App       │ Every time   │ ❌ No      │
│ 🔔 FCM Push     │ Every time   │ ❌ No      │
└─────────────────┴──────────────┴────────────┘
```

## Example Scenario

**Day 1, 9:00 AM** - Donor becomes available
- ✅ Email sent
- ✅ In-app notification created
- ✅ Push notification sent

**Day 1, 2:00 PM** - Donor becomes unavailable
- *(No notifications)*

**Day 1, 5:00 PM** - Donor becomes available again
- ❌ Email NOT sent (within 24h)
- ✅ In-app notification created
- ✅ Push notification sent

**Day 2, 10:00 AM** - Donor becomes available
- ✅ Email sent (24h+ passed)
- ✅ In-app notification created
- ✅ Push notification sent

## Technical Details

### New Database Field
```sql
ALTER TABLE users ADD COLUMN lastAvailabilityNotificationAt DATETIME NULL;
```

### Key Logic
```typescript
// Check if 24 hours passed
const hoursSinceLastNotification = 
  (now - lastNotificationAt) / (1000 * 60 * 60);

return hoursSinceLastNotification >= 24;
```

## API Endpoint

```http
PATCH /requests/availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "isAvailable": true
}
```

## Database Query to Check

```sql
-- Check last notification time for a donor
SELECT 
  id,
  name, 
  email,
  isAvailable,
  lastAvailabilityNotificationAt,
  TIMESTAMPDIFF(HOUR, lastAvailabilityNotificationAt, NOW()) as hours_since_last
FROM users
WHERE id = <donor_id>;
```

## Testing Checklist

- [ ] First availability change sends email
- [ ] `lastAvailabilityNotificationAt` is set in DB
- [ ] Second change within 24h does NOT send email
- [ ] In-app notification is always created
- [ ] FCM push is always sent
- [ ] After 24h, email is sent again
- [ ] Timestamp is updated after email sent

## Files Changed

1. **Schema**: `prisma/schema.prisma`
2. **Service**: `src/requests/services/request.service.ts`

## Migration Command

```bash
# Generate Prisma client
npm run prisma:generate

# Create migration (when DB ready)
npm run prisma:migrate -- --name add_availability_notification_cooldown
```

## Benefits

✅ No more email spam  
✅ Real-time in-app notifications still work  
✅ Reduced email costs  
✅ Better user experience  
✅ Professional communication  

## Configuration

**Current cooldown**: 24 hours (hardcoded)

**To change**: Modify `shouldSendAvailabilityEmail()` method:
```typescript
return hoursSinceLastNotification >= 24; // Change this number
```

## Support

- 📖 Full docs: `docs/AVAILABILITY_NOTIFICATION_COOLDOWN.md`
- 📝 Changelog: `CHANGELOG_AVAILABILITY_COOLDOWN.md`
