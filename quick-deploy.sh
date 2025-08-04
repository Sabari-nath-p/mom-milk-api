#!/bin/bash

# Quick deployment script for Mom's Milk API
# Usage: curl -fsSL https://raw.githubusercontent.com/your-username/moms_milk_api/main/quick-deploy.sh | bash
# Run as regular user with sudo privileges (NOT as root)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Security check - don't run as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}[ERROR] This script should not be run as root for security reasons!${NC}"
    echo -e "${RED}Please run as a regular user with sudo privileges${NC}"
    echo -e "${YELLOW}Example setup:${NC}"
    echo "  sudo adduser deploy"
    echo "  sudo usermod -aG sudo deploy"
    echo "  sudo usermod -aG docker deploy"
    echo "  su - deploy"
    echo "  ./quick-deploy.sh"
    exit 1
fi

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                     Mom's Milk API Deployment                   ║"
echo "║                      Quick Setup for VPS                        ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
REPO_URL="https://github.com/your-username/moms_milk_api.git"
DEPLOY_DIR="/opt/moms_milk_api"
PROJECT_NAME="moms_milk_api"

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_error "This script should not be run as root for security reasons"
   log_info "Please run as a regular user with sudo privileges"
   exit 1
fi

# Check sudo access
if ! sudo -n true 2>/dev/null; then
    log_error "This script requires sudo privileges"
    log_info "Please run: sudo visudo"
    log_info "And add: $USER ALL=(ALL) NOPASSWD:ALL"
    exit 1
fi

log_info "Starting Mom's Milk API quick deployment..."

# Update system
log_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
log_info "Installing required packages..."
sudo apt install -y git curl ufw

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    log_info "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    log_success "Docker installed"
else
    log_info "Docker already installed"
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    log_info "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log_success "Docker Compose installed"
else
    log_info "Docker Compose already installed"
fi

# Setup firewall
log_info "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
log_success "Firewall configured"

# Clone repository
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

# Make scripts executable
chmod +x deploy.sh 2>/dev/null || true

# Setup environment
log_info "Setting up environment configuration..."

if [ ! -f ".env.prod" ]; then
    cp .env.production .env.prod
    
    # Generate secure passwords
    MYSQL_ROOT_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    MYSQL_APP_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-32)
    SESSION_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    # Update environment file
    sed -i "s/CHANGE_ME_ROOT_PASSWORD/$MYSQL_ROOT_PASS/g" .env.prod
    sed -i "s/CHANGE_ME_APP_PASSWORD/$MYSQL_APP_PASS/g" .env.prod
    sed -i "s/CHANGE_ME_JWT_SECRET_MIN_32_CHARS_FOR_PRODUCTION_SECURITY/$JWT_SECRET/g" .env.prod
    sed -i "s/CHANGE_ME_SESSION_SECRET_FOR_PRODUCTION/$SESSION_SECRET/g" .env.prod
    
    log_success "Environment file created with secure passwords"
    log_warning "Environment file location: $DEPLOY_DIR/.env.prod"
else
    log_info "Environment file already exists"
fi

# Deploy application
log_info "Building and deploying application..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Wait for services to start
log_info "Waiting for services to start..."
sleep 60

# Verify deployment
log_info "Verifying deployment..."

# Check containers
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

# Test API
if curl -f http://localhost:3000/health &> /dev/null; then
    log_success "API health check passed"
else
    log_warning "API health check failed - may still be starting"
fi

# Setup auto-restart service
log_info "Setting up auto-restart service..."
sudo tee /etc/systemd/system/moms-milk-api.service > /dev/null <<EOF
[Unit]
Description=Mom's Milk API
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable moms-milk-api.service
log_success "Auto-restart service configured"

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "your-server-ip")

echo
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    DEPLOYMENT SUCCESSFUL!                       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo
log_success "Mom's Milk API is now running on your VPS!"
echo
log_info "Access URLs:"
echo "  🌐 API: http://$SERVER_IP:3000"
echo "  📚 Swagger Docs: http://$SERVER_IP:3000/api"
echo "  ❤️  Health Check: http://$SERVER_IP:3000/health"
echo
log_info "Useful commands:"
echo "  📊 View containers: docker ps"
echo "  📝 View API logs: docker logs moms_milk_api_prod"
echo "  🔄 Restart service: sudo systemctl restart moms-milk-api"
echo "  🛑 Stop service: docker-compose -f docker-compose.prod.yml down"
echo
log_warning "NEXT STEPS:"
echo "  1. 🌍 Configure your domain DNS to point to: $SERVER_IP"
echo "  2. 🔒 Set up SSL certificate with Let's Encrypt"
echo "  3. ✉️  Update SMTP settings in: $DEPLOY_DIR/.env.prod"
echo "  4. 🎯 Update CORS_ORIGIN with your domain"
echo "  5. 🧪 Test all API endpoints"
echo
log_info "For detailed configuration, see: $DEPLOY_DIR/DEPLOYMENT.md"
echo
echo -e "${BLUE}🎉 Happy coding with Mom's Milk API! 🎉${NC}"
