#!/bin/bash

# Mom's Milk API - Docker Setup Script
# This script sets up the entire application with Docker

set -e

echo "🚀 Setting up Mom's Milk API with Docker..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        log_warning ".env file not found. Copying from .env.example..."
        cp .env.example .env
        log_info "Please edit .env file with your configuration"
    else
        log_success ".env file exists"
    fi
}

# Setup function
setup() {
    log_info "Setting up Mom's Milk API..."
    
    # Check prerequisites
    check_docker
    check_env
    
    # Stop any running containers
    log_info "Stopping any existing containers..."
    docker-compose down -v || true
    
    # Build and start services
    log_info "Building and starting services..."
    docker-compose up -d --build
    
    # Wait for database to be ready
    log_info "Waiting for database to be ready..."
    sleep 30
    
    # Run database migrations
    log_info "Running database migrations..."
    docker-compose exec -T api npm run prisma:migrate:dev || {
        log_warning "Migration failed, trying to push schema..."
        docker-compose exec -T api npm run prisma:db:push
    }
    
    # Generate Prisma client
    log_info "Generating Prisma client..."
    docker-compose exec -T api npm run prisma:generate
    
    # Import zipcode data (optional)
    log_info "Importing sample zipcode data..."
    docker-compose exec -T api npm run prisma:seed || log_warning "Seed failed, continuing..."
    
    log_success "Setup completed successfully!"
    
    # Display access information
    echo ""
    echo "🎉 Mom's Milk API is now running!"
    echo ""
    echo "📍 Access URLs:"
    echo "   API: http://localhost:3000"
    echo "   Swagger Docs: http://localhost:3000/api"
    echo "   Database Admin: http://localhost:8080"
    echo ""
    echo "🔧 Useful commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart: docker-compose restart"
    echo ""
}

# Development setup
dev() {
    log_info "Setting up development environment..."
    
    check_docker
    check_env
    
    # Use development compose file
    docker-compose -f docker-compose.dev.yml down -v || true
    docker-compose -f docker-compose.dev.yml up -d --build
    
    # Wait for services
    sleep 30
    
    # Setup database
    docker-compose -f docker-compose.dev.yml exec -T api npm run prisma:migrate:dev
    docker-compose -f docker-compose.dev.yml exec -T api npm run prisma:generate
    
    log_success "Development environment is ready!"
    echo "🔥 Hot reload is enabled - edit files to see changes automatically"
}

# Production setup
prod() {
    log_info "Setting up production environment..."
    
    check_docker
    
    if [ ! -f .env.production ]; then
        log_error ".env.production file not found. Please create it with production settings."
        exit 1
    fi
    
    # Use production compose file
    docker-compose -f docker-compose.prod.yml down || true
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait for services
    sleep 30
    
    # Setup database
    docker-compose -f docker-compose.prod.yml exec -T api npm run prisma:migrate:deploy
    
    log_success "Production environment is ready!"
}

# Clean up
clean() {
    log_warning "Cleaning up Docker resources..."
    
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v || true
    docker-compose -f docker-compose.prod.yml down -v || true
    
    # Remove images (optional)
    read -p "Remove Docker images? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker image prune -f
        docker rmi $(docker images "moms_milk*" -q) 2>/dev/null || true
    fi
    
    log_success "Cleanup completed"
}

# Status check
status() {
    echo "📊 Mom's Milk API Status:"
    echo ""
    
    if docker-compose ps | grep -q "Up"; then
        log_success "Services are running"
        docker-compose ps
        echo ""
        
        # Check API health
        if curl -f http://localhost:3000/health &>/dev/null; then
            log_success "API is healthy"
        else
            log_warning "API is not responding"
        fi
        
        # Check database
        if docker-compose exec mysql mysqladmin ping -h localhost -u root -ppassword123 --silent; then
            log_success "Database is healthy"
        else
            log_warning "Database is not responding"
        fi
    else
        log_warning "Services are not running"
        echo "Run './scripts/setup.sh setup' to start services"
    fi
}

# Logs
logs() {
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# Help
help() {
    echo "Mom's Milk API - Docker Setup Script"
    echo ""
    echo "Usage: $0 {setup|dev|prod|clean|status|logs|help}"
    echo ""
    echo "Commands:"
    echo "  setup   - Setup complete application (default)"
    echo "  dev     - Setup development environment with hot reload"
    echo "  prod    - Setup production environment"
    echo "  clean   - Clean up all Docker resources"
    echo "  status  - Check application status"
    echo "  logs    - View application logs (optional: specify service)"
    echo "  help    - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup"
    echo "  $0 dev"
    echo "  $0 logs api"
    echo "  $0 status"
}

# Main script logic
case "${1:-setup}" in
    setup)
        setup
        ;;
    dev)
        dev
        ;;
    prod)
        prod
        ;;
    clean)
        clean
        ;;
    status)
        status
        ;;
    logs)
        logs $2
        ;;
    help)
        help
        ;;
    *)
        log_error "Unknown command: $1"
        help
        exit 1
        ;;
esac
