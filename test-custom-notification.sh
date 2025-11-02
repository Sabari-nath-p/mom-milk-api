#!/bin/bash

# Test Custom Notification API
# This script demonstrates how to send custom push notifications to users by their phone number

BASE_URL="http://localhost:3001"

echo "=== Testing Custom Notification API ==="
echo ""

# Step 1: Login as admin to get JWT token
echo "Step 1: Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to login. Please check your credentials."
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login successful!"
echo ""

# Step 2: Send custom notification to a user by phone number
echo "Step 2: Sending custom notification to user..."
echo "Enter the phone number (e.g., +1234567890):"
read PHONE_NUMBER

echo "Enter notification title:"
read NOTIFICATION_TITLE

echo "Enter notification body:"
read NOTIFICATION_BODY

echo ""
echo "Sending notification..."

NOTIFICATION_RESPONSE=$(curl -s -X POST "$BASE_URL/notifications/send-custom" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"phone\": \"$PHONE_NUMBER\",
    \"title\": \"$NOTIFICATION_TITLE\",
    \"body\": \"$NOTIFICATION_BODY\"
  }")

echo ""
echo "Response:"
echo $NOTIFICATION_RESPONSE | jq '.' 2>/dev/null || echo $NOTIFICATION_RESPONSE
echo ""

# Check if successful
if echo "$NOTIFICATION_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Notification sent successfully!"
else
    echo "❌ Failed to send notification"
fi

echo ""
echo "=== Test Complete ==="
