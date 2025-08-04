# Mom's Milk API - Analytics Module Documentation

## Overview
The Analytics Module provides comprehensive insights and paginated listing capabilities for baby care activities (feeding, diaper changes, and sleep). The module is designed to be scalable and modular to accommodate future requirements and updates.

## Features

### 1. Analytics Insights
Provides detailed analytics for three main baby care activities:

#### Feed Analytics
- **Total Feeds**: Count of all feeding sessions
- **Feed Time**: Total and average feeding duration
- **Amount Tracking**: Total and average milk amount consumed
- **Method Breakdown**: Count by feeding type (BREAST, BOTTLE, OTHER)
- **Position Analysis**: Feeding position distribution
- **Daily Patterns**: Feed counts and amounts per day

#### Diaper Analytics
- **Change Frequency**: Total changes and daily averages
- **Type Breakdown**: Distribution of diaper types (SOLID, LIQUID, BOTH)
- **Daily Patterns**: Change patterns by day
- **Hourly Distribution**: Change frequency by hour of day

#### Sleep Analytics
- **Sleep Sessions**: Total count and duration tracking
- **Sleep Quality**: Quality trends over time
- **Location Analysis**: Sleep location preferences
- **Session Statistics**: Longest/shortest sessions and averages
- **Daily Patterns**: Sleep patterns by day

### 2. Pagination Support
All listing APIs now support pagination with:
- **Page-based pagination**: `page` and `limit` parameters
- **Metadata**: Total items, pages, current page, navigation flags
- **Consistent response format**: Standardized `PaginatedResponse` structure

### 3. Date Filtering
All analytics and listing endpoints support optional date range filtering:
- **Start Date**: Filter from specific date
- **End Date**: Filter to specific date
- **Flexible**: Can use either or both parameters

## API Endpoints

### Analytics Endpoints
```
GET /analytics/baby/:babyId/feed        - Feed analytics for a baby
GET /analytics/baby/:babyId/diaper      - Diaper analytics for a baby
GET /analytics/baby/:babyId/sleep       - Sleep analytics for a baby
GET /analytics/baby/:babyId/combined    - Combined analytics for all activities
```

### Paginated Listing Endpoints
```
GET /feed-logs/paginated                - Paginated feed logs with filters
GET /feed-logs/baby/:babyId/paginated   - Paginated feed logs for specific baby
GET /diaper-logs/paginated              - Paginated diaper logs with filters
GET /diaper-logs/baby/:babyId/paginated - Paginated diaper logs for specific baby
GET /sleep-logs/paginated               - Paginated sleep logs with filters
GET /sleep-logs/baby/:babyId/paginated  - Paginated sleep logs for specific baby
```

## Query Parameters

### Analytics Filters
- `startDate` (optional): Start date in YYYY-MM-DD format
- `endDate` (optional): End date in YYYY-MM-DD format

### Pagination Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `startDate` (optional): Date range start
- `endDate` (optional): Date range end
- `babyId` (optional): Filter by specific baby (for global endpoints)

## Response Formats

### Analytics Response
```json
{
  "babyId": 1,
  "dateRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "feeding": { /* FeedAnalytics */ },
  "diaper": { /* DiaperAnalytics */ },
  "sleep": { /* SleepAnalytics */ },
  "generatedAt": "2024-01-31T10:00:00.000Z"
}
```

### Paginated Response
```json
{
  "data": [ /* Array of log entries */ ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Module Structure

### Core Files
- `analytics.dto.ts` - DTOs and interfaces for analytics and pagination
- `analytics.service.ts` - Business logic for analytics calculations
- `analytics.controller.ts` - API endpoints for analytics
- `analytics.module.ts` - Module configuration

### Enhanced Services
- Enhanced `feed-logs.service.ts` with pagination methods
- Enhanced `diaper-logs.service.ts` with pagination methods  
- Enhanced `sleep-logs.service.ts` with pagination methods

## Scalability Features

### 1. Modular Design
- Separate interfaces for each log type analytics
- Reusable pagination components
- Independent calculation methods

### 2. Extensible Analytics
- Easy to add new analytics metrics
- Configurable date range filtering
- Support for additional data aggregations

### 3. Performance Optimized
- Parallel database queries for combined analytics
- Efficient pagination with count queries
- Indexed database queries for date filtering

### 4. Future-Ready Architecture
- Extensible DTO interfaces
- Pluggable analytics calculation methods
- Support for additional filtering criteria

## Usage Examples

### Get Feed Analytics
```
GET /analytics/baby/1/feed?startDate=2024-01-01&endDate=2024-01-31
```

### Get Paginated Feed Logs
```
GET /feed-logs/baby/1/paginated?page=1&limit=20&startDate=2024-01-01
```

### Get Combined Analytics
```
GET /analytics/baby/1/combined?startDate=2024-01-01&endDate=2024-01-31
```

## Notes
- All endpoints include proper Swagger documentation
- Error handling for invalid baby IDs and date ranges
- Consistent validation across all endpoints
- Support for timezone-aware date filtering
- Graceful handling of missing or incomplete data

This analytics module provides a solid foundation that can be easily extended with additional metrics, new log types, or enhanced filtering capabilities as the application grows.
