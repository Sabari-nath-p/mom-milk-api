# 🍼 Mom's Milk API - Comprehensive Backend Platform

A complete NestJS backend application for breast milk donation platform with geolocation-based matching, user management, and comprehensive care tracking.

## 🎯 Overview

Mom's Milk API is a robust backend system that connects milk donors with buyers through intelligent geolocation matching, comprehensive user profiles, and real-time request management.

## 🚀 Quick Start

### One-Command Setup
```bash
git clone <repository-url>
cd moms_milk_api
./scripts/setup.sh
```

**That's it!** Access your API at http://localhost:3000

### Manual Setup
```bash
# 1. Copy environment
cp .env.example .env

# 2. Start with Docker
docker-compose up -d

# 3. Run migrations
docker-compose exec api npm run prisma:migrate
```

## ✨ Key Features

### 🔐 **Authentication System**
- **Email OTP Login** with bypass option (`759409`)
- **JWT Tokens** with 24-hour expiry
- **User Types**: DONOR, BUYER, ADMIN
- **Profile Management** with completion flow

### 👥 **User Management**
- **Complete Profiles** with health information
- **Geolocation Support** with zipcode integration
- **Availability Tracking** for donors
- **Admin Controls** for user management

### 🍼 **Baby Care System**
- **Baby Profiles** with multiple babies per user
- **Care Logging**: Feed, Diaper, Sleep tracking
- **Analytics Dashboard** with insights
- **Growth Tracking** and milestone recording

### 📍 **Milk Request System**
- **Geolocation Matching** with distance calculations
- **Request Workflow**: Create → Accept → Complete
- **Donor Search** sorted by shortest distance
- **Real-time Notifications** for status updates
- **Request Types**: FRESH, FROZEN milk

### 🗺️ **Geolocation Features**
- **Worldwide Zipcode Data** import from CSV
- **Haversine Distance** calculations
- **Nearby Donor Search** with radius filtering
- **Distance-based Sorting** (shortest to longest)
- **Location Management** with admin controls

## 🏗️ Architecture

### **Technology Stack**
- **Backend**: NestJS (TypeScript)
- **Database**: MySQL 8.0 with Prisma ORM
- **Authentication**: JWT + Email OTP
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker + Docker Compose
- **Validation**: class-validator, class-transformer

### **Project Structure**
```
src/
├── auth/              # Email OTP authentication
├── users/             # User management (DONOR/BUYER/ADMIN)
├── babies/            # Baby profiles and management
├── requests/          # Milk request system with geolocation
├── analytics/         # Usage analytics and insights
├── startup/           # Auto-import services
└── data/              # CSV data files (zipcodes)
```

## 📊 User Types & Features

### 🤱 **DONOR**
Mothers who donate breast milk:
- **Health Profile**: Blood group, delivery date, lifestyle
- **Availability Status**: Real-time availability tracking
- **Medical Records**: Optional sharing capability
- **Request Management**: Accept/decline incoming requests
- **Distance-based Visibility**: Shown to nearby buyers

### 👶 **BUYER**
Parents/caregivers seeking breast milk:
- **Request Creation**: Specify quantity, type, urgency
- **Donor Search**: Find nearby donors sorted by distance
- **Request Tracking**: Monitor request status and updates
- **Baby Profiles**: Multiple baby support with care logs
- **Geolocation Matching**: Automatic proximity-based matching

### 👨‍💼 **ADMIN**
Platform administrators:
- **User Management**: Enable/disable accounts
- **Zipcode Management**: Import and manage location data
- **System Monitoring**: Analytics and usage insights
- **Content Moderation**: Review and manage platform content

## 🛠️ Development Setup

### **Prerequisites**
- Docker Desktop 4.0+
- Node.js 18+ (for local development)
- Git

### **Environment Setup**
```bash
# 1. Clone repository
git clone <repository-url>
cd moms_milk_api

# 2. Copy environment file
cp .env.example .env

# 3. Update configuration (optional)
nano .env
```

### **Docker Development**
```bash
# Development with hot reload
./scripts/setup.sh dev

# Or manually
docker-compose -f docker-compose.dev.yml up -d
```

### **Local Development**
```bash
# Install dependencies
npm install

# Start database only
docker-compose up -d mysql

# Run migrations
npm run prisma:migrate

# Start development server
npm run start:dev
```

## 🚀 Deployment

### **Production Deployment**
```bash
# 1. Create production environment
cp .env.production.example .env.production

# 2. Update with production values
nano .env.production

# 3. Deploy
./scripts/setup.sh prod
```

