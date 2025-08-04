# 🌐 Hostinger VPS Deployment Guide

## 🔐 IMPORTANT SECURITY NOTICE
**Never run deployment scripts as root!** Always use a dedicated deployment user for security.

## Step 1: Connect to Your Hostinger VPS

```bash
# Connect via SSH as root (only for initial setup)
ssh root@your-vps-ip-address
```

## Step 2: Secure Initial Setup (Run as root ONCE)

```bash
# Download and run the secure setup script
wget https://raw.githubusercontent.com/Sabari-nath-p/mom-milk-api/main/hostinger-setup.sh
chmod +x hostinger-setup.sh
./hostinger-setup.sh
```

This will:
- Update the system
- Install Docker & Docker Compose
- Create a `deploy` user with proper permissions
- Configure firewall
- Set up project directory

## Step 3: Switch to Deployment User

```bash
# Switch to the secure deployment user
su - deploy
```

## Step 4: Upload Your Project

### Option A: Via Git (Recommended)
```bash
cd /opt/moms_milk_api
git clone https://github.com/Sabari-nath-p/mom-milk-api.git .
```

### Option B: Via SCP (from your local machine)
```bash
scp -r /path/to/your/project/* deploy@your-vps-ip:/opt/moms_milk_api/
```

## Step 5: Setup Environment Configuration

```bash
# Ensure you're in the project directory as deploy user
cd /opt/moms_milk_api

# Copy environment template
cp .env.production .env

# Edit environment file with your production values
nano .env
```

### Critical Environment Variables to Update:
```env
# Database Configuration - CHANGE THESE PASSWORDS!
MYSQL_ROOT_PASSWORD=your_secure_root_password_here_123
MYSQL_PASSWORD=your_secure_app_password_here_456

# Application Configuration - IMPORTANT!
NODE_ENV=production
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_long_change_this

# CORS Configuration
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com

# Database URL
DATABASE_URL=mysql://app_user:your_secure_app_password_here_456@mysql:3306/moms_milk
```

## Step 6: Deploy the Application (as deploy user)

### Quick Deploy (Recommended)
```bash
# Make sure you're the deploy user, not root!
whoami  # Should show: deploy

# Run quick deployment
chmod +x quick-deploy.sh
./quick-deploy.sh
```

### Manual Deploy
```bash
chmod +x deploy.sh
./deploy.sh
```

## Step 8: Verify Deployment

```bash
# Check if containers are running
docker ps

# Test API health
curl http://localhost:3000/health

# Check logs
docker logs moms_milk_api_prod
docker logs moms_milk_mysql_prod
```

## Step 9: Setup Domain & SSL (Optional but Recommended)

### Configure Domain DNS:
1. Go to your domain registrar
2. Add A record pointing to your VPS IP
3. Wait for DNS propagation (can take up to 24 hours)

### Install SSL Certificate:
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal setup
systemctl enable certbot.timer
```

## Step 10: Setup Monitoring & Auto-restart

```bash
# Create systemd service for auto-restart
cat > /etc/systemd/system/moms-milk-api.service << EOF
[Unit]
Description=Mom's Milk API
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/moms_milk_api
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
systemctl daemon-reload
systemctl enable moms-milk-api.service
systemctl start moms-milk-api.service
```

## 🎯 Quick Deployment Commands Summary

### Step 1: Initial Server Setup (as root)
```bash
# Connect as root (ONLY for initial setup)
ssh root@your-vps-ip

# Run secure setup
wget https://raw.githubusercontent.com/Sabari-nath-p/mom-milk-api/main/hostinger-setup.sh
chmod +x hostinger-setup.sh
./hostinger-setup.sh
```

### Step 2: Deploy Application (as deploy user)
```bash
# Switch to deploy user
su - deploy

# Upload project and deploy
cd /opt/moms_milk_api
git clone https://github.com/Sabari-nath-p/mom-milk-api.git .
cp .env.production .env
nano .env  # Edit with your production values
chmod +x quick-deploy.sh
./quick-deploy.sh
```

## ⚠️ Security Best Practices

### ✅ DO:
- Run initial setup as root (hostinger-setup.sh)
- Switch to `deploy` user for all deployment tasks
- Use strong, unique passwords
- Keep environment variables secure
- Regularly update your system

### ❌ DON'T:
- Run deployment scripts as root
- Use default passwords
- Expose sensitive environment variables
- Skip firewall configuration

## 🔍 Troubleshooting

### Check Container Status:
```bash
docker ps -a
```

### View Logs:
```bash
docker logs moms_milk_api_prod
docker logs moms_milk_mysql_prod
```

### Restart Services:
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Check Firewall:
```bash
ufw status
```

### Check Disk Space:
```bash
df -h
```

### Monitor Resources:
```bash
docker stats
top
```

## 📱 Access Your Application

After successful deployment:

- **API**: `http://your-vps-ip:3000` or `https://your-domain.com`
- **Health Check**: `http://your-vps-ip:3000/health`
- **Swagger Docs**: `http://your-vps-ip:3000/api`
- **Database Admin**: `http://your-vps-ip:8080` (phpMyAdmin)

## 🔄 Regular Maintenance

### Update Application:
```bash
cd /opt/moms_milk_api
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup Database:
```bash
./docker/scripts/backup.sh
```

### Clean Docker:
```bash
docker system prune -f
```

---

✅ **Your Mom's Milk API is now live on Hostinger VPS!**
