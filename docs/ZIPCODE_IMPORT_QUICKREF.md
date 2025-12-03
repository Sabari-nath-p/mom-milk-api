# Zipcode Import - Quick Reference

## 🚀 Quick Commands

```bash
# Import from default location (src/data/zipcodes.xlsx or zipcodes.csv)
npm run import:zipcodes

# Import specific file
npm run import:zipcodes -- --file=path/to/file.xlsx

# Import without clearing existing data
npm run import:zipcodes -- --file=file.csv --no-clear

# Show database statistics
npm run import:zipcodes -- --stats

# Show help
npm run import:zipcodes -- --help
```

## 📋 File Formats

### Option 1: Excel with Headers (.xlsx)
```
country | zipcode | placeName    | latitude | longitude
US      | 10001   | New York     | 40.7505  | -73.9934
```

### Option 2: Excel Positional (.xlsx)
```
A=country | B=zipcode | C=place | ... | J=latitude(col 10) | K=longitude(col 11)
```

### Option 3: CSV (.csv)
```csv
country,zipcode,placeName,latitude,longitude
US,10001,New York,40.7505,-73.9934
```

## ✅ Validation Rules

- **Country**: Required, non-empty string
- **Zipcode**: Required, non-empty string (unique)
- **PlaceName**: Required, non-empty string
- **Latitude**: Required, -90 to 90
- **Longitude**: Required, -180 to 180

## 🎯 Common Use Cases

| Task | Command |
|------|---------|
| Initial import | `npm run import:zipcodes -- --file=zipcodes.xlsx` |
| Add new zipcodes | `npm run import:zipcodes -- --file=new.csv --no-clear` |
| Replace all data | `npm run import:zipcodes -- --file=updated.xlsx` |
| Check current data | `npm run import:zipcodes -- --stats` |

## 🔧 Troubleshooting

| Error | Fix |
|-------|-----|
| "No zipcode file found" | Place file in `src/data/` or use `--file=path` |
| "File not found" | Check path, use absolute path |
| High errors | Verify column names/positions match format |
| Database error | Check `.env` DATABASE_URL, ensure DB is running |

## 📊 Result Metrics

- **Imported**: ✅ Successfully added
- **Skipped**: ⚠️  Duplicate zipcodes
- **Errors**: ❌ Invalid data
- **Deleted**: 🗑️  Previous records removed

## 🔗 More Info

Full documentation: `docs/ZIPCODE_IMPORT_GUIDE.md`
