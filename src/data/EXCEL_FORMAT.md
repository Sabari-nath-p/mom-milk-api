# Excel Zipcode Import Format

## Supported File Formats

The system now supports both Excel (.xlsx) and CSV (.csv) formats for zipcode import.

### Excel File Format (.xlsx)

**Priority**: Excel files are processed first if available.

**Expected Filename**: `zipcodes.xlsx` (should be placed in `src/data/` directory)

**Column Mapping**:
- Column A (0): Country
- Column B (1): Zipcode 
- Column C (2): Place Name
- Column J (9): Latitude
- Column K (10): Longitude

**Example Structure**:
```
A        B       C           J         K
Country  Zipcode PlaceName   Latitude  Longitude
US       10001   New York    40.7505   -73.9934
US       10002   New York    40.7156   -73.9877
UK       SW1A    London      51.5014   -0.1419
```

### CSV File Format (.csv)

**Fallback**: Used when Excel file is not available.

**Expected Filename**: `zipcodes.csv`

**Formats Supported**:

1. **Simple Format** (5 columns):
   ```
   Country,Zipcode,PlaceName,Latitude,Longitude
   US,10001,New York,40.7505,-73.9934
   ```

2. **Excel-like Format** (10+ columns):
   - Country in column 0
   - Zipcode in column 1  
   - PlaceName in column 2
   - Latitude in column 9
   - Longitude in column 10

## Import Behavior

### **IMPORTANT: Data Replacement**
When the import runs, **ALL existing zipcode data is removed** from the database and replaced with the new data from the file.

### File Priority
1. **First Priority**: `src/data/zipcodes.xlsx`
2. **Second Priority**: `src/data/zipcodes.csv`
3. **Fallback**: `src/data/sample_zipcodes.csv`

### Auto-Import
The system automatically imports zipcode data on server startup if:
- No zipcode data exists in the database
- A zipcode file is found in the data directory

### Manual Import
Admins can trigger manual import via API:
```bash
POST /geolocation/zipcodes/import
```

**Warning**: Manual import will clear all existing data!

## Data Validation

The import process validates:
- ✅ Country name (required, non-empty string)
- ✅ Zipcode (required, non-empty string)
- ✅ Place name (required, non-empty string)
- ✅ Latitude (required, valid number between -90 and 90)
- ✅ Longitude (required, valid number between -180 and 180)

Invalid rows are skipped and logged as errors.

## Import Results

The import process returns:
```json
{
  "imported": 1500,
  "skipped": 25,
  "errors": 5,
  "deleted": 1200
}
```

- `imported`: Number of successfully imported records
- `skipped`: Number of duplicate records skipped
- `errors`: Number of invalid records that couldn't be processed
- `deleted`: Number of existing records that were removed (only for Excel imports)

## Best Practices

1. **Backup First**: Always backup your database before importing large datasets
2. **Test with Small Dataset**: Test your Excel format with a small sample first
3. **Validate Coordinates**: Ensure latitude/longitude values are accurate
4. **Unique Zipcodes**: Duplicate zipcodes will be skipped during import
5. **File Size**: Large files (>100MB) may take several minutes to process

## Troubleshooting

### Common Issues

1. **File Not Found**
   - Ensure file is named exactly `zipcodes.xlsx`
   - Check file is in `src/data/` directory

2. **Invalid Coordinates**
   - Latitude must be between -90 and 90
   - Longitude must be between -180 and 180
   - Use decimal degrees format (not DMS)

3. **Import Errors**
   - Check server logs for detailed error messages
   - Verify Excel file has data starting from row 2 (row 1 is header)

4. **Permission Issues**
   - Only admin users can trigger manual imports
   - Ensure proper authentication headers

### Example Error Response
```json
{
  "message": "Failed to process Excel file: Invalid coordinates in row 150",
  "statusCode": 400
}
```
