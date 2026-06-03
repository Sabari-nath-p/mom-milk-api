#!/usr/bin/env ts-node
/**
 * Standalone script to import zipcode data from Excel/CSV files into the database
 *
 * Usage:
 *   npm run import:zipcodes
 *   npm run import:zipcodes -- --file=path/to/file.xlsx
 *   npm run import:zipcodes -- --file=zipcodes.csv --no-clear
 *
 * Options:
 *   --file=<path>     Path to Excel (.xlsx) or CSV (.csv) file (relative to project root)
 *                     Default: looks for src/data/zipcodes.xlsx or src/data/zipcodes.csv
 *   --no-clear        Don't clear existing zipcode data before import
 *   --help            Show this help message
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

interface ZipCodeData {
  country: string;
  zipcode: string;
  placeName: string;
  latitude: number;
  longitude: number;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
  deleted?: number;
}

class ZipcodeImporter {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  /**
   * Clear all existing zipcode data
   */
  async clearAllZipCodes(): Promise<number> {
    console.log("🗑️  Clearing existing zipcode data...");
    const result = await this.prisma.zipCode.deleteMany({});
    console.log(`✅ Deleted ${result.count} existing records`);
    return result.count;
  }

  /**
   * Create or update a zipcode entry
   */
  async upsertZipCode(data: ZipCodeData): Promise<void> {
    await this.prisma.zipCode.upsert({
      where: { zipcode: data.zipcode },
      update: {
        placeName: data.placeName,
        latitude: data.latitude,
        longitude: data.longitude,
        country: data.country,
      },
      create: data,
    });
  }

  /**
   * Validate zipcode data
   */
  private validateZipCodeData(data: Partial<ZipCodeData>): data is ZipCodeData {
    if (!data.country || !data.zipcode || !data.placeName) {
      return false;
    }
    if (typeof data.latitude !== "number" || isNaN(data.latitude)) {
      return false;
    }
    if (typeof data.longitude !== "number" || isNaN(data.longitude)) {
      return false;
    }
    if (data.latitude < -90 || data.latitude > 90) {
      return false;
    }
    if (data.longitude < -180 || data.longitude > 180) {
      return false;
    }
    return true;
  }

  /**
   * Import from Excel file (.xlsx or .xls)
   */
  async importFromExcel(
    filePath: string,
    clearExisting: boolean = true,
  ): Promise<ImportResult> {
    console.log("📊 Processing Excel file:", filePath);

    let imported = 0;
    let skipped = 0;
    let errors = 0;
    let deleted = 0;

    if (clearExisting) {
      deleted = await this.clearAllZipCodes();
    }

    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Try to parse as objects with headers first
      const dataObjects = XLSX.utils.sheet_to_json(worksheet);
      console.log(`📋 Found ${dataObjects.length} rows (excluding header)`);

      if (dataObjects.length === 0) {
        console.warn("⚠️  No data found in Excel file");
        return { imported, skipped, errors, deleted };
      }

      // Check first row to determine format
      const firstRow = dataObjects[0] as any;
      const hasHeaders = "country" in firstRow && "zipcode" in firstRow;

      if (hasHeaders) {
        console.log(
          "✓ Detected format: Excel with named headers (country, zipcode, placeName, latitude, longitude)",
        );

        for (let i = 0; i < dataObjects.length; i++) {
          const row = dataObjects[i] as any;

          try {
            const data: Partial<ZipCodeData> = {
              country: row["country"]?.toString().trim(),
              zipcode: row["zipcode"]?.toString().trim(),
              placeName: row["placeName"]?.toString().trim(),
              latitude: parseFloat(row["latitude"]),
              longitude: parseFloat(row["longitude"]),
            };

            if (this.validateZipCodeData(data)) {
              try {
                await this.upsertZipCode(data);
                imported++;
                if (imported % 100 === 0) {
                  console.log(`  ⏳ Progress: ${imported} records imported...`);
                }
              } catch (error) {
                skipped++;
                if (skipped <= 5) {
                  console.log(`  ⚠️  Skipped duplicate: ${data.zipcode}`);
                }
              }
            } else {
              errors++;
              if (errors <= 5) {
                console.warn(`  ❌ Invalid data in row ${i + 2}:`, data);
              }
            }
          } catch (error) {
            errors++;
            if (errors <= 5) {
              console.error(
                `  ❌ Error processing row ${i + 2}:`,
                error.message,
              );
            }
          }
        }
      } else {
        // Fallback to array format
        console.log(
          "✓ Detected format: Excel with positional columns (A=country, B=zipcode, C=placeName, J=latitude, K=longitude)",
        );

        const dataArray = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];

        // Skip header row (index 0)
        for (let i = 1; i < dataArray.length; i++) {
          const row = dataArray[i];

          try {
            if (!row || row.length < 11) {
              errors++;
              continue;
            }

            const data: Partial<ZipCodeData> = {
              country: row[0]?.toString().trim(),
              zipcode: row[1]?.toString().trim(),
              placeName: row[2]?.toString().trim(),
              latitude: parseFloat(row[9]), // Column J
              longitude: parseFloat(row[10]), // Column K
            };

            if (this.validateZipCodeData(data)) {
              try {
                await this.upsertZipCode(data);
                imported++;
                if (imported % 100 === 0) {
                  console.log(`  ⏳ Progress: ${imported} records imported...`);
                }
              } catch (error) {
                skipped++;
                if (skipped <= 5) {
                  console.log(`  ⚠️  Skipped duplicate: ${data.zipcode}`);
                }
              }
            } else {
              errors++;
              if (errors <= 5) {
                console.warn(`  ❌ Invalid data in row ${i + 1}`);
              }
            }
          } catch (error) {
            errors++;
            if (errors <= 5) {
              console.error(
                `  ❌ Error processing row ${i + 1}:`,
                error.message,
              );
            }
          }
        }
      }

      return { imported, skipped, errors, deleted };
    } catch (error) {
      throw new Error(`Failed to process Excel file: ${error.message}`);
    }
  }

  /**
   * Import from CSV file
   */
  async importFromCSV(
    filePath: string,
    clearExisting: boolean = true,
  ): Promise<ImportResult> {
    console.log("📄 Processing CSV file:", filePath);

    let imported = 0;
    let skipped = 0;
    let errors = 0;
    let deleted = 0;

    if (clearExisting) {
      deleted = await this.clearAllZipCodes();
    }

    return new Promise((resolve, reject) => {
      const csv = require("csv-parser");
      const records: ZipCodeData[] = [];
      let isFirstRow = true;

      fs.createReadStream(filePath)
        .pipe(csv({ headers: false }))
        .on("data", (row: any) => {
          try {
            // Skip header row
            if (isFirstRow) {
              isFirstRow = false;
              return;
            }

            let data: Partial<ZipCodeData> = {};

            // Detect format based on row length
            if (row.length >= 10) {
              // Excel format: A=country(0), B=zipcode(1), C=placename(2), J=latitude(9), K=longitude(10)
              data = {
                country: row[0]?.trim(),
                zipcode: row[1]?.trim(),
                placeName: row[2]?.trim(),
                latitude: parseFloat(row[9]),
                longitude: parseFloat(row[10]),
              };
            } else if (row.length === 5) {
              // Simple CSV format: country,zipcode,placename,latitude,longitude
              data = {
                country: row[0]?.trim(),
                zipcode: row[1]?.trim(),
                placeName: row[2]?.trim(),
                latitude: parseFloat(row[3]),
                longitude: parseFloat(row[4]),
              };
            } else {
              errors++;
              return;
            }

            if (this.validateZipCodeData(data)) {
              records.push(data);
            } else {
              errors++;
            }
          } catch (error) {
            errors++;
          }
        })
        .on("end", async () => {
          try {
            console.log(`📋 Found ${records.length} valid rows`);

            // Batch insert zipcodes
            for (const data of records) {
              try {
                await this.upsertZipCode(data);
                imported++;
                if (imported % 100 === 0) {
                  console.log(`  ⏳ Progress: ${imported} records imported...`);
                }
              } catch (error) {
                skipped++;
              }
            }

            resolve({ imported, skipped, errors, deleted });
          } catch (error) {
            reject(error);
          }
        })
        .on("error", (error: Error) => {
          reject(error);
        });
    });
  }

  /**
   * Main import function - auto-detects file type
   */
  async import(
    filePath: string,
    clearExisting: boolean = true,
  ): Promise<ImportResult> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileExtension = path.extname(filePath).toLowerCase();

    if (fileExtension === ".xlsx" || fileExtension === ".xls") {
      return this.importFromExcel(filePath, clearExisting);
    } else if (fileExtension === ".csv") {
      return this.importFromCSV(filePath, clearExisting);
    } else {
      throw new Error(
        `Unsupported file format: ${fileExtension}. Please use .xlsx or .csv files.`,
      );
    }
  }

  /**
   * Get statistics about zipcode data in database
   */
  async getStats() {
    const total = await this.prisma.zipCode.count();
    const countries = await this.prisma.zipCode.groupBy({
      by: ["country"],
    });
    const lastRecord = await this.prisma.zipCode.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    return {
      total,
      countries: countries.length,
      lastImported: lastRecord?.createdAt,
    };
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  // Show help
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║          Zipcode Data Import Script                              ║
╚══════════════════════════════════════════════════════════════════╝

Usage:
  npm run import:zipcodes
  npm run import:zipcodes -- --file=path/to/file.xlsx
  npm run import:zipcodes -- --file=zipcodes.csv --no-clear

Options:
  --file=<path>     Path to Excel (.xlsx) or CSV (.csv) file
                    Default: looks for src/data/zipcodes.xlsx or src/data/zipcodes.csv
  --no-clear        Don't clear existing zipcode data before import
  --stats           Show current database statistics
  --help, -h        Show this help message

Supported Formats:
  1. Excel (.xlsx) with headers:
     country | zipcode | placeName | latitude | longitude

  2. Excel (.xlsx) with 11 columns:
     A=country, B=zipcode, C=placeName, J=latitude(col 10), K=longitude(col 11)

  3. CSV (.csv) with 5 columns:
     country,zipcode,placeName,latitude,longitude

Examples:
  # Import from default location (src/data/zipcodes.xlsx or zipcodes.csv)
  npm run import:zipcodes

  # Import specific file
  npm run import:zipcodes -- --file=data/us_zipcodes.xlsx

  # Import without clearing existing data
  npm run import:zipcodes -- --file=new_zipcodes.csv --no-clear

  # Show statistics
  npm run import:zipcodes -- --stats
        `);
    process.exit(0);
  }

  const importer = new ZipcodeImporter();

  try {
    // Show stats only
    if (args.includes("--stats")) {
      console.log("\n📊 Database Statistics:\n");
      const stats = await importer.getStats();
      console.log(`  Total zipcodes: ${stats.total}`);
      console.log(`  Countries: ${stats.countries}`);
      console.log(`  Last imported: ${stats.lastImported || "Never"}`);
      console.log("");
      await importer.disconnect();
      process.exit(0);
    }

    // Parse arguments
    let filePath = "";
    let clearExisting = true;

    for (const arg of args) {
      if (arg.startsWith("--file=")) {
        filePath = arg.split("=")[1];
      } else if (arg === "--no-clear") {
        clearExisting = false;
      }
    }

    // If no file specified, look for default files
    if (!filePath) {
      const excelPath = path.join(
        process.cwd(),
        "src",
        "data",
        "zipcodes.xlsx",
      );
      const csvPath = path.join(process.cwd(), "src", "data", "zipcodes.csv");

      if (fs.existsSync(excelPath)) {
        filePath = excelPath;
      } else if (fs.existsSync(csvPath)) {
        filePath = csvPath;
      } else {
        console.error("❌ No zipcode file found!");
        console.error(
          "   Please place zipcodes.xlsx or zipcodes.csv in src/data/ directory",
        );
        console.error("   Or specify a file path with --file=<path>");
        process.exit(1);
      }
    }

    // Convert relative path to absolute
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(process.cwd(), filePath);
    }

    console.log(
      "\n╔══════════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║          Starting Zipcode Import                                 ║",
    );
    console.log(
      "╚══════════════════════════════════════════════════════════════════╝\n",
    );
    console.log(`📁 File: ${filePath}`);
    console.log(`🗑️  Clear existing: ${clearExisting ? "Yes" : "No"}\n`);

    const startTime = Date.now();

    // Perform import
    const result = await importer.import(filePath, clearExisting);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(
      "\n╔══════════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║          Import Complete!                                        ║",
    );
    console.log(
      "╚══════════════════════════════════════════════════════════════════╝\n",
    );
    console.log(`✅ Imported:  ${result.imported} records`);
    console.log(`⚠️  Skipped:   ${result.skipped} duplicates`);
    console.log(`❌ Errors:    ${result.errors} invalid rows`);
    if (result.deleted !== undefined) {
      console.log(`🗑️  Deleted:   ${result.deleted} existing records`);
    }
    console.log(`⏱️  Duration:  ${duration}s\n`);

    // Show final statistics
    const stats = await importer.getStats();
    console.log("📊 Database Statistics:");
    console.log(`   Total zipcodes: ${stats.total}`);
    console.log(`   Countries: ${stats.countries}\n`);

    await importer.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Import failed:", error.message);
    console.error("\nFor help, run: npm run import:zipcodes -- --help\n");
    await importer.disconnect();
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { ZipcodeImporter };
