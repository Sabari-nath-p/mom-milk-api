import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";

function generateSampleZipCodesXLSX() {
  // Create sample data
  const sampleData = [
    // Header row
    [
      "country",
      "zipcode",
      "placeName",
      "state",
      "stateCode",
      "county",
      "countyCode",
      "community",
      "communityCode",
      "latitude",
      "longitude",
    ],

    // Sample rows - 11 column format
    [
      "US",
      "10001",
      "New York",
      "New York",
      "NY",
      "New York",
      "061",
      "Manhattan",
      "000",
      40.7128,
      -74.006,
    ],
    [
      "US",
      "90210",
      "Beverly Hills",
      "California",
      "CA",
      "Los Angeles",
      "037",
      "Beverly Hills",
      "000",
      34.0901,
      -118.4065,
    ],
    [
      "US",
      "33109",
      "Miami Beach",
      "Florida",
      "FL",
      "Miami-Dade",
      "086",
      "Miami Beach",
      "000",
      25.7617,
      -80.1918,
    ],
    [
      "US",
      "60601",
      "Chicago",
      "Illinois",
      "IL",
      "Cook",
      "031",
      "Chicago",
      "000",
      41.8781,
      -87.6298,
    ],
    [
      "US",
      "94102",
      "San Francisco",
      "California",
      "CA",
      "San Francisco",
      "075",
      "San Francisco",
      "000",
      37.7749,
      -122.4194,
    ],
    [
      "US",
      "02108",
      "Boston",
      "Massachusetts",
      "MA",
      "Suffolk",
      "025",
      "Boston",
      "000",
      42.3601,
      -71.0589,
    ],
    [
      "US",
      "98101",
      "Seattle",
      "Washington",
      "WA",
      "King",
      "033",
      "Seattle",
      "000",
      47.6062,
      -122.3321,
    ],
    [
      "US",
      "75201",
      "Dallas",
      "Texas",
      "TX",
      "Dallas",
      "113",
      "Dallas",
      "000",
      32.7767,
      -96.797,
    ],
    [
      "US",
      "30301",
      "Atlanta",
      "Georgia",
      "GA",
      "Fulton",
      "121",
      "Atlanta",
      "000",
      33.749,
      -84.388,
    ],
    [
      "US",
      "85001",
      "Phoenix",
      "Arizona",
      "AZ",
      "Maricopa",
      "013",
      "Phoenix",
      "000",
      33.4484,
      -112.074,
    ],
  ];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(sampleData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "ZipCodes");

  // Ensure directory exists
  const dataDir = path.join(process.cwd(), "src", "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write file
  const filePath = path.join(dataDir, "zipcodes.xlsx");
  XLSX.writeFile(workbook, filePath);

  console.log("✅ Sample zipcodes.xlsx file generated successfully!");
  console.log("📁 File path:", filePath);
  console.log("📊 Sample data includes:", sampleData.length - 1, "zip codes");

  // Also create a simple 5-column version
  const simpleData = [
    ["country", "zipcode", "placeName", "latitude", "longitude"],
    ["US", "10001", "New York", 40.7128, -74.006],
    ["US", "90210", "Beverly Hills", 34.0901, -118.4065],
    ["US", "33109", "Miami Beach", 25.7617, -80.1918],
    ["CA", "M5V 2T6", "Toronto", 43.6532, -79.3832],
    ["GB", "SW1A 1AA", "London", 51.5074, -0.1278],
  ];

  const simpleWorkbook = XLSX.utils.book_new();
  const simpleWorksheet = XLSX.utils.aoa_to_sheet(simpleData);
  XLSX.utils.book_append_sheet(simpleWorkbook, simpleWorksheet, "ZipCodes");

  const simpleFilePath = path.join(dataDir, "zipcodes-simple.xlsx");
  XLSX.writeFile(simpleWorkbook, simpleFilePath);

  console.log("✅ Simple zipcodes-simple.xlsx file also generated!");
}

// Run the generator
generateSampleZipCodesXLSX();