### **Docker Compose (Simple)**
```bash
# Production
docker-compose -f docker-compose.prod.yml up -d

# Development
docker-compose up -d
```

## 📡 API Endpoints

### **Authentication**
- `POST /auth/send-otp` - Send OTP to email
- `POST /auth/verify-otp` - Verify OTP and login
- `POST /auth/complete-profile` - Complete new user profile
- `GET /auth/profile` - Get user profile
- `PATCH /auth/profile` - Update profile

### **Milk Requests**
- `POST /requests` - Create milk request
- `GET /requests/search/donors` - Search nearby donors (distance-sorted)
- `GET /requests/my-requests` - Get user's requests
- `GET /requests/incoming` - Get incoming requests (donors)
- `POST /requests/:id/accept` - Accept request (donors)
- `PATCH /requests/availability` - Update donor availability

### **Geolocation**
- `GET /geolocation/nearby/:zipcode` - Find nearby zipcodes
- `GET /geolocation/distance/:zip1/:zip2` - Calculate distance
- `POST /geolocation/zipcodes/import` - Import zipcode data (admin)
- `GET /geolocation/zipcodes` - List zipcodes (admin)

### **Baby Care**
- `POST /babies` - Create baby profile
- `GET /babies` - Get user's babies
- `POST /feed-logs` - Log feeding
- `POST /diaper-logs` - Log diaper change
- `POST /sleep-logs` - Log sleep
- `GET /analytics/care-summary` - Get care analytics

## 🗄️ Database Schema

### **Core Models**
- **User**: Complete user profiles with type-specific fields
- **Baby**: Baby profiles with care tracking
- **MilkRequest**: Request management with geolocation
- **ZipCode**: Worldwide zipcode data with coordinates
- **RequestNotification**: Real-time notifications
- **OtpVerification**: Email OTP management

### **Key Relationships**
- Users have multiple babies
- Buyers create requests for specific babies
- Donors accept requests based on proximity
- All activities generate analytics data

## 🔧 Configuration

### **Environment Variables**
```bash
# Database
DATABASE_URL="mysql://root:password123@mysql:3306/moms_milk"

# Authentication
JWT_SECRET="your-super-secret-key"
DEFAULT_OTP="759409"  # Bypass OTP for testing

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### **Feature Flags**
```bash
ENABLE_SWAGGER=true      # API documentation
ENABLE_CORS=true         # Cross-origin requests
ENABLE_RATE_LIMITING=true # Request throttling
```

## 📊 Data Import

### **Zipcode Data**
The system supports worldwide zipcode import:

```csv
country,zipcode,placename,latitude,longitude
USA,10001,New York,40.7505,-73.9934
UK,SW1A 1AA,London,51.5014,-0.1419
```

**Auto-import on startup** or manual import via API.

## 🧪 Testing

### **API Testing**
```bash
# Health check
curl http://localhost:3000/health

# Test authentication with bypass OTP
curl -X POST http://localhost:3000/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"759409"}'
```

### **Run Test Suite**
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# In Docker
docker-compose exec api npm run test
```

## 📈 Monitoring & Logs

### **Health Monitoring**
- **API Health**: http://localhost:3000/health
- **Database Health**: Built-in health checks
- **Container Status**: `docker-compose ps`

### **Logging**
```bash
# View all logs
docker-compose logs -f

# API logs only
docker-compose logs -f api

# Database logs
docker-compose logs -f mysql
```

## 🔒 Security Features

### **Authentication Security**
- JWT with secure expiration
- OTP with 5-minute timeout
- Account enable/disable controls
- Role-based access control

### **Data Security**
- Input validation on all endpoints
- SQL injection protection via Prisma
- Rate limiting on API endpoints
- Secure password handling (no passwords stored)

### **Container Security**
- Non-root container execution
- Network isolation
- Volume security
- Health check monitoring

## 🛠️ Available Scripts

```bash
# Setup & Management
npm run setup              # Complete Docker setup
npm run docker:up          # Start services
npm run docker:down        # Stop services
npm run docker:dev         # Development mode

# Database
npm run prisma:migrate     # Run migrations
npm run prisma:generate    # Generate client
npm run prisma:studio      # Database GUI
npm run prisma:seed        # Import sample data

# Development
npm run start:dev          # Hot reload development
npm run start:debug        # Debug mode
npm run build              # Build for production
npm run test               # Run tests
```

## �️ Database Tools

