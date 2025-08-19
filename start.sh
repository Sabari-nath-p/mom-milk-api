#!/bin/bash

# Mom's Milk API - Docker Startup Script
# This script helps you easily start and manage the Docker containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Mom's Milk API"
COMPOSE_FILE="docker-compose.dev.yml"

# Show banner
echo -e "${BLUE}🍼 $PROJECT_NAME - Docker Setup${NC}"
echo "================================================"

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker Desktop and try again.${NC}"
        exit 1
    fi
}

# Function to show help
show_help() {
    cat << EOF
Usage: $0 [COMMAND]

Commands:
  start, up        Start all services (default)
  stop, down       Stop all services  
  restart          Restart all services
  logs             Show logs from all services
  status           Show status of all containers
  clean            Remove all containers and volumes (fresh start)
  build            Rebuild containers
  help             Show this help message

Examples:
  $0 start         # Start the application
  $0 logs          # View logs
  $0 stop          # Stop the application
  $0 clean         # Clean everything for fresh start

EOF
}

# Function to start services
start_services() {
    echo -e "${GREEN}🚀 Starting $PROJECT_NAME services...${NC}"
    
    # Create directories if they don't exist
    mkdir -p docker/mysql-init
    mkdir -p src/data
    
    # Start services
    docker-compose -f $COMPOSE_FILE up -d
    
    echo -e "${GREEN}✅ Services started successfully!${NC}"
    echo ""
    echo -e "${BLUE}📱 Access Points:${NC}"
    echo "• API: http://localhost:3001"
    echo "• Swagger Docs: http://localhost:3001/api"
    echo "• Database Admin: http://localhost:8081"
    echo "• Prisma Studio: docker-compose --profile db-tools up -d prisma-studio"
    echo ""
    echo -e "${YELLOW}💡 Tip: Run '$0 logs' to see startup progress${NC}"
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}⏹️  Stopping $PROJECT_NAME services...${NC}"
    docker-compose -f $COMPOSE_FILE down
    echo -e "${GREEN}✅ Services stopped successfully!${NC}"
}

# Function to restart services
restart_services() {
    echo -e "${YELLOW}🔄 Restarting $PROJECT_NAME services...${NC}"
    docker-compose -f $COMPOSE_FILE restart
    echo -e "${GREEN}✅ Services restarted successfully!${NC}"
}

# Function to show logs
show_logs() {
    echo -e "${BLUE}📋 Showing logs for $PROJECT_NAME...${NC}"
    docker-compose -f $COMPOSE_FILE logs -f
}

# Function to show status
show_status() {
    echo -e "${BLUE}📊 $PROJECT_NAME - Container Status${NC}"
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    echo -e "${BLUE}💾 Volume Usage:${NC}"
    docker volume ls | grep moms_milk || echo "No volumes found"
}

# Function to clean everything
clean_all() {
    echo -e "${RED}🧹 This will remove ALL containers, volumes, and data!${NC}"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🗑️  Cleaning up...${NC}"
        docker-compose -f $COMPOSE_FILE down -v --remove-orphans
        docker system prune -f
        echo -e "${GREEN}✅ Cleanup completed!${NC}"
    else
        echo -e "${BLUE}ℹ️  Cleanup cancelled${NC}"
    fi
}

# Function to build containers
build_containers() {
    echo -e "${YELLOW}🔨 Building containers...${NC}"
    docker-compose -f $COMPOSE_FILE build --no-cache
    echo -e "${GREEN}✅ Build completed!${NC}"
}

# Main script logic
check_docker

case "${1:-start}" in
    "start"|"up")
        start_services
        ;;
    "stop"|"down")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "clean")
        clean_all
        ;;
    "build")
        build_containers
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo -e "${YELLOW}💡 Run '$0 help' for available commands${NC}"
        exit 1
        ;;
esac
