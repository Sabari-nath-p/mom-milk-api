#!/bin/bash

# Secure setup script for Hostinger VPS
# Run this ONCE as root to create deployment user, then switch to that user

echo "🔐 Setting up secure deployment environment on Hostinger VPS..."

# Check if running as root (required for initial setup)
if [ "$EUID" -ne 0 ]; then
    echo "❌ This initial setup script must be run as root"
    echo "After setup, all deployment scripts should run as regular user"
    exit 1
fi

# Update system and install Docker
echo "📦 Installing system dependencies..."
apt update && apt upgrade -y && \
apt install -y curl wget git unzip software-properties-common nano && \
curl -fsSL https://get.docker.com | sh && \
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
chmod +x /usr/local/bin/docker-compose && \

# Create deployment user
echo "👤 Creating deployment user..."
if ! id "deploy" &>/dev/null; then
    adduser --disabled-password --gecos "" deploy
    usermod -aG sudo deploy
    usermod -aG docker deploy
    echo "deploy ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/deploy
fi

# Setup firewall
echo "🛡️ Configuring firewall..."
ufw --force enable && \
ufw allow ssh && \
ufw allow 22/tcp && \
ufw allow 80/tcp && \
ufw allow 443/tcp && \
ufw allow 3000/tcp && \

# Create project directory with proper ownership
echo "📁 Setting up project directory..."
mkdir -p /opt/moms_milk_api && \
chown -R deploy:deploy /opt/moms_milk_api && \

echo "✅ Secure setup complete!"
echo ""
echo "� Next steps:"
echo "1. Switch to deployment user: su - deploy"
echo "2. Upload your project files to /opt/moms_milk_api/"
echo "3. Run: cd /opt/moms_milk_api && chmod +x quick-deploy.sh && ./quick-deploy.sh"
echo ""
echo "⚠️  IMPORTANT: Do NOT run deployment scripts as root!"
