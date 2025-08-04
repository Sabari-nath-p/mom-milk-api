# Mom's Milk API - Production Deployment on Hostinger VPS

This guide provides complete instructions for deploying the Mom's Milk API on your Hostinger VPS server.

## 🚀 Quick Deployment

### One-Command Deployment

```bash
curl -fsSL https://raw.githubusercontent.com/your-username/moms_milk_api/main/deploy.sh | bash
```

### Manual Deployment

1. **Clone the repository**
```bash
git clone https://github.com/your-username/moms_milk_api.git
cd moms_milk_api
chmod +x deploy.sh
./deploy.sh
```

## 📋 Prerequisites

### Server Requirements
- **VPS**: Hostinger VPS or any Linux server
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 20GB free space
- **OS**: Ubuntu 20.04+ or Debian 10+

### Software (Auto-installed by script)
- Docker & Docker Compose
- Git
- UFW Firewall
- Curl

## 🔧 Manual Setup (Alternative)

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for Docker group membership
```

### 2. Clone Repository

```bash
git clone https://github.com/your-username/moms_milk_api.git
cd moms_milk_api
```

### 3. Configure Environment

```bash
# Copy and edit production environment
cp .env.production .env.prod
nano .env.prod
```

**Important Environment Variables to Change:**
```env
# Database passwords (CHANGE THESE!)
MYSQL_ROOT_PASSWORD="your_strong_password_here"
MYSQL_PASSWORD="your_app_password_here"

# JWT Secret (CHANGE THIS!)
JWT_SECRET="your_super_secure_jwt_secret_min_32_characters"

# Your domain (CHANGE THIS!)
CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com"

# Email configuration (CONFIGURE THESE!)
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 4. Deploy Application

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Check container status
docker ps

# View logs
docker logs moms_milk_api_prod
```

### 5. Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow essential ports
sudo ufw allow ssh
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # API (if not using nginx)
```

## 🌐 Domain & SSL Setup

### 1. DNS Configuration
Point your domain to your VPS IP:
```
Type: A
Name: @
Value: YOUR_VPS_IP
TTL: 300

Type: A  
Name: www
Value: YOUR_VPS_IP
TTL: 300
```

### 2. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install snapd
sudo snap install --classic certbot

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Update nginx config with your domain
sudo nano docker/nginx/nginx.conf
# Change 'your-domain.com' to your actual domain

# Restart nginx container
docker restart moms_milk_nginx_prod
```

## 📊 Monitoring & Maintenance

### Container Management

```bash
# View all containers
docker ps -a

# View logs
docker logs moms_milk_api_prod
docker logs moms_milk_mysql_prod

# Restart specific service
docker restart moms_milk_api_prod

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Update and restart
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

### Database Backup

```bash
# Manual backup
docker exec moms_milk_mysql_prod mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" moms_milk > backup.sql

# Restore backup
docker exec -i moms_milk_mysql_prod mysql -u root -p"$MYSQL_ROOT_PASSWORD" moms_milk < backup.sql

# Automated backups are configured to run daily
```

### Health Checks

```bash
# API Health
curl http://your-domain.com/health

# Container Health
docker ps --filter "name=moms_milk" --format "table {{.Names}}\\t{{.Status}}"

# System Resources
docker stats --no-stream
```

## 🔒 Security Best Practices

### 1. Environment Security
- ✅ Strong passwords for database
- ✅ Secure JWT secret (32+ characters)
- ✅ CORS properly configured
- ✅ HTTPS enabled
- ✅ Non-root user in containers

### 2. Firewall Configuration
```bash
# Check firewall status
sudo ufw status

# Only essential ports should be open:
# 22/tcp (SSH), 80/tcp (HTTP), 443/tcp (HTTPS)
```

### 3. Regular Updates
```bash
# Update application
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build

# Update system
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose -f docker-compose.prod.yml pull
```

## 🚨 Troubleshooting

### Common Issues

1. **Containers won't start**
```bash
# Check logs
docker logs moms_milk_api_prod
docker logs moms_milk_mysql_prod

# Check environment file
cat .env.prod
```

2. **Database connection issues**
```bash
# Check MySQL container
docker exec -it moms_milk_mysql_prod mysql -u root -p

# Verify environment variables
docker exec moms_milk_api_prod env | grep DATABASE_URL
```

3. **API not responding**
```bash
# Check if API is running
curl http://localhost:3000/health

# Check container resources
docker stats moms_milk_api_prod
```

4. **SSL/Domain issues**
```bash
# Test domain resolution
nslookup yourdomain.com

# Check nginx config
docker exec moms_milk_nginx_prod nginx -t

# View nginx logs
docker logs moms_milk_nginx_prod
```

### Performance Optimization

1. **Increase container resources if needed**
```yaml
# In docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 1G
    reservations:
      memory: 512M
```

2. **Database optimization**
```bash
# Check database performance
docker exec moms_milk_mysql_prod mysql -u root -p -e "SHOW PROCESSLIST;"
```

## 📱 API Endpoints

After successful deployment, your API will be available at:

- **Base URL**: `https://yourdomain.com`
- **API Documentation**: `https://yourdomain.com/api`
- **Health Check**: `https://yourdomain.com/health`

### Key Endpoints:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /users/donors` - List donors
- `POST /requests` - Create milk request
- `GET /requests` - List requests

## 🆘 Support

If you encounter issues:

1. Check logs: `docker logs moms_milk_api_prod`
2. Verify environment: `cat .env.prod`
3. Test health: `curl http://localhost:3000/health`
4. Check resources: `docker stats`

## 📝 Notes

- Database backups run automatically daily at 2 AM
- Logs are rotated automatically
- Containers auto-restart on failure
- Health checks monitor service status
- Resource limits prevent excessive usage

---

**Deployment completed successfully!** 🎉

Your Mom's Milk API is now running in production on your Hostinger VPS.
