-- Query to check all users with FCM tokens and identify potential iOS users
-- Run this in your database to see who might be affected

SELECT 
    id,
    name,
    phone,
    userType,
    CASE 
        WHEN phone LIKE '+1%' THEN 'Likely iOS (US number)'
        WHEN phone LIKE '+91%' THEN 'Likely Android (India number)'
        ELSE 'Unknown'
    END as likely_device,
    LEFT(fcmToken, 20) as token_prefix,
    CHAR_LENGTH(fcmToken) as token_length,
    lastLoginAt
FROM user 
WHERE fcmToken IS NOT NULL 
  AND fcmToken != ''
ORDER BY lastLoginAt DESC;

-- Note: This is just an approximation based on phone patterns
-- The real way to tell is by testing or checking token format
