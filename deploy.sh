#!/bin/bash

# Auto-deployment script for Mom's Milk API on Hostinger VPS
# This script handles the complete deployment process
# Run as regular user with sudo privileges (NOT as root)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="moms_milk_api"
REPO_URL="https://github.com/Sabari-nath-p/mom-milk-api.git"
DEPLOY_DIR="/opt/${PROJECT_NAME}"
BACKUP_DIR="/opt/${PROJECT_NAME}_backups"
ENV_FILE=".env"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_user_privileges() {
    log_info "Checking user privileges..."
    
    # Check if running as root (security risk)
    if [ "$EUID" -eq 0 ]; then
        log_error "This script should not be run as root for security reasons!"
        log_error "Please run as a regular user with sudo privileges:"
        log_error "  1. Create a user: sudo adduser deploy"
        log_error "  2. Add to sudo group: sudo usermod -aG sudo deploy"
        log_error "  3. Add to docker group: sudo usermod -aG docker deploy"
        log_error "  4. Switch user: su - deploy"
        log_error "  5. Run this script: ./deploy.sh"
        exit 1
    fi
    
    # Check if user has sudo privileges
    if ! sudo -n true 2>/dev/null; then
        log_error "This script requires sudo privileges"
        log_error "Please ensure your user is in the sudo group"
        log_error "Run: sudo usermod -aG sudo \$USER"
        exit 1
    fi
    
    # Check if user is in docker group
    if ! groups | grep -q docker; then
        log_warning "User is not in docker group. Adding..."
        sudo usermod -aG docker $USER
        log_warning "Please log out and log back in for docker group changes to take effect"
        log_warning "Then run this script again"
        exit 1
    fi
    
    log_success "User privileges verified"
}

check_requirements() {
    log_info "Checking system requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        sudo usermod -aG docker $USER
        log_success "Docker installed successfully"
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Installing..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        log_success "Docker Compose installed successfully"
    fi
    
    # Check if Git is installed
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed. Installing Git..."
        sudo apt-get update
        sudo apt-get install -y git
        log_success "Git installed successfully"
    fi
    
    log_success "All requirements satisfied"
}

setup_firewall() {
    log_info "Configuring firewall..."
    
    # Enable UFW if not already enabled
    sudo ufw --force enable
    
    # Allow SSH (important!)
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Allow API port (if not using reverse proxy)
    sudo ufw allow 3000/tcp
    
    log_success "Firewall configured"
}

clone_or_update_repo() {
    log_info "Setting up project repository..."
    
    if [ -d "$DEPLOY_DIR" ]; then
        log_info "Project directory exists. Updating..."
        cd "$DEPLOY_DIR"
        git pull origin main
    else
        log_info "Cloning repository..."
        sudo mkdir -p "$DEPLOY_DIR"
        sudo chown $USER:$USER "$DEPLOY_DIR"
        git clone "$REPO_URL" "$DEPLOY_DIR"
        cd "$DEPLOY_DIR"
    fi
    
    # Ensure proper ownership
    sudo chown -R $USER:$USER "$DEPLOY_DIR"
    
    log_success "Repository ready"
}

setup_environment() {
    log_info "Setting up environment configuration..."
    
    if [ ! -f "$DEPLOY_DIR/$ENV_FILE" ]; then
        log_warning "Environment file not found. Creating from template..."
        cp "$DEPLOY_DIR/.env.production" "$DEPLOY_DIR/$ENV_FILE"
        
        log_warning "IMPORTANT: Please edit $DEPLOY_DIR/$ENV_FILE with your production values:"
        log_warning "- Change MYSQL_ROOT_PASSWORD"
        log_warning "- Change MYSQL_PASSWORD"  
        log_warning "- Change JWT_SECRET"
        log_warning "- Set NODE_ENV=production"
        log_warning "- Update SMTP settings"
        log_warning "- Update CORS_ORIGIN with your domain"
        
        # Open editor for user to edit environment file
        read -p "Press enter to edit the environment file (nano will open)..."
        nano "$DEPLOY_DIR/$ENV_FILE"
    fi
    
    log_success "Environment configuration ready"
}

backup_existing_data() {
    log_info "Creating backup of existing data..."
    
    # Create backup directory
    sudo mkdir -p "$BACKUP_DIR"
    
    # Backup database if running
    if docker ps | grep -q "moms_milk_mysql_prod"; then
        log_info "Backing up existing database..."
        BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
        docker exec moms_milk_mysql_prod mysqldump -u root -p"${MYSQL_ROOT_PASSWORD}" --all-databases > "$BACKUP_FILE"
        log_success "Database backup created: $BACKUP_FILE"
    fi
}

deploy_application() {
    log_info "Deploying application..."
    
    cd "$DEPLOY_DIR"
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down || true
    
    # Build and start new containers
    docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" up -d --build
    
    log_success "Application deployed successfully"
}

verify_deployment() {
    log_info "Verifying deployment..."
    
    # Wait for services to start
    sleep 30
    
    # Check if containers are running
    if docker ps | grep -q "moms_milk_api_prod"; then
        log_success "API container is running"
    else
        log_error "API container failed to start"
        docker logs moms_milk_api_prod
        exit 1
    fi
    
    if docker ps | grep -q "moms_milk_mysql_prod"; then
        log_success "Database container is running"
    else
        log_error "Database container failed to start"
        docker logs moms_milk_mysql_prod
        exit 1
    fi
    
    # Test API health endpoint
    if curl -f http://localhost:3000/health &> /dev/null; then
        log_success "API health check passed"
    else
        log_warning "API health check failed - checking logs..."
        docker logs moms_milk_api_prod
    fi
    
    log_success "Deployment verification completed"
}

setup_monitoring() {
    log_info "Setting up monitoring and auto-restart..."
    
    # Create systemd service for auto-restart
    sudo tee /etc/systemd/system/moms-milk-api.service > /dev/null <<EOF
[Unit]
Description=Mom's Milk API
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml --env-file $ENV_FILE up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable moms-milk-api.service
    
    log_success "Auto-restart service configured"
}

display_info() {
    log_success "Deployment completed successfully!"
    echo
    log_info "Application URLs:"
    echo "  API: http://your-server-ip:3000"
    echo "  Swagger Docs: http://your-server-ip:3000/api"
    echo "  Health Check: http://your-server-ip:3000/health"
    echo
    log_info "Useful commands:"
    echo "  View logs: docker logs moms_milk_api_prod"
    echo "  View all containers: docker ps"
    echo "  Restart services: sudo systemctl restart moms-milk-api"
    echo "  Stop services: docker-compose -f docker-compose.prod.yml down"
    echo
    log_warning "Next steps:"
    echo "  1. Configure your domain DNS to point to this server"
    echo "  2. Set up SSL certificates (Let's Encrypt recommended)"
    echo "  3. Update nginx configuration with your domain"
    echo "  4. Test all API endpoints"
}

# Main execution
main() {
    log_info "Starting Mom's Milk API deployment on Hostinger VPS..."
    
    check_user_privileges
    check_requirements
    setup_firewall
    clone_or_update_repo
    setup_environment
    backup_existing_data
    deploy_application
    verify_deployment
    setup_monitoring
    display_info
    
    log_success "Deployment script completed!"
}

# Run main function
main "$@"
