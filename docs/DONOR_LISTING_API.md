# Enhanced Donor Listing API Response

## API Endpoint: `/requests/search/donors`

### **✅ CONFIRMED: Current Implementation Status**

**1. Distance Calculation:** ✅ IMPLEMENTED
- Uses Haversine formula for accurate distance calculations
- Sorts donors from shortest to longest distance
- Includes distance in kilometers in response

**2. CSV Format:** ✅ MATCHES YOUR REQUIREMENTS
Your sample format:
```csv
zipcode,city,state,country,latitude,longitude
```
This exactly matches our implementation!

### **Enhanced Response Format:**

```json
{
  "data": [
    {
      "donor": {
        "id": 2,
        "name": "Jane Smith",
        "email": "donor@example.com",
        "zipcode": "10002",
        "userType": "DONOR",
        "description": "Experienced mother with healthy lifestyle",
        "bloodGroup": "O+",
        "babyDeliveryDate": "2023-12-15T00:00:00.000Z",
        "ableToShareMedicalRecord": true,
        "isAvailable": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "distance": 0.4,
      "distanceText": "400m away",
      "hasAcceptedRequest": false,
      "location": {
        "zipcode": "10002",
        "placeName": "New York",
        "state": "NY",
        "country": "USA",
        "latitude": 40.7158,
        "longitude": -73.9861,
        "fullAddress": "New York, NY, USA"
      }
    },
    {
      "donor": {
        "id": 3,
        "name": "Mary Johnson",
        "email": "mary@example.com",
        "zipcode": "10003",
        "userType": "DONOR",
        "bloodGroup": "A+",
        "isAvailable": true,
        "createdAt": "2024-01-02T00:00:00.000Z"
      },
      "distance": 1.2,
      "distanceText": "1.2 km away",
      "hasAcceptedRequest": false,
      "location": {
        "zipcode": "10003",
        "placeName": "New York", 
        "state": "NY",
        "country": "USA",
        "latitude": 40.7316,
        "longitude": -73.9893,
        "fullAddress": "New York, NY, USA"
      }
    },
    {
      "donor": {
        "id": 4,
        "name": "Sarah Wilson",
        "email": "sarah@example.com",
        "zipcode": "90210",
        "userType": "DONOR",
        "bloodGroup": "B+",
        "isAvailable": true,
        "createdAt": "2024-01-03T00:00:00.000Z"
      },
      "distance": 3944.4,
      "distanceText": "3944.4 km away",
      "hasAcceptedRequest": false,
      "location": {
        "zipcode": "90210",
        "placeName": "Beverly Hills",
        "state": "CA", 
        "country": "USA",
        "latitude": 34.0901,
        "longitude": -118.4065,
        "fullAddress": "Beverly Hills, CA, USA"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 3,
    "itemsPerPage": 20,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### **Key Features Implemented:**

✅ **Distance-Based Sorting**: Donors automatically sorted shortest to longest distance  
✅ **Distance in Response**: Both numeric (km) and human-readable format  
✅ **Complete Location Data**: Zipcode, city, state, country, coordinates  
✅ **CSV Import Support**: Your exact CSV format is supported  
✅ **Automatic Import**: Server imports zipcode data on startup  

### **Distance Calculations:**

- **Haversine Formula**: Accurate great-circle distance calculations
- **Distance Units**: Kilometers with decimal precision
- **Distance Text**: Human-friendly format (meters for <1km, km for ≥1km)
- **Sorting**: Always shortest distance first

### **CSV Data Integration:**

Your sample file format is perfect:
```csv
zipcode,city,state,country,latitude,longitude
10001,New York,NY,USA,40.7505,-73.9934
90210,Beverly Hills,CA,USA,34.0901,-118.4065
SW1A 1AA,London,,UK,51.5014,-0.1419
```

**Supported Features:**
- Worldwide zipcodes
- Optional state field (empty for some countries)
- Mixed zipcode formats (numeric, alphanumeric)
- Automatic import on server startup

### **API Usage Examples:**

```bash
# Search for nearby donors (default 50km radius)
GET /requests/search/donors

# Search within 10km with pagination
GET /requests/search/donors?maxDistance=10&page=1&limit=10

# Filter available donors only
GET /requests/search/donors?isAvailable=true&maxDistance=15

# Filter by blood group
GET /requests/search/donors?bloodGroup=O+&maxDistance=20
```

## 🎯 **CONFIRMATION:**

✅ **Distance is included** in donor listings and sorted shortest to longest  
✅ **CSV format matches** your requirements exactly  
✅ **Implementation is complete** and ready to use  

The system is already working as requested - buyers can search for donors with accurate distance calculations using worldwide zipcode data!
