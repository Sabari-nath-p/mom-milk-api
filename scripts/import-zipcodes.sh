#!/bin/bash

###############################################################################
# Zipcode Import Script - Bash Wrapper
# 
# This script provides a convenient wrapper for the Node.js zipcode import tool
# Usage: ./scripts/import-zipcodes.sh [options]
###############################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Change to project root
cd "$PROJECT_ROOT" || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Dependencies not installed. Running npm install..."
    npm install
fi

# Display banner
echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║          Zipcode Import Tool - Bash Wrapper                      ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Parse arguments and pass them to the Node.js script
if [ $# -eq 0 ]; then
    print_info "Running import with default settings..."
    npm run import:zipcodes
else
    print_info "Running import with custom options: $*"
    npm run import:zipcodes -- "$@"
fi

# Capture exit code
EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    print_success "Import completed successfully!"
else
    print_error "Import failed with exit code: $EXIT_CODE"
fi

exit $EXIT_CODE
