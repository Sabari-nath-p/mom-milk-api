# 🚀 Mom's Milk API - Quick Start Guide

## 📦 One-Command Setup

```bash
# Clone and setup entire project
git clone <repository-u- **Zipcode Data**: http://localhost:3000/geolocation/zipcodes/stats

## 🗄️ Database Tools

### Prisma Studio (Database UI)
```bash
# Start Prisma Studio
docker-compose --profile db-tools up -d prisma-studio

# Access at: http://localhost:5555
```

### Adminer (Database Admin)
```bash
# Access Adminer at: http://localhost:8080
# Server: mysql
# Username: root  
# Password: password123
# Database: moms_milk
```

### Database Operations
```bash
# Run migrations
docker-compose exec api npx prisma migrate dev

# Reset database
docker-compose exec api npx prisma migrate reset

# Generate Prisma client
docker-compose exec api npx prisma generate

# View database schema
docker-compose exec api npx prisma studio
```

## 🐛 Troubleshootingl>
cd moms_milk_api
./scripts/setup.sh
```

## 🎯 Quick Commands

### Setup & Start
```bash
# Complete setup (API + Database)
./scripts/setup.sh setup

# Development mode (with hot reload)
./scripts/setup.sh dev

# Production mode
./scripts/setup.sh prod
```

### Management
```bash
# Check status
./scripts/setup.sh status

# View logs
./scripts/setup.sh logs

# Clean up
./scripts/setup.sh clean
```

## 🔗 Access URLs

After running setup, access:

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api  
- **Database Admin**: http://localhost:8080
- **Health Check**: http://localhost:3000/health

## 🔧 Manual Setup (Alternative)

### 1. Start Services
```bash
# Copy environment file
cp .env.example .env

# Start with Docker Compose
docker-compose up -d
```

### 2. Initialize Database
```bash
# Run migrations
docker-compose exec api npm run prisma:migrate

# Import sample data
docker-compose exec api npm run prisma:seed
```

### 3. Test API
```bash
# Test authentication
curl -X POST http://localhost:3000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Use bypass OTP
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"759409"}'
```

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Check what's using port 3000
lsof -i :3000
# Kill the process or change port in .env
```

**Database connection failed:**
```bash
# Check MySQL container
docker-compose logs mysql
# Restart services
docker-compose restart
```

**Migration errors:**
```bash
# Reset database
docker-compose exec api npm run prisma:migrate:reset
```

### Get Help
```bash
# Show all available commands
./scripts/setup.sh help

# Check service status
./scripts/setup.sh status
```

## 📊 What Gets Installed

- **NestJS API** - Backend server with all modules
- **MySQL 8.0** - Database with persistent storage  
- **Prisma ORM** - Database management and migrations
- **Swagger UI** - API documentation interface
- **Adminer** - Database administration tool
- **Sample Data** - Worldwide zipcode data for testing

## 🎉 Ready to Use!

The API includes:
- ✅ **Authentication** with email OTP
- ✅ **User Management** (DONOR/BUYER/ADMIN)
- ✅ **Baby Profiles** with care logging
- ✅ **Milk Requests** with geolocation matching
- ✅ **Analytics** with pagination
- ✅ **Zipcode Import** with distance calculations

Start making requests to http://localhost:3000/api! 🚀
