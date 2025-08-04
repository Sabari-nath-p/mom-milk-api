# Zipcode Data Import

This directory contains CSV files for importing worldwide zipcode data with geographic coordinates.

## CSV File Format

The CSV files should follow this exact format with headers:

```csv
country,zipcode,placename,latitude,longitude
```

### Column Descriptions:

- **country**: Country name (string, required)
- **zipcode**: The postal/zip code (string, required)
- **placename**: City/place name (string, required)
- **latitude**: Latitude coordinate (decimal, required, between -90 and 90)
- **longitude**: Longitude coordinate (decimal, required, between -180 and 180)

### Example Data:

```csv
country,zipcode,placename,latitude,longitude
USA,10001,New York,40.7505,-73.9934
USA,90210,Beverly Hills,34.0901,-118.4065
UK,SW1A 1AA,London,51.5014,-0.1419
France,75001,Paris,48.8566,2.3522
India,110001,New Delhi,28.6139,77.2090
```

**Note:** This format does NOT include a separate state/province column. All location information is captured in the placename field.

## File Naming Convention

- Name your CSV files with "zipcode" in the filename (e.g., `worldwide_zipcodes.csv`, `zipcode_data.csv`)
- The system will automatically detect and import these files on startup

## Automatic Import

The system automatically imports zipcode data when the server starts:

1. **On startup**, the system checks if zipcode data already exists
2. If no data exists, it looks for CSV files in this directory
3. It imports the first CSV file found with "zipcode" in the filename
4. If no custom files are found, it uses the provided `sample_zipcodes.csv`

## Data Sources

You can obtain worldwide zipcode data from various sources:

### Free Sources:
- **GeoNames**: http://www.geonames.org/export/zip/
- **OpenAddresses**: https://openaddresses.io/
- **Natural Earth**: https://www.naturalearthdata.com/

### Commercial Sources:
- **MaxMind**: https://www.maxmind.com/
- **SmartyStreets**: https://www.smartystreets.com/
- **PostcodeData**: https://www.postcodedata.co.uk/

## Data Quality Notes

- Ensure latitude and longitude are in decimal degrees format
- Remove or clean any rows with missing coordinates
- Use consistent country naming (ISO codes recommended)
- Handle special characters in city/state names properly

## API Endpoints

Once imported, the zipcode data can be managed through these API endpoints:

### Admin Endpoints (Admin role required):
- `POST /geolocation/zipcodes/import` - Import from uploaded CSV
- `GET /geolocation/zipcodes` - List all zipcodes (paginated)
- `POST /geolocation/zipcodes` - Add single zipcode
- `PUT /geolocation/zipcodes/:id` - Update zipcode
- `DELETE /geolocation/zipcodes/:id` - Delete zipcode

### Public Endpoints:
- `GET /geolocation/nearby` - Find nearby zipcodes
- `GET /geolocation/distance` - Calculate distance between zipcodes

## Performance Considerations

- Large datasets (100k+ records) may take several minutes to import
- Consider splitting very large files into smaller chunks
- Database indexing is automatically applied to zipcode, latitude, and longitude fields
- Import process skips duplicates based on zipcode uniqueness

## Troubleshooting

### Common Issues:

1. **Import fails**: Check CSV format matches exactly
2. **Missing coordinates**: Ensure latitude/longitude are valid decimal numbers
3. **Duplicate errors**: System will skip duplicates, this is normal
4. **Large file timeouts**: Split large files or increase server timeout settings

### Logs:

Check server logs for import progress and any error messages during startup.
