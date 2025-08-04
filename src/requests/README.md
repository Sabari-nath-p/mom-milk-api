# Milk Request API Documentation

This document covers all API endpoints for the milk request and geolocation system.

## Authentication

All endpoints (except those marked as public) require JWT Bearer token authentication:

```
Authorization: Bearer <your-jwt-token>
```

## Request Endpoints

### Create Milk Request

**POST** `/requests`

Create a new milk request from a buyer to nearby donors.

**Request Body:**
```json
{
  "babyId": 1,
  "requestType": "FRESH",
  "urgency": "MEDIUM", 
  "quantity": 500,
  "maxDistance": 10,
  "requirements": "Organic milk preferred",
  "deliveryDate": "2024-01-15T10:00:00Z"
}
```

**Response:**
```json
{
  "id": 1,
  "buyerId": 1,
  "babyId": 1,
  "requestType": "FRESH",
  "status": "PENDING",
  "urgency": "MEDIUM",
  "quantity": 500,
  "maxDistance": 10,
  "requirements": "Organic milk preferred",
  "deliveryDate": "2024-01-15T10:00:00.000Z",
  "createdAt": "2024-01-14T08:00:00.000Z",
  "baby": {
    "name": "Baby John",
    "birthDate": "2023-12-01T00:00:00.000Z"
  }
}
```

### Get User's Requests

**GET** `/requests/my-requests?page=1&limit=20&status=PENDING`

Get current user's milk requests with optional filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (PENDING, ACCEPTED, DECLINED, COMPLETED, CANCELLED)
- `requestType` (optional): Filter by type (FRESH, FROZEN)
- `urgency` (optional): Filter by urgency (LOW, MEDIUM, HIGH, CRITICAL)

### Get Incoming Requests (Donors Only)

**GET** `/requests/incoming?page=1&limit=20`

Get requests that are nearby to the donor's location.

### Search for Donors

**GET** `/requests/search/donors?page=1&maxDistance=15&isAvailable=true`

Search for available donors near the buyer's location.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page  
- `maxDistance` (optional): Maximum distance in km
- `ableToShareMedicalRecord` (optional): Filter by medical record sharing
- `isAvailable` (optional): Filter by availability
- `bloodGroup` (optional): Filter by blood group

**Response:**
```json
{
  "data": [
    {
      "id": 2,
      "email": "donor@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "userType": "DONOR",
      "bloodGroup": "O+",
      "isAvailable": true,
      "distance": 5.2,
      "zipcode": "10001",
      "city": "New York"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 20,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### Accept Request (Donors Only)

**POST** `/requests/:id/accept`

Accept a milk request and optionally provide contact information.

**Request Body:**
```json
{
  "contactPhone": "+1234567890",
  "notes": "Available for pickup after 3 PM"
}
```

### Update Request

**PATCH** `/requests/:id`

Update request status or details.

**Request Body:**
```json
{
  "status": "COMPLETED",
  "notes": "Successfully delivered"
}
```

### Update Availability (Donors Only)

**PATCH** `/requests/availability`

Update donor availability status.

**Request Body:**
```json
{
  "isAvailable": false,
  "unavailableReason": "Out of town"
}
```

## Notification Endpoints

### Get Notifications

**GET** `/requests/notifications?page=1&limit=20`

Get user's notifications related to milk requests.

### Mark Notification as Read

**PATCH** `/requests/notifications/:notificationId/read`

Mark a specific notification as read.

### Mark All Notifications as Read

**PATCH** `/requests/notifications/mark-all-read`

Mark all user's notifications as read.

## Geolocation Management (Admin Only)

### Import Zipcodes from CSV

**POST** `/geolocation/zipcodes/import`

Upload and import zipcode data from a CSV file.

**Form Data:**
- `file`: CSV file with columns: zipcode,city,state,country,latitude,longitude

### Get All Zipcodes

**GET** `/geolocation/zipcodes?page=1&limit=100&search=New York`

List all zipcodes with pagination and search.

### Add Single Zipcode

**POST** `/geolocation/zipcodes`

Add a single zipcode entry.

**Request Body:**
```json
{
  "zipcode": "10001",
  "placeName": "New York",
  "state": "NY", 
  "country": "USA",
  "latitude": 40.7505,
  "longitude": -73.9934
}
```

### Update Zipcode

**PUT** `/geolocation/zipcodes/:id`

Update an existing zipcode entry.

### Delete Zipcode

**DELETE** `/geolocation/zipcodes/:id`

Delete a zipcode entry.

### Clear All Zipcode Data

**DELETE** `/geolocation/zipcodes/clear`

Remove all zipcode data from the database.

### Get Zipcode Statistics

**GET** `/geolocation/zipcodes/stats`

Get statistics about the zipcode database.

**Response:**
```json
{
  "total": 50000,
  "countries": 195,
  "lastImported": "2024-01-14T10:30:00.000Z"
}
```

## Public Geolocation Endpoints

### Find Nearby Zipcodes

**GET** `/geolocation/nearby/:zipcode?radius=10&limit=50`

Find zipcodes within a specified radius.

**Parameters:**
- `zipcode`: Target zipcode
- `radius` (optional): Radius in km (default: 10)
- `limit` (optional): Maximum results (default: 50)

### Calculate Distance

**GET** `/geolocation/distance/:zipcode1/:zipcode2`

Calculate distance between two zipcodes.

**Response:**
```json
{
  "zipcode1": "10001",
  "zipcode2": "90210", 
  "distance": 3944.4,
  "unit": "km",
  "locations": {
    "10001": {
      "zipcode": "10001",
      "placeName": "New York",
      "latitude": 40.7505,
      "longitude": -73.9934
    },
    "90210": {
      "zipcode": "90210", 
      "placeName": "Beverly Hills",
      "latitude": 34.0901,
      "longitude": -118.4065
    }
  }
}
```

## Request Status Flow

1. **PENDING** - Initial status when request is created
2. **ACCEPTED** - Donor accepts the request
3. **DECLINED** - Donor declines the request
4. **COMPLETED** - Milk exchange completed successfully
5. **CANCELLED** - Request cancelled by buyer

## Error Responses

All endpoints return consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created successfully
- `400` - Bad request / Validation error
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `500` - Internal server error

## Data Models

### MilkRequest
- `id`: Unique identifier
- `buyerId`: ID of the requesting user
- `donorId`: ID of the accepting donor (nullable)
- `babyId`: ID of the baby needing milk
- `requestType`: FRESH or FROZEN
- `status`: PENDING, ACCEPTED, DECLINED, COMPLETED, CANCELLED
- `urgency`: LOW, MEDIUM, HIGH, CRITICAL
- `quantity`: Amount in ml
- `maxDistance`: Maximum distance in km
- `requirements`: Special requirements text
- `deliveryDate`: Preferred delivery date
- `notes`: Additional notes
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### ZipCode
- `id`: Unique identifier
- `zipcode`: Postal/zip code
- `placeName`: City name
- `state`: State/province (optional)
- `country`: Country name
- `latitude`: Decimal latitude
- `longitude`: Decimal longitude
- `createdAt`: Creation timestamp

### RequestNotification
- `id`: Unique identifier
- `userId`: Target user ID
- `requestId`: Related request ID
- `type`: Notification type
- `title`: Notification title
- `message`: Notification message
- `isRead`: Read status
- `createdAt`: Creation timestamp
