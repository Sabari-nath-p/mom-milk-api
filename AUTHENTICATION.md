# Mom's Milk API - Authentication System Documentation

## Overview
The authentication system uses **Email OTP (One-Time Password)** authentication with JWT tokens. It supports user registration, login, profile management, and administrative controls.

## Features

### 🔐 **Core Authentication**
- **Email OTP Login**: Users log in using email and OTP verification
- **Bypass OTP**: Default OTP `759409` for testing and SMTP failures  
- **New User Flow**: First-time users complete profile after OTP verification
- **JWT Tokens**: Secure bearer token authentication with 24-hour expiry
- **User Types**: Support for DONOR, BUYER, and ADMIN user types

### 👤 **User Management**
- **Profile Completion**: New users must complete profile to set `isNew: false`
- **Profile Updates**: Users can update their information anytime
- **Admin Controls**: Admins can enable/disable user accounts
- **FCM Tokens**: Push notification support with token management

### 🔒 **Security Features**
- **OTP Expiry**: 5-minute OTP expiration for security
- **Attempt Limiting**: Track failed OTP attempts (max 3 attempts)
- **Account Status**: Admin can disable user accounts
- **Role-based Access**: Admin-only endpoints with proper guards

## API Endpoints

### Authentication Flow

#### 1. Send OTP
```http
POST /auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "expiresAt": "2024-01-15T10:05:00.000Z"
}
```

#### 2. Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**For Existing User:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "isNew": false,
  "authData": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "userType": "BUYER",
      "isNew": false,
      "isActive": true
    }
  }
}
```

**For New User:**
```json
{
  "success": true,
  "message": "OTP verified successfully. Please complete your profile.",
  "isNew": true
}
```

#### 3. Complete Profile (New Users)
```http
POST /auth/complete-profile
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "zipcode": "12345",
  "userType": "BUYER",
  
  // Optional fields for DONOR type
  "description": "Healthy lifestyle",
  "bloodGroup": "O+",
  "babyDeliveryDate": "2024-01-15",
  "healthStyle": "[\"organic\", \"vegetarian\"]",
  "ableToShareMedicalRecord": true
}
```

### Profile Management

#### Get User Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PATCH /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+1234567890"
}
```

#### Update FCM Token
```http
PATCH /auth/fcm-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "fcmToken": "fcm_token_here"
}
```

### Admin Operations

#### Enable/Disable User (Admin Only)
```http
PATCH /auth/admin/user/{userId}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": false
}
```

#### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <token>
```

## User Flow

### New User Registration
1. **Send OTP** → User enters email
2. **Verify OTP** → User enters OTP (or default `759409`)
3. **Complete Profile** → User fills required information
4. **Login Success** → Receive JWT token and user data

### Existing User Login
1. **Send OTP** → User enters email  
2. **Verify OTP** → User enters OTP (or default `759409`)
3. **Login Success** → Receive JWT token and user data

### Profile Update Flow
1. **Authentication Required** → User must be logged in
2. **Update Profile** → User updates information
3. **`isNew` Flag** → Automatically set to `false` after first update

## Database Schema

### User Model
```prisma
model User {
  id                       Int      @id @default(autoincrement())
  name                     String
  email                    String   @unique
  phone                    String
  zipcode                  String
  userType                 UserType
  
  // Authentication fields
  isNew                    Boolean  @default(true)
  isActive                 Boolean  @default(true)
  fcmToken                 String?
  lastLoginAt              DateTime?
  
  // Donor specific fields
  description              String?
  bloodGroup               String?
  babyDeliveryDate         DateTime?
  healthStyle              String?
  ableToShareMedicalRecord Boolean? @default(false)
  
  // Relationships
  babies                   Baby[]
  otpVerifications         OtpVerification[]
  
  createdAt                DateTime @default(now())
  updatedAt                DateTime @updatedAt
}
```

### OTP Verification Model
```prisma
model OtpVerification {
  id        Int      @id @default(autoincrement())
  email     String
  otp       String
  expiresAt DateTime
  isUsed    Boolean  @default(false)
  attempts  Int      @default(0)
  
  userId    Int?
  user      User?    @relation(fields: [userId], references: [id])
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Configuration

### Environment Variables
```bash
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"

# Email Configuration (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Default OTP for bypass
DEFAULT_OTP="759409"
```

### JWT Configuration
- **Secret**: Configurable via `JWT_SECRET` environment variable
- **Expiry**: 24 hours (configurable in auth module)
- **Algorithm**: HS256

## Security Features

### OTP Security
- **6-digit OTP**: Random generation for each request
- **5-minute expiry**: Automatic OTP expiration
- **Single use**: OTPs marked as used after verification
- **Bypass OTP**: `759409` always works (for testing/SMTP failures)

### JWT Security
- **Bearer token**: Authorization header required
- **User validation**: Token payload validated against database
- **Role verification**: Admin endpoints check user type

### Account Security
- **Active status**: Admins can disable accounts
- **Failed attempts**: Track OTP verification failures
- **Last login**: Track user login activity

## Error Handling

### Common Error Responses

#### Invalid OTP
```json
{
  "statusCode": 401,
  "message": "Invalid or expired OTP",
  "error": "Unauthorized"
}
```

#### Account Disabled
```json
{
  "statusCode": 401,
  "message": "Your account has been disabled. Please contact support.",
  "error": "Unauthorized"
}
```

#### Admin Access Required
```json
{
  "statusCode": 403,
  "message": "Admin access required",
  "error": "Forbidden"
}
```

## Integration Notes

### Email Service Integration
- **SMTP Configuration**: Optional email sending
- **Graceful Fallback**: API doesn't fail if email sending fails
- **Default OTP**: Users can always use `759409` if email fails

### Push Notifications
- **FCM Token Storage**: Users can set/update FCM tokens
- **Notification Ready**: Backend prepared for push notification integration

### User Type Handling
- **DONOR Fields**: Additional fields for donor-type users
- **BUYER/ADMIN**: Basic profile fields only
- **Validation**: Appropriate validation based on user type

## Testing

### Bypass Features
- **Default OTP**: `759409` always works for any email
- **SMTP Failure**: Login still works if email service is down
- **Admin Testing**: Create admin user to test admin endpoints

### Test Scenarios
1. **New user registration** with profile completion
2. **Existing user login** with immediate token access  
3. **OTP bypass** using default OTP `759409`
4. **Profile updates** and `isNew` flag management
5. **Admin operations** for user management
6. **FCM token** management for notifications

This authentication system provides a robust, scalable foundation for user management with proper security measures and flexibility for testing and production use.
