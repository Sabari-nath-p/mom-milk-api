# 🚀 Mom's Milk API - Complete Setup & Deployment Guide

## Overview
This guide provides step-by-step instructions to set up and run the Mom's Milk backend API with MySQL database using Docker containers.

## 📋 Prerequisites

### Required Software
- **Docker Desktop** (v4.0+)
- **Docker Compose** (v2.0+)
- **Node.js** (v18+) - for local development
- **Git** - for version control

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux

## 🛠️ Quick Start (Docker)

### 1. Clone Repository
```bash
git clone <repository-url>
cd moms_milk_api
```

### 2. Start with Docker Compose
```bash
# Start all services (API + Database)
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f api
```

### 3. Initialize Database
```bash
# Run database migrations
docker-compose exec api npm run prisma:migrate

# Seed initial data (optional)
docker-compose exec api npm run prisma:seed
```

### 4. Access Application
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api
- **Database**: localhost:3306 (from host)

## 🐳 Docker Configuration

### Docker Compose Setup
The project includes a complete Docker setup with:
- **API Container**: NestJS application
- **MySQL Container**: Database with persistent storage
- **Network**: Isolated Docker network
- **Volumes**: Persistent data storage

### Container Architecture
```
┌─────────────────┐    ┌─────────────────┐
│   API Container │    │ MySQL Container │
│   (Port 3000)   │────│   (Port 3306)   │
│   NestJS App    │    │   Database      │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              Docker Network
```

## 📁 Project Structure
```
moms_milk_api/
├── src/
│   ├── auth/              # Authentication module
│   ├── users/             # User management
│   ├── babies/            # Baby profiles
│   ├── requests/          # Milk request system
│   ├── analytics/         # Analytics & reports
│   ├── startup/           # Auto-import services
│   └── data/              # CSV data files
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── docker/
│   ├── Dockerfile         # API container
│   └── docker-compose.yml # Complete setup
├── docs/                  # Documentation
└── README.md
```

## ⚙️ Environment Configuration

### Environment Variables
Create a `.env` file in the project root:

```bash
# Database Configuration
DATABASE_URL="mysql://root:password123@mysql:3306/moms_milk"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Email Configuration (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Default OTP for bypass
DEFAULT_OTP="759409"

# Application Configuration
NODE_ENV="development"
PORT=3000

# MySQL Configuration
MYSQL_ROOT_PASSWORD="password123"
MYSQL_DATABASE="moms_milk"
```

## 🗄️ Database Setup

### MySQL Configuration
The database is automatically configured with:
- **Database Name**: `moms_milk`
- **User**: `root`
- **Password**: `password123`
- **Port**: `3306` (host), `3306` (container)
- **Persistent Storage**: Docker volume

### Database Schema
The database includes tables for:
- **Users** (DONOR, BUYER, ADMIN types)
- **Babies** (Baby profiles)
- **Milk Requests** (Request management)
- **Care Logs** (Feed, Diaper, Sleep tracking)
- **Zip Codes** (Geolocation data)
- **Notifications** (Request notifications)
- **OTP Verification** (Authentication)

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended)
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Development with hot reload
docker-compose up -d
```

### Option 2: Local Development
```bash
# Install dependencies
npm install

# Start MySQL (Docker)
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=password123 \
  -e MYSQL_DATABASE=moms_milk \
  -p 3306:3306 \
  mysql:8.0

# Update DATABASE_URL for localhost
DATABASE_URL="mysql://root:password123@localhost:3306/moms_milk"

# Run migrations
npm run prisma:migrate

# Start development server
npm run start:dev
```

### Option 3: Kubernetes (Advanced)
```bash
# Deploy to Kubernetes cluster
kubectl apply -f k8s/
```

## 🔧 Development Setup

### Local Development with Docker
```bash
# Start only database
docker-compose up -d mysql

# Install dependencies locally
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run start:dev
```

### Hot Reload Development
```bash
# Start with file watching
docker-compose -f docker-compose.dev.yml up

# Or locally with database in Docker
npm run start:dev
```

## 📊 Monitoring & Logs

### View Container Logs
```bash
# API logs
docker-compose logs -f api

# Database logs
docker-compose logs -f mysql

# All logs
docker-compose logs -f
```

### Health Checks
```bash
# Check API health
curl http://localhost:3000/health

