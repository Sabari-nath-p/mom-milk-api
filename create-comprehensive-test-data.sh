#!/bin/bash

# Script to create comprehensive test data for donor search

API_BASE="http://localhost:3001"

# Get admin token
echo "Getting admin token..."
TOKEN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@momsmilk.com", "otp": "759409"}')

TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.authData.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Failed to get admin token"
    exit 1
fi

echo "✅ Got admin token"

# First, add some zip codes to the database
echo ""
echo "📍 Adding zip codes to database..."

# Add New York zipcode
curl -s -X POST "$API_BASE/geolocation/zipcodes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "USA",
    "zipcode": "10001",
    "placeName": "New York",
    "latitude": 40.7505,
    "longitude": -73.9934
  }' > /dev/null

# Add Los Angeles zipcode  
curl -s -X POST "$API_BASE/geolocation/zipcodes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "USA", 
    "zipcode": "90210",
    "placeName": "Beverly Hills",
    "latitude": 34.0901,
    "longitude": -118.4065
  }' > /dev/null

# Add Chicago zipcode
curl -s -X POST "$API_BASE/geolocation/zipcodes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "USA",
    "zipcode": "60601", 
    "placeName": "Chicago",
    "latitude": 41.8781,
    "longitude": -87.6298
  }' > /dev/null

echo "✅ Added zip codes"

# Now create donors in different locations
echo ""
echo "👥 Creating test donors..."

# Donor 1 - New York (known zipcode)
curl -s -X POST "$API_BASE/auth/complete-profile" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "donor1@example.com",
    "name": "Emma Wilson",
    "phone": "+1234567001",
    "zipcode": "10001",
    "userType": "DONOR",
    "description": "Experienced donor from New York",
    "bloodGroup": "A+",
    "babyDeliveryDate": "2024-01-15T00:00:00.000Z",
    "ableToShareMedicalRecord": true
  }' > /dev/null

# Donor 2 - Los Angeles (known zipcode)  
curl -s -X POST "$API_BASE/auth/complete-profile" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "donor2@example.com",
    "name": "Maria Garcia",
    "phone": "+1234567002", 
    "zipcode": "90210",
    "userType": "DONOR",
    "description": "Healthy mother from LA",
    "bloodGroup": "B+",
    "babyDeliveryDate": "2024-02-01T00:00:00.000Z",
    "ableToShareMedicalRecord": false
  }' > /dev/null

# Donor 3 - Unknown zipcode
curl -s -X POST "$API_BASE/auth/complete-profile" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "donor3@example.com",
    "name": "Jennifer Smith",
    "phone": "+1234567003",
    "zipcode": "99999",
    "userType": "DONOR", 
    "description": "Donor from unknown location",
    "bloodGroup": "O-",
    "babyDeliveryDate": "2024-03-01T00:00:00.000Z",
    "ableToShareMedicalRecord": true
  }' > /dev/null

# Donor 4 - Chicago (known zipcode) - unavailable
curl -s -X POST "$API_BASE/auth/complete-profile" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "donor4@example.com",
    "name": "Lisa Johnson",
    "phone": "+1234567004",
    "zipcode": "60601",
    "userType": "DONOR",
    "description": "Donor from Chicago - currently unavailable", 
    "bloodGroup": "AB+",
    "babyDeliveryDate": "2024-04-01T00:00:00.000Z",
    "ableToShareMedicalRecord": true
  }' > /dev/null

# Create a buyer from New York for testing distance calculation
curl -s -X POST "$API_BASE/auth/complete-profile" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer1@example.com",
    "name": "Test Buyer NYC",
    "phone": "+1234567100",
    "zipcode": "10001", 
    "userType": "BUYER"
  }' > /dev/null

echo "✅ Created test users"

echo ""
echo "🎉 Test data creation completed!"
echo ""
echo "📋 Test Data Summary:"
echo "• Donors with known zipcodes: Emma Wilson (NYC), Maria Garcia (LA), Lisa Johnson (Chicago)"
echo "• Donors with unknown zipcodes: Sarah Johnson (from seed), Jennifer Smith"
echo "• Test buyer: Test Buyer NYC (for distance testing)"
echo "• Zip codes in database: 10001 (NYC), 90210 (LA), 60601 (Chicago)"
