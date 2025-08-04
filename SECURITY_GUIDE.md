# 🔐 Security Guide for Hostinger VPS Deployment

## ⚠️ Critical Security Notice

**NEVER run deployment scripts as root!** This is a major security risk that can compromise your entire server.

## 🛡️ Secure Deployment Process

### Step 1: Root Setup (ONE TIME ONLY)

Connect as root **ONLY** for initial server setup:

```bash
# Connect as root for initial setup
ssh root@your-vps-ip

# Run the secure setup script
wget https://raw.githubusercontent.com/Sabari-nath-p/mom-milk-api/main/hostinger-setup.sh
chmod +x hostinger-setup.sh
./hostinger-setup.sh
```

This script will:
- ✅ Create a dedicated `deploy` user
- ✅ Add user to sudo and docker groups
- ✅ Configure proper permissions
- ✅ Set up firewall rules
- ✅ Install Docker securely

### Step 2: Switch to Deploy User

**After initial setup, ALWAYS use the deploy user:**

```bash
# Switch to deploy user
su - deploy

# Verify you're not root
whoami  # Should show: deploy
```

### Step 3: Secure Deployment

```bash
# All deployment commands run as deploy user
cd /opt/moms_milk_api
./quick-deploy.sh  # Safe to run as deploy user
```

## 🔒 Security Features Implemented

### 1. **User Isolation**
- Dedicated `deploy` user with minimal privileges
- No direct root access to application
- Proper file ownership and permissions

### 2. **Script Security Checks**
```bash
# Scripts check for root user and exit
if [ "$EUID" -eq 0 ]; then
    echo "ERROR: Don't run as root!"
    exit 1
fi
```

### 3. **Docker Security**
```dockerfile
# Non-root container user
RUN addgroup --gid 1001 --system nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs
```

### 4. **Firewall Protection**
```bash
# Only necessary ports open
ufw allow ssh      # SSH access
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 3000/tcp # API (if needed)
```

### 5. **Environment Security**
- Secure password generation
- Environment variable isolation
- Database credential protection

## 🚨 Common Security Mistakes to Avoid

### ❌ **DON'T DO THIS:**

```bash
# WRONG - Running as root
sudo su -
./deploy.sh  # DANGEROUS!

# WRONG - Default passwords
MYSQL_ROOT_PASSWORD=password123

# WRONG - Exposing sensitive data
git add .env  # Don't commit environment files!
```

### ✅ **DO THIS INSTEAD:**

```bash
# CORRECT - Using deploy user
su - deploy
./deploy.sh  # Safe!

# CORRECT - Strong passwords
MYSQL_ROOT_PASSWORD=X7$mK9#nP2qR8@vL4$eN6!wZ

# CORRECT - Secure environment
echo ".env" >> .gitignore
```

## 🔧 Security Verification

### Check Current User
```bash
whoami
# Should show: deploy (NOT root)
```

### Verify Permissions
```bash
ls -la /opt/moms_milk_api
# Should show: deploy:deploy ownership
```

### Check Running Processes
```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
# Containers should run as non-root user
```

## 🆘 If You Accidentally Ran as Root

If you already ran scripts as root, fix the permissions:

```bash
# As root, fix ownership
chown -R deploy:deploy /opt/moms_milk_api

# Switch to deploy user
su - deploy

# Restart services
cd /opt/moms_milk_api
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## 📋 Security Checklist

Before going live, verify:

- [ ] Not running as root user
- [ ] Deploy user has proper permissions
- [ ] Strong passwords in .env file
- [ ] Firewall configured correctly
- [ ] SSL certificates installed
- [ ] Environment files not in git
- [ ] Regular security updates scheduled
- [ ] Backup system configured
- [ ] Monitoring/alerting set up

## 🔄 Ongoing Security Maintenance

### Weekly Tasks:
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Monthly Tasks:
```bash
# Review user permissions
sudo -l

# Check for unused Docker resources
docker system prune -f

# Rotate passwords (if needed)
nano .env  # Update passwords
```

## 🚀 Secure Deployment Commands

```bash
# ✅ SECURE: Initial setup (as root, one time only)
ssh root@vps-ip
./hostinger-setup.sh

# ✅ SECURE: All deployments (as deploy user)
su - deploy
./quick-deploy.sh

# ❌ INSECURE: Don't do this!
sudo ./deploy.sh  # Wrong!
```

---

**Remember**: Security is not optional. Always follow the principle of least privilege and never run application code as root!

## 📞 Emergency Contact

If you encounter security issues or need help:

1. **Immediately** stop all services: `docker-compose down`
2. **Secure** the server: Change passwords, check logs
3. **Report** any suspicious activity
4. **Rebuild** from clean state if compromised

Stay secure! 🔒
