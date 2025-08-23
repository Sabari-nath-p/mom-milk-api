#!/bin/bash

# Admin Setup and Testing Script
# This script helps setup and test admin login

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔑 Mom's Milk API - Admin Setup & Testing${NC}"
echo "=============================================="

# Function to check if API is running
check_api() {
    echo -e "${BLUE}📡 Checking if API is running...${NC}"
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API is running on port 3001${NC}"
        return 0
    else
        echo -e "${RED}❌ API is not running. Please start it first with ./start.sh${NC}"
        return 1
    fi
}

# Function to seed the database
seed_database() {
    echo -e "${YELLOW}🌱 Seeding database with admin user...${NC}"
    docker-compose -f docker-compose.dev.yml exec api npm run prisma:seed
    echo -e "${GREEN}✅ Database seeded successfully${NC}"
}

# Function to test admin login
test_admin_login() {
    echo -e "${BLUE}🔐 Testing admin login...${NC}"
    
    # Step 1: Send OTP
    echo "📨 Step 1: Sending OTP to admin@momsmilk.com..."
    OTP_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/send-otp \
        -H "Content-Type: application/json" \
        -d '{"email": "admin@momsmilk.com"}')
    
    if echo "$OTP_RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}✅ OTP sent successfully${NC}"
    else
        echo -e "${RED}❌ Failed to send OTP${NC}"
        echo "Response: $OTP_RESPONSE"
        return 1
    fi
    
    # Step 2: Verify OTP
    echo "🔓 Step 2: Verifying OTP with default code 759409..."
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/verify-otp \
        -H "Content-Type: application/json" \
        -d '{"email": "admin@momsmilk.com", "otp": "759409"}')
    
    if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
        echo -e "${GREEN}✅ Admin login successful!${NC}"
        
        # Extract the token for testing
        TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        
        if [ ! -z "$TOKEN" ]; then
            echo -e "${BLUE}🎫 Access Token: ${NC}${TOKEN:0:20}..."
            
            # Test authenticated endpoint
            echo "🧪 Testing authenticated admin endpoint..."
            PROFILE_RESPONSE=$(curl -s -X GET http://localhost:3001/auth/profile \
                -H "Authorization: Bearer $TOKEN")
            
            if echo "$PROFILE_RESPONSE" | grep -q "ADMIN"; then
                echo -e "${GREEN}✅ Admin access confirmed!${NC}"
                echo -e "${GREEN}🎉 Admin login is working perfectly!${NC}"
            else
                echo -e "${YELLOW}⚠️  Login successful but admin role not confirmed${NC}"
                echo "Profile Response: $PROFILE_RESPONSE"
            fi
        fi
    else
        echo -e "${RED}❌ Admin login failed${NC}"
        echo "Response: $LOGIN_RESPONSE"
        return 1
    fi
}

# Function to show admin info
show_admin_info() {
    echo -e "${BLUE}📋 Admin Login Information:${NC}"
    echo "Email: admin@momsmilk.com"
    echo "OTP: 759409 (default OTP that always works)"
    echo "API Endpoint: http://localhost:3001"
    echo "Swagger Docs: http://localhost:3001/api"
    echo ""
    echo -e "${YELLOW}📱 Access Points:${NC}"
    echo "• API: http://localhost:3001"
    echo "• Database Admin (Adminer): http://localhost:8081"
    echo "• Swagger Documentation: http://localhost:3001/api"
    echo ""
    echo -e "${YELLOW}🔑 Manual Login Steps:${NC}"
    echo "1. POST /auth/send-otp with {\"email\": \"admin@momsmilk.com\"}"
    echo "2. POST /auth/verify-otp with {\"email\": \"admin@momsmilk.com\", \"otp\": \"759409\"}"
    echo "3. Use the returned accessToken in Authorization header: Bearer <token>"
}

# Function to check database
check_database() {
    echo -e "${BLUE}🗄️  Checking database and admin user...${NC}"
    
    # Check if admin user exists
    ADMIN_CHECK=$(docker-compose -f docker-compose.dev.yml exec -T mysql mysql -u root -ppassword123 -e "USE moms_milk; SELECT COUNT(*) as count FROM users WHERE email='admin@momsmilk.com' AND userType='ADMIN';" 2>/dev/null || echo "0")
    
    if echo "$ADMIN_CHECK" | grep -q "1"; then
        echo -e "${GREEN}✅ Admin user exists in database${NC}"
    else
        echo -e "${YELLOW}⚠️  Admin user not found. Running seed...${NC}"
        seed_database
    fi
}

# Main execution
main() {
    case "${1:-test}" in
        "test")
            if check_api; then
                check_database
                test_admin_login
            fi
            ;;
        "seed")
            seed_database
            ;;
        "info")
            show_admin_info
            ;;
        "check")
            check_api
            check_database
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [COMMAND]"
            echo ""
            echo "Commands:"
            echo "  test     Test admin login (default)"
            echo "  seed     Seed database with admin user"
            echo "  info     Show admin login information"
            echo "  check    Check API and database status"
            echo "  help     Show this help message"
            ;;
        *)
            echo -e "${RED}❌ Unknown command: $1${NC}"
            echo "Run '$0 help' for available commands"
            exit 1
            ;;
    esac
}

main "$@"