# Check database connection
docker-compose exec mysql mysql -u root -p -e "SHOW DATABASES;"
```

## 🔐 Security Configuration

### Production Security
```bash
# Generate secure JWT secret
openssl rand -base64 64

# Use strong MySQL password
MYSQL_ROOT_PASSWORD="your-very-strong-password"

# Enable SSL (production)
DATABASE_URL="mysql://root:password@mysql:3306/moms_milk?sslaccept=strict"
```

### Network Security
- API only accessible on port 3000
- Database not exposed to host in production
- Docker network isolation
- Environment variable encryption

## 🧪 Testing

### Run Tests
```bash
# Unit tests
docker-compose exec api npm run test

# E2E tests
docker-compose exec api npm run test:e2e

# Test coverage
docker-compose exec api npm run test:cov
```

### API Testing
```bash
# Test authentication
curl -X POST http://localhost:3000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test with bypass OTP
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"759409"}'
```

## 🔄 Data Management

### Prisma Database Operations

#### Database Migrations
```bash
# Run migrations in Docker
docker-compose exec api npx prisma migrate dev

# Deploy migrations in production
docker-compose exec api npx prisma migrate deploy

# Reset database (development only)
docker-compose exec api npx prisma migrate reset
```

#### Prisma Client
```bash
# Generate Prisma client
docker-compose exec api npx prisma generate

# View database with Prisma Studio
docker-compose --profile db-tools up prisma-studio
# Access at: http://localhost:5555
```

#### Database Schema Management
```bash
# Push schema changes without migrations (development)
docker-compose exec api npx prisma db push

# Validate schema
docker-compose exec api npx prisma validate

# View database
docker-compose exec api npx prisma studio
```

### Database Backup & Restore
```bash
# Backup database
docker-compose exec mysql mysqldump -u root -p moms_milk > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u root -p moms_milk < backup.sql

# Backup with Docker volume
docker run --rm -v moms_milk_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-backup.tar.gz -C /data .
```

### Zipcode Data Import
```bash
# Auto-import on startup (automatic in Docker)
docker-compose up -d

# Manual import via API
curl -X POST http://localhost:3000/geolocation/zipcodes/import

# Check import status
curl http://localhost:3000/geolocation/zipcodes/stats

# Import specific file
docker-compose exec api npm run zipcode:import
```

### Data Seeding
```bash
# Run database seed
docker-compose exec api npm run prisma:seed

# Custom data import
docker-compose exec api node scripts/import-data.js
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check if MySQL is running
docker-compose ps mysql

# Check MySQL logs
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

#### Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 docker-compose up -d
```

#### Migration Errors
```bash
# Reset database
docker-compose exec api npm run prisma:migrate:reset

# Or recreate containers
docker-compose down -v
docker-compose up -d
```

#### Docker Issues
```bash
# Clean Docker system
docker system prune -a

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d
```

### Debug Mode
```bash
# Start API in debug mode
docker-compose -f docker-compose.debug.yml up -d

# Or locally
npm run start:debug
```

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale API containers
docker-compose up -d --scale api=3

# Load balancer required for multiple instances
```

### Database Scaling
```bash
# Use MySQL replication
# Configure read replicas
# Implement connection pooling
```

## 🔍 API Documentation

### Swagger UI
Access interactive API documentation at:
- **Development**: http://localhost:3000/api
- **Production**: https://your-domain.com/api

### API Endpoints Overview
- **Authentication**: `/auth/*` - OTP login, profile management
- **Users**: `/users/*` - User CRUD operations
- **Babies**: `/babies/*` - Baby profile management
- **Requests**: `/requests/*` - Milk request system
- **Analytics**: `/analytics/*` - Usage statistics
- **Geolocation**: `/geolocation/*` - Zipcode management

## 🎯 Production Deployment

### Production Checklist
- [ ] Secure JWT secret
- [ ] Strong database passwords
- [ ] SSL/TLS certificates
- [ ] Environment variables encrypted
- [ ] Database backups configured
- [ ] Monitoring setup
- [ ] Log aggregation
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] Health checks implemented

### CI/CD Pipeline
```yaml
# Example GitHub Actions workflow
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: docker-compose -f docker-compose.prod.yml up -d
```

This complete setup guide provides everything needed to run the Mom's Milk API backend with database in Docker containers! 🚀
