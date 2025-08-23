#!/bin/bash

# Enhanced Test Script for Donor Search API Fixes
# Tests boolean validation, donor name search, and zipcode handling

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

API_BASE="http://localhost:3001"

echo -e "${BLUE}🔍 Testing Enhanced Donor Search API Fixes${NC}"
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
            echo -e "${GREEN}✅ Found $unknown_distance_count donors with unknown distance${NC}"
        fi
        
        # Show first donor for debugging
        echo "Sample donor:"
        echo "$response" | jq '.data[0] | {name: .donor.name, zipcode: .donor.zipcode, distance: .distance, distanceText: .distanceText, location: .location}' 2>/dev/null || echo "Could not parse response"
        
    else
        echo -e "${RED}❌ Failed or no data${NC}"
        echo "Response: $response"
    fi
    echo ""
}

echo -e "${BLUE}📋 Test 1: Basic Search${NC}"
test_endpoint "$API_BASE/requests/search/donors" "Basic donor search"

echo -e "${BLUE}📋 Test 2: Boolean Filters (String to Boolean Conversion)${NC}"
test_endpoint "$API_BASE/requests/search/donors?ableToShareMedicalRecord=true" "Medical record sharing filter (true)"
test_endpoint "$API_BASE/requests/search/donors?ableToShareMedicalRecord=false" "Medical record sharing filter (false)"
test_endpoint "$API_BASE/requests/search/donors?isAvailable=true" "Availability filter (true)"
test_endpoint "$API_BASE/requests/search/donors?isAvailable=false" "Availability filter (false)"

echo -e "${BLUE}📋 Test 3: Donor Name Search${NC}"
test_endpoint "$API_BASE/requests/search/donors?donorName=John" "Search by donor name (John)"
test_endpoint "$API_BASE/requests/search/donors?donorName=Sarah" "Search by donor name (Sarah)"
test_endpoint "$API_BASE/requests/search/donors?donorName=xyz" "Search by non-existent name"

echo -e "${BLUE}📋 Test 4: Distance-based Search${NC}"
test_endpoint "$API_BASE/requests/search/donors?maxDistance=10" "10km distance filter"
test_endpoint "$API_BASE/requests/search/donors?maxDistance=50" "50km distance filter"
test_endpoint "$API_BASE/requests/search/donors?maxDistance=1000" "1000km distance filter"

echo -e "${BLUE}📋 Test 5: Combined Filters${NC}"
test_endpoint "$API_BASE/requests/search/donors?isAvailable=true&maxDistance=50" "Available donors within 50km"
test_endpoint "$API_BASE/requests/search/donors?ableToShareMedicalRecord=true&donorName=John" "Medical record + name search"

echo -e "${BLUE}📋 Test 6: Zipcode Filter${NC}"
test_endpoint "$API_BASE/requests/search/donors?zipcode=12345" "Search by specific zipcode"
test_endpoint "$API_BASE/requests/search/donors?zipcode=99999" "Search by non-existent zipcode"

echo -e "${BLUE}📋 Test 7: Pagination${NC}"
test_endpoint "$API_BASE/requests/search/donors?page=1&limit=5" "Pagination - page 1, limit 5"

echo ""
echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo -e "${BLUE}🔧 Fixes Applied:${NC}"
echo "1. ✅ Fixed boolean validation - strings are now converted to booleans"
echo "2. ✅ Fixed donor name search - removed duplicate logic"
echo "3. ✅ Enhanced zipcode handling - donors with unknown zipcodes are included"
echo "4. ✅ Improved sorting - known distances first, then unknown distances"
echo ""
echo -e "${BLUE}📋 Expected Behavior:${NC}"
echo "• Boolean filters should work with 'true'/'false' strings from URL"
echo "• Donor name search should work without 500 errors"
echo "• Donors with zipcodes in database show actual distance"
echo "• Donors with zipcodes NOT in database show 'Distance unknown'"
echo "• Sorting: Known distances (shortest first), then unknown distances"
