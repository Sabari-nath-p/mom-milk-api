#!/bin/bash

# Test Script for Enhanced Donor Search API
# Tests the new zipcode and donor name search parameters

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_BASE="http://localhost:3001"

echo -e "${BLUE}🔍 Testing Enhanced Donor Search API${NC}"
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
        echo "$response" | jq '.data | length' 2>/dev/null | while read count; do
            echo "Found $count donors"
        done
    else
        echo "❌ Failed or no data"
        echo "Response: $response"
    fi
    echo ""
}

# Test original functionality
test_endpoint "$API_BASE/requests/search/donors" "Basic donor search"

# Test with pagination
test_endpoint "$API_BASE/requests/search/donors?page=1&limit=5" "With pagination"

# Test with distance filter
test_endpoint "$API_BASE/requests/search/donors?maxDistance=50" "With distance filter"

# Test NEW zipcode filter
test_endpoint "$API_BASE/requests/search/donors?zipcode=12345" "NEW: Search by zipcode"

# Test NEW donor name search
test_endpoint "$API_BASE/requests/search/donors?donorName=Sarah" "NEW: Search by donor name (Sarah)"

# Test NEW donor name search (partial)
test_endpoint "$API_BASE/requests/search/donors?donorName=John" "NEW: Search by donor name (John)"

# Test combined filters with NEW parameters
test_endpoint "$API_BASE/requests/search/donors?zipcode=12345&donorName=Sarah&isAvailable=true" "NEW: Combined zipcode + name + availability"

# Test with blood group and new zipcode filter
test_endpoint "$API_BASE/requests/search/donors?zipcode=12345&bloodGroup=O+" "NEW: Zipcode + blood group filter"

echo -e "${BLUE}📋 New API Parameters Added:${NC}"
echo "• zipcode: Filter donors by specific zipcode"
echo "• donorName: Search donors by name (case-insensitive, partial match)"
echo ""
echo -e "${BLUE}📖 Example Usage:${NC}"
echo "GET /requests/search/donors?zipcode=12345"
echo "GET /requests/search/donors?donorName=Sarah"
echo "GET /requests/search/donors?zipcode=12345&donorName=Johnson&isAvailable=true"
echo ""
echo -e "${BLUE}🔧 Note:${NC}"
echo "• When zipcode is specified, it overrides distance-based search"
echo "• Donor name search uses case-insensitive partial matching"
echo "• All existing filters still work as before"
