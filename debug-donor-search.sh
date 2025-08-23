#!/bin/bash

# Test script for donor search debugging

API_BASE="http://localhost:3001"

# Get admin token
echo "Getting admin token..."
TOKEN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@momsmilk.com", "otp": "759409"}')

TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.authData.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Failed to get admin token"
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

echo "✅ Got admin token: ${TOKEN:0:20}..."

# Test 1: Basic search
echo ""
echo "🔍 Test 1: Basic donor search"
BASIC_RESPONSE=$(curl -s -X GET "$API_BASE/requests/search/donors" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$BASIC_RESPONSE" | jq .

# Test 2: Boolean filter
echo ""
echo "🔍 Test 2: Boolean filter"
BOOL_RESPONSE=$(curl -s -X GET "$API_BASE/requests/search/donors?ableToShareMedicalRecord=true" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$BOOL_RESPONSE" | jq .

# Test 3: Donor name search
echo ""
echo "🔍 Test 3: Donor name search"
NAME_RESPONSE=$(curl -s -X GET "$API_BASE/requests/search/donors?donorName=Sarah" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$NAME_RESPONSE" | jq .

# Test 4: Partial name search
echo ""
echo "🔍 Test 4: Partial name search"
PARTIAL_RESPONSE=$(curl -s -X GET "$API_BASE/requests/search/donors?donorName=Sar" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$PARTIAL_RESPONSE" | jq .

# Test 5: Non-existent name
echo ""
echo "🔍 Test 5: Non-existent name search"
NONE_RESPONSE=$(curl -s -X GET "$API_BASE/requests/search/donors?donorName=NonExistent" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$NONE_RESPONSE" | jq .

echo ""
echo "✅ All tests completed!"