### Prisma Operations
```bash
# Quick Prisma commands via script
./scripts/prisma.sh migrate    # Run migrations
./scripts/prisma.sh studio     # Database UI at localhost:5555
./scripts/prisma.sh generate   # Generate Prisma client
./scripts/prisma.sh reset-dev  # Fresh development setup

# Database management in Docker
docker-compose exec api npx prisma migrate dev
docker-compose exec api npx prisma studio
docker-compose exec api npx prisma generate
```

### Database Access
```bash
# Prisma Studio (Recommended)
docker-compose --profile db-tools up -d prisma-studio
# Access: http://localhost:5555

# Adminer (SQL interface)  
# Access: http://localhost:8080
# Server: mysql, User: root, Password: password123

# Direct MySQL access
docker-compose exec mysql mysql -u root -p moms_milk
```

## �📚 Documentation

- **API Docs**: http://localhost:3000/api (Swagger UI)
- **Setup Guide**: [SETUP.md](./SETUP.md)
- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)
- **Authentication**: [AUTHENTICATION.md](./AUTHENTICATION.md)
- **Request System**: [src/requests/README.md](./src/requests/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Common Issues**
- **Port conflicts**: Change ports in `.env` file
- **Database connection**: Check MySQL container status
- **Migration errors**: Run `npm run prisma:migrate:reset`

### **Get Help**
```bash
# Check system status
./scripts/setup.sh status

# View help
./scripts/setup.sh help

# Clean and restart
./scripts/setup.sh clean
./scripts/setup.sh setup
```

---

**Mom's Milk API** - Connecting families through safe, local breast milk sharing 🍼💙

### 3. Admin
System administrators with basic profile information only.

## Common User Fields
- Name (required)
- Email (required, unique)
- Phone number (required)
- Zipcode (required)

## Baby Profiles

All users (donors, buyers, and admins) can create multiple baby profiles. Each baby profile contains:

### Required Fields
- **Name** - Baby's name
- **Gender** - BOY, GIRL, or OTHER
- **Delivery Date** - When the baby was born
- **User ID** - Which user owns this baby profile

### Optional Fields
- **Blood Group** - e.g., "O+", "A-", "B+", "AB+"
- **Weight** - In kilograms (kg)
- **Height** - In centimeters (cm)

## Baby Care Logs

Parents can track their baby's daily activities through three types of logs:

### Feed Logs
Track feeding sessions with detailed information:
- **Feeding Date & Time** - When feeding occurred (start and end times)
- **Feed Type** - BREAST, BOTTLE, or OTHER
- **Position** - LEFT, RIGHT, or BOTH (optional, mainly for breastfeeding)
- **Amount** - Quantity in ml (optional, mainly for bottle feeding)
- **Notes** - Additional observations (optional)

### Diaper Logs
Track diaper changes and patterns:
- **Date & Time** - When diaper change occurred
- **Diaper Type** - SOLID, LIQUID, or BOTH
- **Notes** - Additional observations (optional)

### Sleep Logs
Track sleep patterns and duration:
- **Date & Time** - Sleep start and end times
- **Sleep Quality** - Descriptive quality assessment (optional)
- **Location** - CRIB, BED, STROLLER, or OTHER
- **Notes** - Additional observations (optional)
- **Analytics** - Automatic calculation of sleep duration and patterns

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL database
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env` and update with your database credentials:
   ```bash
   cp .env.example .env
   ```
   
   Update the `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="mysql://username:password@localhost:3306/moms_milk_db"
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Create database tables
   npm run prisma:push
   
   # (Optional) Seed database with sample data
   npm run prisma:seed
   
   # (Optional) Open Prisma Studio to view data
   npm run prisma:studio
   ```

4. **Start the application:**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

## API Endpoints

### Base URL
- Development: `http://localhost:3000`
- Swagger Documentation: `http://localhost:3000/api`

### User Endpoints

#### Basic Operations
- `POST /users` - Create a new user
- `GET /users` - Get all users (includes baby profiles)
- `GET /users/:id` - Get user by ID (includes baby profiles)
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### User Type Specific
- `GET /users/donors` - Get all donors
- `GET /users/buyers` - Get all buyers
- `GET /users/admins` - Get all admins

#### Search & Filter
- `GET /users/email/:email` - Find user by email
- `GET /users/donors/zipcode/:zipcode` - Find donors by zipcode
- `GET /users/donors/medical-record-sharing` - Find donors willing to share medical records

### Baby Endpoints

#### Basic Operations
- `POST /babies` - Create a new baby profile
- `GET /babies` - Get all baby profiles
- `GET /babies/:id` - Get baby profile by ID (includes recent logs)
- `PATCH /babies/:id` - Update baby profile
- `DELETE /babies/:id` - Delete baby profile

#### User-Specific Operations
- `GET /babies/user/:userId` - Get all baby profiles for a specific user
- `DELETE /babies/user/:userId/all` - Delete all baby profiles for a user

#### Search & Filter
- `GET /babies/gender/:gender` - Get babies by gender (BOY, GIRL, OTHER)
- `GET /babies/blood-group/:bloodGroup` - Get babies by blood group
- `GET /babies/age-range?minMonths=0&maxMonths=12` - Get babies by age range

### Feed Log Endpoints

#### Basic Operations
- `POST /feed-logs` - Create a new feed log entry
- `GET /feed-logs` - Get all feed logs
- `GET /feed-logs/:id` - Get feed log by ID
- `PATCH /feed-logs/:id` - Update feed log
- `DELETE /feed-logs/:id` - Delete feed log

#### Baby-Specific Operations
- `GET /feed-logs/baby/:babyId` - Get all feed logs for a baby
- `GET /feed-logs/baby/:babyId/date-range?startDate=2024-01-01&endDate=2024-01-31` - Get feed logs by date range
- `DELETE /feed-logs/baby/:babyId/all` - Delete all feed logs for a baby

#### Search & Filter
- `GET /feed-logs/feed-type/:feedType` - Get logs by feed type (BREAST, BOTTLE, OTHER)

### Diaper Log Endpoints

#### Basic Operations
- `POST /diaper-logs` - Create a new diaper log entry
- `GET /diaper-logs` - Get all diaper logs
- `GET /diaper-logs/:id` - Get diaper log by ID
- `PATCH /diaper-logs/:id` - Update diaper log
- `DELETE /diaper-logs/:id` - Delete diaper log

#### Baby-Specific Operations
- `GET /diaper-logs/baby/:babyId` - Get all diaper logs for a baby
- `GET /diaper-logs/baby/:babyId/date-range?startDate=2024-01-01&endDate=2024-01-31` - Get diaper logs by date range
- `DELETE /diaper-logs/baby/:babyId/all` - Delete all diaper logs for a baby

#### Search & Filter
- `GET /diaper-logs/diaper-type/:diaperType` - Get logs by diaper type (SOLID, LIQUID, BOTH)

### Sleep Log Endpoints

#### Basic Operations
- `POST /sleep-logs` - Create a new sleep log entry
- `GET /sleep-logs` - Get all sleep logs
- `GET /sleep-logs/:id` - Get sleep log by ID
- `PATCH /sleep-logs/:id` - Update sleep log
- `DELETE /sleep-logs/:id` - Delete sleep log

#### Baby-Specific Operations
- `GET /sleep-logs/baby/:babyId` - Get all sleep logs for a baby
- `GET /sleep-logs/baby/:babyId/date-range?startDate=2024-01-01&endDate=2024-01-31` - Get sleep logs by date range
- `GET /sleep-logs/baby/:babyId/analytics?startDate=2024-01-01&endDate=2024-01-31` - Get sleep analytics with duration calculations
- `DELETE /sleep-logs/baby/:babyId/all` - Delete all sleep logs for a baby

#### Search & Filter
- `GET /sleep-logs/location/:location` - Get logs by sleep location (CRIB, BED, STROLLER, OTHER)

## Example API Usage

### Create a Feed Log
```json
POST /feed-logs
{
  "feedingDate": "2024-01-15T00:00:00.000Z",
  "startTime": "2024-01-15T09:00:00.000Z",
  "endTime": "2024-01-15T09:30:00.000Z",
  "feedType": "BREAST",
  "position": "LEFT",
  "amount": 120.5,
  "note": "Baby fed well and seemed satisfied",
  "babyId": 1
}
```

### Create a Diaper Log
```json
POST /diaper-logs
{
  "date": "2024-01-15T00:00:00.000Z",
  "time": "2024-01-15T10:30:00.000Z",
  "diaperType": "BOTH",
  "note": "Normal diaper change, baby was comfortable",
  "babyId": 1
}
```

### Create a Sleep Log
```json
POST /sleep-logs
{
  "date": "2024-01-15T00:00:00.000Z",
  "startTime": "2024-01-15T20:00:00.000Z",
  "endTime": "2024-01-16T06:00:00.000Z",
  "sleepQuality": "Deep sleep, peaceful night",
  "location": "CRIB",
  "note": "Baby slept well through the night",
  "babyId": 1
}
```

### Get Sleep Analytics
```
GET /sleep-logs/baby/1/analytics?startDate=2024-01-01&endDate=2024-01-31
```

### Create a Baby Profile
```json
POST /babies
{
  "name": "Emma Johnson",
  "gender": "GIRL",
  "deliveryDate": "2024-01-15T00:00:00.000Z",
  "bloodGroup": "O+",
  "weight": 3.2,
  "height": 50.5,
  "userId": 1
}
```

### Get Babies by Age Range
```
GET /babies/age-range?minMonths=0&maxMonths=6
```

### Create a Donor
```json
POST /users
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "phone": "+1234567890",
  "zipcode": "12345",
  "userType": "DONOR",
  "description": "Healthy mother willing to donate breast milk",
  "bloodGroup": "O+",
  "babyDeliveryDate": "2024-01-15T00:00:00.000Z",
  "healthStyle": "[\"healthy_diet\", \"regular_exercise\", \"no_smoking\"]",
  "ableToShareMedicalRecord": true
}
```

### Create a Buyer
```json
POST /users
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "phone": "+1987654321",
  "zipcode": "54321",
  "userType": "BUYER"
}
```

### Create an Admin
```json
POST /users
{
  "name": "Admin User",
  "email": "admin@example.com",
  "phone": "+1555000111",
  "zipcode": "00000",
  "userType": "ADMIN"
}
```

## Database Schema

### Users Table
- `id` - Auto-increment primary key
- `name` - String (required)
- `email` - String (unique, required)
- `phone` - String (required)
- `zipcode` - String (required)
- `userType` - Enum (DONOR, BUYER, ADMIN)
- `description` - String (optional, required for donors)
- `bloodGroup` - String (optional)
- `babyDeliveryDate` - DateTime (optional, required for donors)
- `healthStyle` - String (JSON array format)
- `ableToShareMedicalRecord` - Boolean (default: false)
- `createdAt` - DateTime (auto-generated)
- `updatedAt` - DateTime (auto-updated)

### Babies Table
- `id` - Auto-increment primary key
- `name` - String (required)
- `gender` - Enum (BOY, GIRL, OTHER)
- `deliveryDate` - DateTime (required)
- `bloodGroup` - String (optional)
- `weight` - Float (optional, in kg)
- `height` - Float (optional, in cm)
- `userId` - Integer (foreign key to users table)
- `createdAt` - DateTime (auto-generated)
- `updatedAt` - DateTime (auto-updated)

### Feed Logs Table
- `id` - Auto-increment primary key
- `feedingDate` - DateTime (required)
- `startTime` - DateTime (required)
- `endTime` - DateTime (required)
- `feedType` - Enum (BREAST, BOTTLE, OTHER)
- `position` - Enum (LEFT, RIGHT, BOTH) - optional
- `amount` - Float (optional, in ml)
- `note` - String (optional)
- `babyId` - Integer (foreign key to babies table)
- `createdAt` - DateTime (auto-generated)
- `updatedAt` - DateTime (auto-updated)

### Diaper Logs Table
- `id` - Auto-increment primary key
- `date` - DateTime (required)
- `time` - DateTime (required)
- `diaperType` - Enum (SOLID, LIQUID, BOTH)
- `note` - String (optional)
- `babyId` - Integer (foreign key to babies table)
- `createdAt` - DateTime (auto-generated)
- `updatedAt` - DateTime (auto-updated)

### Sleep Logs Table
- `id` - Auto-increment primary key
- `date` - DateTime (required)
- `startTime` - DateTime (required)
- `endTime` - DateTime (required)
- `sleepQuality` - String (optional)
- `location` - Enum (CRIB, BED, STROLLER, OTHER)
- `note` - String (optional)
- `babyId` - Integer (foreign key to babies table)
- `createdAt` - DateTime (auto-generated)
- `updatedAt` - DateTime (auto-updated)

### Relationships
- **One-to-Many**: Each User can have multiple Baby profiles
- **One-to-Many**: Each Baby can have multiple Feed Logs, Diaper Logs, and Sleep Logs
- **Cascade Delete**: When a user is deleted, all their baby profiles and logs are automatically deleted
- **Cascade Delete**: When a baby is deleted, all their logs are automatically deleted

## Validation Rules

### For Donor Users
- `description` is required
- `babyDeliveryDate` is required
- Other fields are optional but recommended

### For Buyer/Admin Users
- Only common fields (name, email, phone, zipcode, userType) are required
- Donor-specific fields are ignored

## Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:prod` - Start in production mode
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema changes to database
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Next Steps

The authentication module with OTP login will be implemented separately as requested. The current user module provides the foundation for managing different user types in the milk donation platform.
