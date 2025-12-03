# Excel Template for Zipcode Import

## Template Structure

Create an Excel file (.xlsx) with the following structure:

### Format 1: Simple Format (Recommended)

Create 5 columns with these exact headers:

| country | zipcode | placeName | latitude | longitude |
|---------|---------|-----------|----------|-----------|
| US | 10001 | New York | 40.7505 | -73.9934 |
| US | 90210 | Beverly Hills | 34.0901 | -118.4065 |
| UK | SW1A 1AA | London | 51.5014 | -0.1419 |
| CA | M5V 2T6 | Toronto | 43.6532 | -79.3832 |

**Column Requirements:**
- **country**: Country code or name (e.g., "US", "UK", "Canada")
- **zipcode**: Postal/ZIP code - must be unique (e.g., "10001", "SW1A 1AA")
- **placeName**: City or place name (e.g., "New York", "London")
- **latitude**: Decimal latitude between -90 and 90
- **longitude**: Decimal longitude between -180 and 180

### Format 2: Government Data Format (11 columns)

If you have data with additional columns (like from government databases):

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| country | zipcode | placeName | state | stateCode | county | countyCode | community | communityCode | latitude | longitude |
| US | 10001 | New York | New York | NY | New York | 061 | Manhattan | 000 | 40.7505 | -73.9934 |

**Only columns A, B, C, J, and K are used** (others are ignored)

## How to Create Template

### Using Microsoft Excel

1. Open Microsoft Excel
2. Create a new workbook
3. In the first row, add headers:
   - A1: `country`
   - B1: `zipcode`
   - C1: `placeName`
   - D1: `latitude`
   - E1: `longitude`
4. Add your data starting from row 2
5. Save as `zipcodes.xlsx`

### Using Google Sheets

1. Open Google Sheets
2. Create columns with headers as above
3. Add your data
4. Download as: File → Download → Microsoft Excel (.xlsx)
5. Name it `zipcodes.xlsx`

### Using LibreOffice Calc

1. Open LibreOffice Calc
2. Create columns with headers as above
3. Add your data
4. Save as: File → Save As → Excel 2007-365 (.xlsx)
5. Name it `zipcodes.xlsx`

## Data Validation Rules

### Required Fields
- All 5 columns must have values
- No empty cells in data rows
- First row must be headers

### Data Types
- **country**: Text (any length)
- **zipcode**: Text (any format, but must be unique)
- **placeName**: Text (any length)
- **latitude**: Number with decimals
- **longitude**: Number with decimals

### Coordinate Ranges
- **Latitude**: -90.0 to 90.0
  - North: positive (0 to 90)
  - South: negative (-90 to 0)
- **Longitude**: -180.0 to 180.0
  - East: positive (0 to 180)
  - West: negative (-180 to 0)

### Common Coordinate Examples
```
New York, USA:     40.7505, -73.9934
London, UK:        51.5014, -0.1419
Tokyo, Japan:      35.6762, 139.6503
Sydney, Australia: -33.8688, 151.2093
Mumbai, India:     19.0760, 72.8777
```

## Example Templates

### Small Dataset (10-100 records)
Good for testing and small regions:
```
country,zipcode,placeName,latitude,longitude
US,10001,New York,40.7505,-73.9934
US,10002,New York,40.7156,-73.9877
US,10003,New York,40.7310,-73.9896
```

### Large Dataset (1000+ records)
For comprehensive coverage:
- Use Format 1 (Simple)
- Ensure all data is validated
- Test with small subset first
- Import in batches if needed

## Tips for Best Results

### Data Quality
1. ✅ Remove duplicate zipcodes before import
2. ✅ Verify coordinates are accurate (use online validators)
3. ✅ Use consistent country naming (e.g., "US" or "United States", not both)
4. ✅ Check for typos in place names
5. ✅ Ensure numbers are formatted as numbers, not text

### Performance
1. ✅ Sort data by country then zipcode
2. ✅ Remove unnecessary columns
3. ✅ Test with 10-20 rows first
4. ✅ For very large files (>50k rows), consider splitting

### Common Mistakes to Avoid
1. ❌ Merged cells in Excel
2. ❌ Extra header rows
3. ❌ Hidden columns with data
4. ❌ Formulas instead of values
5. ❌ Wrong column order
6. ❌ Mixed number formats (e.g., 40.7505 and "40.7505")
7. ❌ Coordinates in DMS format (use decimal degrees)

## Converting Other Formats

### From CSV to Excel
1. Open Excel
2. File → Open → Select your CSV file
3. Follow import wizard
4. Save as Excel (.xlsx)

### From Text to Excel
1. Copy text data
2. Paste into Excel
3. Use "Text to Columns" feature
4. Save as Excel (.xlsx)

### From Database Export
Most databases export to CSV:
1. Export your data as CSV
2. Open in Excel
3. Verify columns match template
4. Save as Excel (.xlsx)

## Sample Data Sources

### Free Data Sources
1. **GeoNames.org**: Free worldwide postal code data
2. **OpenAddresses**: Open source address data
3. **Government Websites**: USPS (US), Royal Mail (UK), etc.

### Data Format Conversion
If your source has different column names, map them:
- country_code → country
- postal_code → zipcode
- city_name → placeName
- lat → latitude
- lng/lon → longitude

## Testing Your Template

Before importing large datasets:

1. **Create Test File**
   ```
   country,zipcode,placeName,latitude,longitude
   US,99999,Test City,40.7505,-73.9934
   ```

2. **Run Import**
   ```bash
   npm run import:zipcodes -- --file=test.xlsx
   ```

3. **Verify Results**
   ```bash
   npm run import:zipcodes -- --stats
   ```

4. **Check Data**
   ```bash
   curl http://localhost:3003/geolocation/zipcodes/99999
   ```

## Need Help?

- 📚 Full Guide: `docs/ZIPCODE_IMPORT_GUIDE.md`
- 📋 Quick Reference: `docs/ZIPCODE_IMPORT_QUICKREF.md`
- 🔧 Format Specs: `src/data/EXCEL_FORMAT.md`
- 🧪 Generate Sample: `npm run generate:sample-zipcodes`
