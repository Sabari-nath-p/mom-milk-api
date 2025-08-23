# 🔍 Enhanced Donor Search API - New Features

## ✨ **New Search Parameters Added**

### **1. Zipcode Filter**
- **Parameter**: `zipcode`
- **Type**: `string` (optional)
- **Description**: Filter donors by specific zipcode
- **Example**: `/requests/search/donors?zipcode=12345`
- **Behavior**: When specified, overrides distance-based search

### **2. Donor Name Search**
- **Parameter**: `donorName`
- **Type**: `string` (optional)
- **Description**: Search donors by name (case-insensitive partial match)
- **Example**: `/requests/search/donors?donorName=Sarah`
- **Behavior**: Partial string matching (e.g., "Sar" matches "Sarah Johnson")

## 🚀 **API Usage Examples**

### **Basic Search with New Parameters**
```bash
# Search by zipcode
GET /requests/search/donors?zipcode=12345

# Search by donor name
GET /requests/search/donors?donorName=Sarah

# Search by partial name
GET /requests/search/donors?donorName=John
```

### **Combined Filters**
```bash
# Zipcode + name + availability
GET /requests/search/donors?zipcode=12345&donorName=Sarah&isAvailable=true

# Zipcode + blood group
GET /requests/search/donors?zipcode=12345&bloodGroup=O+

# Name + medical record sharing
GET /requests/search/donors?donorName=Johnson&ableToShareMedicalRecord=true
```

### **Existing Parameters (Still Work)**
```bash
# Distance-based search (default behavior)
GET /requests/search/donors?maxDistance=50

# All existing filters
GET /requests/search/donors?maxDistance=15&isAvailable=true&bloodGroup=O+&ableToShareMedicalRecord=true
```

## 📋 **Complete Parameter List**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 10) |
| `maxDistance` | number | No | Maximum distance in km (default: 50) |
| `ableToShareMedicalRecord` | boolean | No | Filter by medical record sharing |
| `isAvailable` | boolean | No | Filter by availability status |
| `bloodGroup` | string | No | Filter by blood group |
| **`zipcode`** ⭐ | **string** | **No** | **Filter by donor zipcode** |
| **`donorName`** ⭐ | **string** | **No** | **Search by donor name** |

## 🔧 **Implementation Details**

### **Backend Changes Made**

1. **DTO Updates** (`src/requests/dto/request.dto.ts`):
   ```typescript
   @ApiPropertyOptional({ example: '12345', description: 'Filter by donor zipcode' })
   @IsOptional()
   @IsString()
   zipcode?: string;

   @ApiPropertyOptional({ example: 'Sarah Johnson', description: 'Search by donor name' })
   @IsOptional()
   @IsString()
   donorName?: string;
   ```

2. **Controller Updates** (`src/requests/controllers/request.controller.ts`):
   - Added Swagger documentation with `@ApiQuery` decorators
   - Both parameters properly documented in OpenAPI/Swagger

3. **Service Logic** (`src/requests/services/request.service.ts`):
   ```typescript
   // Zipcode filter (overrides distance search)
   if (filterOptions.zipcode) {
       whereClause.zipcode = filterOptions.zipcode;
   }

   // Name search (case-insensitive partial match)
   if (filterOptions.donorName) {
       whereClause.name = {
           contains: filterOptions.donorName,
           mode: 'insensitive'
       };
   }
   ```

### **Database Considerations**
- ✅ **No Migration Required**: Uses existing `name` and `zipcode` fields
- ✅ **Index Ready**: Existing indexes on user table support these queries
- ✅ **Performance**: Case-insensitive search optimized for PostgreSQL/MySQL

## 📱 **Swagger Documentation**

The new parameters are automatically documented in Swagger UI:

- **URL**: `http://localhost:3001/api`
- **Endpoint**: `GET /requests/search/donors`
- **New Parameters**: Visible in Swagger interface with examples and descriptions

## 🧪 **Testing**

### **Test Script**
Run the provided test script to verify functionality:
```bash
chmod +x test-donor-search.sh
./test-donor-search.sh
```

### **Manual Testing**
```bash
# Test zipcode filter
curl "http://localhost:3001/requests/search/donors?zipcode=12345"

# Test name search
curl "http://localhost:3001/requests/search/donors?donorName=Sarah"

# Test combined filters
curl "http://localhost:3001/requests/search/donors?zipcode=12345&donorName=Johnson&isAvailable=true"
```

## 🔄 **Backward Compatibility**

✅ **Fully Backward Compatible**:
- All existing API calls continue to work unchanged
- Default behavior (distance-based search) remains the same
- Existing filters (`maxDistance`, `bloodGroup`, etc.) work as before

## 🎯 **Search Logic Priority**

1. **If `zipcode` provided**: Search only in that zipcode (ignores `maxDistance`)
2. **If `donorName` provided**: Apply name filtering to results
3. **Default behavior**: Distance-based search within `maxDistance`
4. **All filters combine**: Use AND logic for multiple parameters

## 📊 **Example Response**

```json
{
  "data": [
    {
      "donor": {
        "id": 2,
        "name": "Sarah Johnson",
        "email": "sarah@example.com",
        "zipcode": "12345",
        "userType": "DONOR",
        "bloodGroup": "O+",
        "isAvailable": true
      },
      "distance": 0,
      "distanceText": "Same location",
      "hasAcceptedRequest": false,
      "location": {
        "zipcode": "12345",
        "placeName": "New York",
        "country": "USA",
        "latitude": 40.7505,
        "longitude": -73.9934,
        "fullAddress": "New York, USA"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

✅ **Enhancement Complete**: The donor search API now supports zipcode and donor name filtering with full Swagger documentation and backward compatibility!
