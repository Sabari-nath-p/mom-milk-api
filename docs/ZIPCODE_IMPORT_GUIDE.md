# Zipcode Import Guide

Complete guide for importing zipcode data into your database using the command-line script.

## Table of Contents
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Supported File Formats](#supported-file-formats)
- [Usage Examples](#usage-examples)
- [Command Options](#command-options)
- [File Format Requirements](#file-format-requirements)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Quick Start

### Basic Import (Default Location)
Place your zipcode file in `src/data/` directory as `zipcodes.xlsx` or `zipcodes.csv`, then run:

```bash
npm run import:zipcodes
```

This will:
1. Clear all existing zipcode data
2. Import data from the file
3. Show import statistics

## Prerequisites

- Node.js installed
- Database configured and accessible (check `.env` file)
- Excel or CSV file with zipcode data
- Required npm packages installed (`npm install`)

## Supported File Formats

### 1. Excel with Named Headers (.xlsx)

**Best for**: Clean, well-structured data with clear column names

**Format**:
```
| country | zipcode | placeName      | latitude | longitude  |
|---------|---------|----------------|----------|------------|
| US      | 10001   | New York       | 40.7505  | -73.9934   |
| US      | 90210   | Beverly Hills  | 34.0901  | -118.4065  |
```

**Column Names** (case-sensitive):
- `country` - Country code or name
- `zipcode` - Postal/ZIP code
- `placeName` - City or place name
- `latitude` - Latitude coordinate (-90 to 90)
- `longitude` - Longitude coordinate (-180 to 180)

### 2. Excel with Positional Columns (.xlsx)

**Best for**: Large datasets with extra columns (like government data)

**Format**: 11+ columns where:
- Column A (0): Country
- Column B (1): Zipcode
- Column C (2): Place Name
- Column J (9): Latitude
- Column K (10): Longitude

**Example**:
```
| A   | B     | C          | D     | E    | F      | G    | H         | I    | J       | K         |
|-----|-------|------------|-------|------|--------|------|-----------|------|---------|-----------|
| US  | 10001 | New York   | NY    | New  | 061    | Man  | 000       | ... | 40.7505 | -73.9934  |
```

### 3. CSV Format (.csv)

**Best for**: Simple, lightweight data

**5-column format**:
```csv
country,zipcode,placeName,latitude,longitude
US,10001,New York,40.7505,-73.9934
US,90210,Beverly Hills,34.0901,-118.4065
```

**10+ column format** (same as Excel positional):
```csv
US,10001,New York,NY,New York,061,Manhattan,000,Other,40.7505,-73.9934
```

## Usage Examples

### Example 1: Import from Default Location
```bash
npm run import:zipcodes
```
Looks for `src/data/zipcodes.xlsx` or `src/data/zipcodes.csv`

### Example 2: Import Specific File
```bash
npm run import:zipcodes -- --file=data/us_zipcodes.xlsx
```

### Example 3: Import Without Clearing Existing Data
```bash
npm run import:zipcodes -- --file=new_zipcodes.csv --no-clear
```
Useful for adding new zipcodes without deleting existing ones

### Example 4: Import from Absolute Path
```bash
npm run import:zipcodes -- --file="C:\Users\Admin\Downloads\zipcodes.xlsx"
```

### Example 5: Check Database Statistics
```bash
npm run import:zipcodes -- --stats
```

### Example 6: Show Help
```bash
npm run import:zipcodes -- --help
```

## Command Options

| Option | Description | Default |
|--------|-------------|---------|
| `--file=<path>` | Path to Excel or CSV file | `src/data/zipcodes.xlsx` or `src/data/zipcodes.csv` |
| `--no-clear` | Keep existing data (don't delete) | Clear all data |
| `--stats` | Show current database statistics | - |
| `--help` or `-h` | Display help message | - |

## File Format Requirements

### Required Data

Each row must have:
1. **Country**: Non-empty string (e.g., "US", "UK", "India")
2. **Zipcode**: Non-empty string (e.g., "10001", "SW1A 1AA")
3. **Place Name**: Non-empty string (e.g., "New York", "London")
4. **Latitude**: Valid number between -90 and 90
5. **Longitude**: Valid number between -180 and 180

### Data Validation

The script validates:
- ✅ All required fields are present
- ✅ Latitude/longitude are valid numbers
- ✅ Coordinates are within valid ranges
- ✅ No empty or whitespace-only values

Invalid rows are:
- Counted as errors
- Logged (first 5 errors shown)
- Skipped (import continues)

### Duplicate Handling

- Duplicate zipcodes (same zipcode value) are **skipped**
- Original data is preserved
- Counted in "skipped" statistics

## Understanding Import Results

After import completes, you'll see:

```
╔══════════════════════════════════════════════════════════════════╗
║          Import Complete!                                        ║
╚══════════════════════════════════════════════════════════════════╝

✅ Imported:  1500 records
⚠️  Skipped:   25 duplicates
❌ Errors:    5 invalid rows
🗑️  Deleted:   1200 existing records
⏱️  Duration:  12.34s

📊 Database Statistics:
   Total zipcodes: 1500
   Countries: 3
```

**Metrics Explained**:
- **Imported**: Successfully added to database
- **Skipped**: Duplicate zipcodes (already exist)
- **Errors**: Invalid data (missing fields, bad coordinates)
- **Deleted**: Previous records removed (if `--no-clear` not used)
- **Duration**: Total processing time

## Troubleshooting

### Problem: "No zipcode file found"

**Solution**: 
- Place file in `src/data/` directory
- Name it `zipcodes.xlsx` or `zipcodes.csv`
- Or use `--file=path` to specify location

### Problem: "File not found: [path]"

**Solutions**:
- Check file path is correct
- Use absolute path if relative path doesn't work
- Check file permissions
- Ensure file extension is `.xlsx` or `.csv`

### Problem: High number of errors

**Solutions**:
1. Check column mapping:
   - For Excel with headers: columns must be named exactly `country`, `zipcode`, `placeName`, `latitude`, `longitude`
   - For positional format: ensure lat/lng are in columns J(9) and K(10)

2. Validate data:
   - Latitude: -90 to 90
   - Longitude: -180 to 180
   - No empty values

3. Check file format:
   - Open in Excel and verify structure
   - Ensure no merged cells
   - First row should be headers

### Problem: "Failed to process Excel file"

**Solutions**:
- File may be corrupted - try re-downloading
- Check if file is password-protected
- Try saving as `.csv` instead
- Ensure file is not open in Excel while importing

### Problem: Database connection error

**Solutions**:
- Check `.env` file has correct `DATABASE_URL`
- Ensure database server is running
- Verify database credentials
- Check network connectivity

### Problem: Import is very slow

**Solutions**:
- Large files (>10,000 rows) take time
- Progress is shown every 100 records
- Consider splitting into smaller files
- Ensure database server has good performance

## Best Practices

### Before Import

1. **Backup Database**
   ```bash
   npm run backup:create
   ```

2. **Test with Small File**
   - Create sample file with 10-20 rows
   - Run import to verify format
   - Check results before importing full dataset

3. **Validate Data**
   - Check for duplicate zipcodes in your file
   - Verify coordinates are accurate
   - Ensure all required fields have values

### During Import

1. **Monitor Progress**
   - Script shows progress every 100 records
   - Watch for error messages
   - Note any warnings

2. **Don't Interrupt**
   - Let import complete
   - Interrupting may leave incomplete data
   - Database transactions ensure consistency

### After Import

1. **Verify Results**
   ```bash
   npm run import:zipcodes -- --stats
   ```

2. **Test API Endpoints**
   ```bash
   # Get zipcode
   curl http://localhost:3003/geolocation/zipcodes/10001
   
   # Search zipcodes
   curl http://localhost:3003/geolocation/zipcodes/search?q=New+York
   ```

3. **Check Sample Data**
   - Query few random zipcodes
   - Verify coordinates are correct
   - Test nearby zipcode search

## Advanced Usage

### Automated/Scheduled Imports

Create a shell script for automated imports:

**Windows (PowerShell)**:
```powershell
# import-daily.ps1
cd "D:\Parasya\Moms Milk\mom-milk-api"
npm run import:zipcodes -- --file=data/daily_update.xlsx --no-clear
```

**Linux/Mac (Bash)**:
```bash
#!/bin/bash
# import-daily.sh
cd /path/to/mom-milk-api
npm run import:zipcodes -- --file=data/daily_update.xlsx --no-clear
```

Then schedule with Task Scheduler (Windows) or cron (Linux/Mac).

### Batch Processing Multiple Files

```bash
# Import multiple country files
npm run import:zipcodes -- --file=data/us_zipcodes.xlsx
npm run import:zipcodes -- --file=data/uk_zipcodes.xlsx --no-clear
npm run import:zipcodes -- --file=data/ca_zipcodes.xlsx --no-clear
```

### Integration with Other Systems

The script can be called from other Node.js code:

```typescript
import { ZipcodeImporter } from './src/scripts/import-zipcodes';

async function importZipcodes() {
    const importer = new ZipcodeImporter();
    
    try {
        const result = await importer.import('path/to/file.xlsx', true);
        console.log('Import completed:', result);
    } finally {
        await importer.disconnect();
    }
}
```

## Data Sources

### Where to Get Zipcode Data

1. **Government Sources**:
   - USPS (United States)
   - Royal Mail (UK)
   - Canada Post (Canada)

2. **Commercial Providers**:
   - GeoNames.org
   - simplemaps.com
   - data.world

3. **Open Data**:
   - OpenAddresses
   - Natural Earth Data

### Sample Data Format

Need test data? Generate sample file:
```bash
npm run generate:sample-zipcodes
```

This creates `src/data/zipcodes.xlsx` with 10 sample US zipcodes.

## Performance Guidelines

| File Size | Rows | Expected Time | Memory Usage |
|-----------|------|---------------|--------------|
| Small | < 1,000 | < 10 seconds | < 50 MB |
| Medium | 1,000 - 10,000 | 10-60 seconds | 50-200 MB |
| Large | 10,000 - 100,000 | 1-10 minutes | 200-500 MB |
| Very Large | > 100,000 | 10+ minutes | > 500 MB |

## Security Considerations

1. **File Access**: Only administrators should have access to import scripts
2. **Data Validation**: Script validates all data before import
3. **Database Access**: Requires valid database credentials
4. **Backup**: Always backup before importing large datasets
5. **Audit Trail**: Import results are logged

## Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review server logs for detailed errors
3. Verify your data format matches requirements
4. Test with sample data first

## Related Documentation

- [Excel Format Specification](./EXCEL_FORMAT.md)
- [Geolocation API Documentation](./GEOLOCATION_API.md)
- [Database Schema](../prisma/schema.prisma)
