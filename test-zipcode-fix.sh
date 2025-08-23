#!/bin/bash

# Test Script for Zipcode Fix - Donors with Unknown Zipcodes
# This script tests that donors are returned even if their zipcode is not in the zip_codes table

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

API_BASE="http://localhost:3001"

echo -e "${BLUE}🔍 Testing Zipcode Fix - Donors with Unknown Zipcodes${NC}"
echo "=============================================="

# Function to test API endpoint
test_endpoint() {
    local url="$1"
    local description="$2"
    
    echo -e "${YELLOW}Testing: ${description}${NC}"
    echo "URL: $url"
    
    response=$(curl -s "$url" || echo "Failed to connect")
    
    if echo "$response" | grep -q '"data"'; then
        echo -e "${GREEN}✅ Success${NC}"
        
        # Count total donors
        donor_count=$(echo "$response" | jq '.data | length' 2>/dev/null || echo "0")
        echo "Found $donor_count donors"
        
        # Check for donors with "Distance unknown"
        unknown_distance_count=$(echo "$response" | jq '.data | map(select(.distanceText == "Distance unknown")) | length' 2>/dev/null || echo "0")
        if [ "$unknown_distance_count" -gt 0 ]; then
            echo -e "${GREEN}✅ Found $unknown_distance_count donors with unknown distance (zipcode not in database)${NC}"
        else
            echo -e "${YELLOW}⚠️ No donors with unknown distance found${NC}"
        fi
        
        # Show first few donors for debugging
        echo "Sample donors:"
        echo "$response" | jq '.data[:3] | .[] | {name: .donor.name, zipcode: .donor.zipcode, distance: .distance, distanceText: .distanceText}' 2>/dev/null || echo "Could not parse response"
        
    else
        echo -e "${RED}❌ Failed or no data${NC}"
        echo "Response: $response"
    fi
    echo ""
}

# Test basic donor search
test_endpoint "$API_BASE/requests/search/donors" "Basic donor search (should show all donors including unknown zipcodes)"

# Test with specific distance filter
test_endpoint "$API_BASE/requests/search/donors?maxDistance=10" "Search with 10km distance (should include unknown zipcodes)"

# Test with larger distance filter
test_endpoint "$API_BASE/requests/search/donors?maxDistance=100" "Search with 100km distance (should include unknown zipcodes)"

echo -e "${BLUE}📋 Expected Behavior:${NC}"
echo "• Donors with zipcodes in the zip_codes table should show actual distance"
echo "• Donors with zipcodes NOT in the zip_codes table should show 'Distance unknown'"
echo "• ALL active donors should be returned regardless of zipcode database presence"
echo ""

echo -e "${BLUE}🔧 Fix Summary:${NC}"
echo "• Modified searchDonors() to include ALL donors, not just those with known zipcodes"
echo "• Donors with unknown zipcodes are shown with 'Distance unknown'"
echo "• Sorting: Known distances first (shortest to longest), then unknown distances"
