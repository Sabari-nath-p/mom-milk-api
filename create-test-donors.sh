#!/bin/bash

# Script to add test donors with various zipcodes (some in database, some not)

API_BASE="http://localhost:3001"

echo "🔍 Adding test donors for zipcode testing..."

# Test donor 1 - with known zipcode (10001 - New York)
curl -X POST "$API_BASE/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "+1234567890",
    "zipcode": "10001",
    "userType": "DONOR",
    "description": "Healthy mother willing to donate",
    "bloodGroup": "O+",
    "babyDeliveryDate": "2024-01-15T00:00:00.000Z",
    "ableToShareMedicalRecord": true,
    "isAvailable": true
  }'

echo ""

# Test donor 2 - with unknown zipcode (not in database)
curl -X POST "$API_BASE/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Johnson",
    "email": "sarah.johnson@example.com",
    "phone": "+1987654321",
    "zipcode": "99999",
    "userType": "DONOR",
    "description": "Experienced donor",
    "bloodGroup": "A+",
    "babyDeliveryDate": "2024-02-01T00:00:00.000Z",
    "ableToShareMedicalRecord": false,
    "isAvailable": true
  }'

echo ""

# Test donor 3 - with another known zipcode
curl -X POST "$API_BASE/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mary Wilson",
    "email": "mary.wilson@example.com",
    "phone": "+1555666777",
    "zipcode": "90210",
    "userType": "DONOR",
    "description": "New donor",
    "bloodGroup": "B+",
    "babyDeliveryDate": "2024-03-01T00:00:00.000Z",
    "ableToShareMedicalRecord": true,
    "isAvailable": false
  }'

echo ""

# Test buyer - to test search from
curl -X POST "$API_BASE/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Buyer",
    "email": "buyer@example.com",
    "phone": "+1999888777",
    "zipcode": "10002",
    "userType": "BUYER"
  }'

echo ""
echo "✅ Test users created!"
