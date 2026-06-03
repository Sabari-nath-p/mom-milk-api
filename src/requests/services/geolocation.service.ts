import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateZipCodeDto, UpdateZipCodeDto } from "../dto/request.dto";
import * as fs from "fs";
import * as path from "path";
import csv = require("csv-parser");
import * as XLSX from "xlsx";
import { Client, AddressType } from "@googlemaps/google-maps-services-js";
import { ConfigService } from "@nestjs/config";

export interface ZipCodeData {
  country: string;
  zipcode: string;
  placeName: string;
  latitude: number;
  longitude: number;
}

@Injectable()
export class GeolocationService {
  private googleMapsClient: Client;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.googleMapsClient = new Client({});
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param lat1 Latitude of first point
   * @param lon1 Longitude of first point
   * @param lat2 Latitude of second point
   * @param lon2 Longitude of second point
   * @returns Distance in kilometers
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get coordinates for a zipcode
   * Fallback to Google Geocoding API if not found in DB
   */
  async getZipCodeCoordinates(
    zipcode: string,
    options?: {
      allowExternalLookup?: boolean;
    },
  ): Promise<{
    latitude: number;
    longitude: number;
    placeName: string;
    country: string;
  } | null> {
    const allowExternalLookup = options?.allowExternalLookup ?? true;

    // 1. Try to find in database
    const zipCodeData = await this.prisma.zipCode.findUnique({
      where: { zipcode },
      select: {
        latitude: true,
        longitude: true,
        placeName: true,
        country: true,
      },
    });

    if (zipCodeData) {
      return zipCodeData;
    }

    if (!allowExternalLookup) {
      return null;
    }

    // 2. If not found, try Google Geocoding API
    console.log(
      `Zipcode ${zipcode} not found in DB, trying Google Geocoding API...`,
    );
    return this.fetchFromGoogleGeocoding(zipcode);
  }

  /**
   * Fetch zipcode details from Google Geocoding API and save to database
   */
  private async fetchFromGoogleGeocoding(zipcode: string): Promise<{
    latitude: number;
    longitude: number;
    placeName: string;
    country: string;
  } | null> {
    const apiKey = this.configService.get<string>("GOOGLE_GEOCODING_API_KEY");

    if (
      !apiKey ||
      apiKey === "your-google-api-key-here" ||
      apiKey === "YOUR_API_KEY_HERE"
    ) {
      console.warn("Google Geocoding API key is missing or not configured");
      return null;
    }

    try {
      const response = await this.googleMapsClient.geocode({
        params: {
          address: zipcode,
          key: apiKey,
        },
      });

      if (response.data.results.length > 0) {
        const result = response.data.results[0];
        const location = result.geometry.location;

        // Extract country and place name
        let country = "Unknown";
        let placeName = formattedAddressToPlaceName(result.formatted_address);

        for (const component of result.address_components) {
          if (component.types.includes(AddressType.country)) {
            country = component.long_name;
          }
        }

        const zipCodeData = {
          zipcode: zipcode,
          latitude: location.lat,
          longitude: location.lng,
          country: country,
          placeName: placeName,
        };

        // Save to database for future use
        try {
          await this.createZipCode(zipCodeData);
          console.log(
            `Successfully fetched and saved zipcode ${zipcode} from Google API`,
          );
        } catch (dbError) {
          const dbMessage =
            dbError instanceof Error ? dbError.message : String(dbError);
          console.warn(
            `Failed to save fetched zipcode ${zipcode} to DB:`,
            dbMessage,
          );
          // Continue even if save fails, return the data
        }

        return {
          latitude: zipCodeData.latitude,
          longitude: zipCodeData.longitude,
          placeName: zipCodeData.placeName,
          country: zipCodeData.country,
        };
      }

      console.warn(`No results found for zipcode ${zipcode} from Google API`);
      return null;
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      console.error("Error fetching from Google Geocoding API:", errMessage);
      return null;
    }
  }

  /**
   * Find nearby zipcodes within a certain radius
   */
  async findNearbyZipCodes(
    centerZipcode: string,
    radiusKm: number,
  ): Promise<ZipCodeData[]> {
    const centerCoords = await this.getZipCodeCoordinates(centerZipcode);
    if (!centerCoords) {
      return [];
    }

    // Get all zipcodes (in production, you might want to add bounds to limit the query)
    const allZipCodes = await this.prisma.zipCode.findMany();

    const nearbyZipCodes: ZipCodeData[] = [];

    for (const zipCode of allZipCodes) {
      const distance = this.calculateDistance(
        centerCoords.latitude,
        centerCoords.longitude,
        zipCode.latitude,
        zipCode.longitude,
      );

      if (distance <= radiusKm) {
        nearbyZipCodes.push({
          country: zipCode.country,
          zipcode: zipCode.zipcode,
          placeName: zipCode.placeName,
          latitude: zipCode.latitude,
          longitude: zipCode.longitude,
        });
      }
    }

    // Sort by distance
    nearbyZipCodes.sort((a, b) => {
      const distanceA = this.calculateDistance(
        centerCoords.latitude,
        centerCoords.longitude,
        a.latitude,
        a.longitude,
      );
      const distanceB = this.calculateDistance(
        centerCoords.latitude,
        centerCoords.longitude,
        b.latitude,
        b.longitude,
      );
      return distanceA - distanceB;
    });

    return nearbyZipCodes;
  }

  /**
   * Import zipcode data from Excel (.xlsx) or CSV file
   * Clears existing data before importing new data
   */
  async importZipCodesFromFile(
    filePath: string,
    clearExisting: boolean = true,
  ): Promise<{
    imported: number;
    skipped: number;
    errors: number;
    deleted?: number;
  }> {
    console.log("👉 importZipCodesFromFile called with:", filePath);
    console.log(
      "👉 File extension detected:",
      path.extname(filePath).toLowerCase(),
    );

    let imported = 0;
    let skipped = 0;
    let errors = 0;
    let deleted = 0;

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Clear existing data if requested
    if (clearExisting) {
      const clearResult = await this.clearAllZipCodes();
      deleted = clearResult.deleted;
      console.log(`Cleared ${deleted} existing zipcode records`);
    }

    const fileExtension = path.extname(filePath).toLowerCase();
    const zipCodes: CreateZipCodeDto[] = [];

    if (fileExtension === ".xlsx" || fileExtension === ".xls") {
      console.log("Processing Excel file:", filePath);

      try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Try BOTH parsing methods to see which works
        console.log("=== TRYING DIFFERENT PARSING METHODS ===");

        // Method 1: Array format (your current approach)
        const dataArray = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];
        console.log("Array format - rows:", dataArray.length);
        if (dataArray.length > 0) {
          console.log("First row (array):", dataArray[0]);
        }

        // Method 2: Object format with headers (likely what works)
        const dataObjects = XLSX.utils.sheet_to_json(worksheet);
        console.log("Object format - rows:", dataObjects.length);
        if (dataObjects.length > 0) {
          console.log("First row (object):", dataObjects[0]);
        }

        console.log("=== END PARSING METHODS ===");

        let imported = 0;
        let skipped = 0;
        let errors = 0;

        // Use object format since you have proper headers
        if (dataObjects.length > 0) {
          console.log("Using OBJECT format with headers");

          for (let i = 0; i < dataObjects.length; i++) {
            const row = dataObjects[i];

            try {
              // Use the actual header names from your file
              const country = row["country"]?.toString().trim();
              const zipcode = row["zipcode"]?.toString().trim();
              const placeName = row["placeName"]?.toString().trim();
              const latitude = parseFloat(row["latitude"]);
              const longitude = parseFloat(row["longitude"]);

              console.log(`Processing row ${i + 1}:`, {
                country,
                zipcode,
                placeName,
                latitude,
                longitude,
              });

              if (
                country &&
                zipcode &&
                placeName &&
                !isNaN(latitude) &&
                !isNaN(longitude)
              ) {
                try {
                  await this.createZipCode({
                    country,
                    zipcode,
                    placeName,
                    latitude,
                    longitude,
                  });
                  imported++;
                  console.log(`✅ Imported: ${zipcode} - ${placeName}`);
                } catch (error) {
                  skipped++;
                  console.log(`⚠️ Skipped duplicate: ${zipcode}`);
                }
              } else {
                errors++;
                console.warn(`❌ Invalid row ${i + 1}:`, {
                  country,
                  zipcode,
                  placeName,
                  latitude,
                  longitude,
                });
              }
            } catch (error) {
              errors++;
              console.error(`❌ Error processing row ${i + 1}:`, error);
            }
          }
        }
        // Fallback to array format if object format didn't work
        else if (dataArray.length > 1) {
          console.log("Using ARRAY format (fallback)");

          // Skip header row (index 0)
          for (let i = 1; i < dataArray.length; i++) {
            const row = dataArray[i];

            try {
              if (!row || row.length < 11) {
                errors++;
                continue;
              }

              // Your original array positions
              const country = row[0]?.toString().trim();
              const zipcode = row[1]?.toString().trim();
              const placeName = row[2]?.toString().trim();
              const latitude = parseFloat(row[9]); // Column J
              const longitude = parseFloat(row[10]); // Column K

              console.log(`Processing row ${i + 1}:`, {
                country,
                zipcode,
                placeName,
                latitude,
                longitude,
              });

              if (
                country &&
                zipcode &&
                placeName &&
                !isNaN(latitude) &&
                !isNaN(longitude)
              ) {
                try {
                  await this.createZipCode({
                    country,
                    zipcode,
                    placeName,
                    latitude,
                    longitude,
                  });
                  imported++;
                  console.log(`✅ Imported: ${zipcode} - ${placeName}`);
                } catch (error) {
                  skipped++;
                  console.log(`⚠️ Skipped duplicate: ${zipcode}`);
                }
              } else {
                errors++;
                console.warn(`❌ Invalid row ${i + 1}`);
              }
            } catch (error) {
              errors++;
              console.error(`❌ Error processing row ${i + 1}:`, error);
            }
          }
        } else {
          throw new Error("No data found in Excel file");
        }

        console.log(
          `🎉 Import completed: ${imported} imported, ${skipped} skipped, ${errors} errors`,
        );
        return { imported, skipped, errors, deleted };
      } catch (error) {
        const errMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to process Excel file: ${errMessage}`);
      }
    } else if (fileExtension === ".csv") {
      // Handle CSV files (existing logic)
      return this.importZipCodesFromCSV(
        filePath,
        clearExisting ? deleted : undefined,
      );
    } else {
      throw new Error(
        `Unsupported file format: ${fileExtension}. Please use .xlsx or .csv files.`,
      );
    }
  }

  /**
   * Import zipcode data from CSV file (legacy method)
   */
  private async importZipCodesFromCSV(
    filePath: string,
    deletedCount?: number,
  ): Promise<{
    imported: number;
    skipped: number;
    errors: number;
    deleted?: number;
  }> {
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    return new Promise((resolve, reject) => {
      const zipCodes: CreateZipCodeDto[] = [];
      let isFirstRow = true;

      fs.createReadStream(filePath)
        .pipe(csv({ headers: false }))
        .on("data", (row) => {
          try {
            // Skip header row
            if (isFirstRow) {
              isFirstRow = false;
              return;
            }

            // Detect format based on row length and content
            let country, zipcode, placeName, latitude, longitude;

            if (row.length >= 10) {
              // Excel format: A=country(0), B=zipcode(1), C=placename(2), J=latitude(9), K=longitude(10)
              country = row[0]?.trim();
              zipcode = row[1]?.trim();
              placeName = row[2]?.trim();
              latitude = parseFloat(row[9]); // Column J (0-indexed = 9)
              longitude = parseFloat(row[10]); // Column K (0-indexed = 10)
            } else if (row.length === 5) {
              // Simple CSV format: country,zipcode,placename,latitude,longitude
              country = row[0]?.trim();
              zipcode = row[1]?.trim();
              placeName = row[2]?.trim();
              latitude = parseFloat(row[3]);
              longitude = parseFloat(row[4]);
            } else {
              // Try to detect format by checking for numeric values in different positions
              country = row[0]?.trim();
              zipcode = row[1]?.trim();
              placeName = row[2]?.trim();

              // Look for latitude/longitude in common positions
              if (!isNaN(parseFloat(row[9])) && !isNaN(parseFloat(row[10]))) {
                // Excel format
                latitude = parseFloat(row[9]);
                longitude = parseFloat(row[10]);
              } else if (
                !isNaN(parseFloat(row[3])) &&
                !isNaN(parseFloat(row[4]))
              ) {
                // CSV format
                latitude = parseFloat(row[3]);
                longitude = parseFloat(row[4]);
              } else {
                errors++;
                console.warn(
                  `Could not detect format for row: ${JSON.stringify(row.slice(0, 5))}...`,
                );
                return;
              }
            }

            if (
              country &&
              zipcode &&
              placeName &&
              !isNaN(latitude) &&
              !isNaN(longitude)
            ) {
              zipCodes.push({
                country,
                zipcode,
                placeName,
                latitude,
                longitude,
              });
            } else {
              errors++;
              console.warn(
                `Invalid row data: Country="${country}", Zipcode="${zipcode}", Place="${placeName}", Lat=${latitude}, Lng=${longitude}`,
              );
            }
          } catch (error) {
            errors++;
            console.error("Error parsing row:", error);
          }
        })
        .on("end", async () => {
          try {
            // Batch insert zipcodes
            for (const zipCodeData of zipCodes) {
              try {
                await this.createZipCode(zipCodeData);
                imported++;
              } catch (error) {
                // Likely duplicate zipcode
                skipped++;
              }
            }

            resolve({ imported, skipped, errors, deleted: deletedCount });
          } catch (error) {
            reject(error);
          }
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  }

  /**
   * Auto-import zipcode data on server start
   */
  async autoImportZipCodes(): Promise<void> {
    try {
      // Look for Excel file first, then CSV
      const excelFilePath = path.join(
        process.cwd(),
        "src",
        "data",
        "zipcodes.xlsx",
      );
      const csvFilePath = path.join(
        process.cwd(),
        "src",
        "data",
        "zipcodes.csv",
      );

      let filePath = "";
      if (fs.existsSync(excelFilePath)) {
        filePath = excelFilePath;
        console.log("Found Excel zipcode file:", filePath);
      } else if (fs.existsSync(csvFilePath)) {
        filePath = csvFilePath;
        console.log("Found CSV zipcode file:", filePath);
      } else {
        console.log(
          "No zipcode file found (looking for zipcodes.xlsx or zipcodes.csv)",
        );
        return;
      }

      // Check if we already have zipcode data
      const existingCount = await this.prisma.zipCode.count();
      if (existingCount > 0) {
        console.log(
          `Zipcode data already exists (${existingCount} records). Skipping auto-import.`,
        );
        return;
      }

      console.log("Starting auto-import of zipcode data...");
      const result = await this.importZipCodesFromFile(filePath);
      console.log(
        `Auto-import completed: ${result.imported} imported, ${result.skipped} skipped, ${result.errors} errors`,
      );
    } catch (error) {
      console.error("Auto-import zipcode data failed:", error);
    }
  }

  // CRUD operations for zipcode management
  async createZipCode(createZipCodeDto: CreateZipCodeDto) {
    // Use upsert to handle duplicate zipcode entries
    return this.prisma.zipCode.upsert({
      where: { zipcode: createZipCodeDto.zipcode },
      update: {
        placeName: createZipCodeDto.placeName,
        latitude: createZipCodeDto.latitude,
        longitude: createZipCodeDto.longitude,
        country: createZipCodeDto.country,
      },
      create: createZipCodeDto,
    });
  }

  async findAllZipCodes(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [zipCodes, total] = await Promise.all([
      this.prisma.zipCode.findMany({
        skip,
        take: limit,
        orderBy: [{ country: "asc" }, { zipcode: "asc" }],
      }),
      this.prisma.zipCode.count(),
    ]);

    return {
      data: zipCodes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async findZipCodeByCode(zipcode: string) {
    return this.prisma.zipCode.findUnique({
      where: { zipcode },
    });
  }

  async updateZipCode(zipcode: string, updateZipCodeDto: UpdateZipCodeDto) {
    return this.prisma.zipCode.update({
      where: { zipcode },
      data: updateZipCodeDto,
    });
  }

  async deleteZipCode(zipcode: string) {
    return this.prisma.zipCode.delete({
      where: { zipcode },
    });
  }

  async searchZipCodes(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [zipCodes, total] = await Promise.all([
      this.prisma.zipCode.findMany({
        where: {
          OR: [
            { zipcode: { contains: query } },
            { placeName: { contains: query } },
            { country: { contains: query } },
          ],
        },
        skip,
        take: limit,
        orderBy: [{ country: "asc" }, { placeName: "asc" }],
      }),
      this.prisma.zipCode.count({
        where: {
          OR: [
            { zipcode: { contains: query } },
            { placeName: { contains: query } },
            { country: { contains: query } },
          ],
        },
      }),
    ]);

    return {
      data: zipCodes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async clearAllZipCodes(): Promise<{ deleted: number }> {
    const result = await this.prisma.zipCode.deleteMany({});
    return { deleted: result.count };
  }

  async getZipCodeStats(): Promise<{
    total: number;
    countries: number;
    lastImported?: Date;
  }> {
    const [total, countries, lastRecord] = await Promise.all([
      this.prisma.zipCode.count(),
      this.prisma.zipCode
        .groupBy({
          by: ["country"],
        })
        .then((groups) => groups.length),
      this.prisma.zipCode.findFirst({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    return {
      total,
      countries,
      lastImported: lastRecord?.createdAt,
    };
  }

  /**
   * Sync zipcodes from User table to ZipCode table
   * Scanning all users and ensuring their zipcodes exist in the DB
   */
  async syncUserZipCodes(): Promise<{
    totalUsersChecked: number;
    uniqueUserZipcodes: number;
    missingInDb: number;
    successfullySynced: number;
    failedToSync: number;
    failedZipcodes: string[];
  }> {
    // 1. Get all distinct zipcodes from users
    const users = await this.prisma.user.findMany({
      select: { zipcode: true },
      // Zipcode is required in schema, so no need to check for null, JS filter below handles empty strings
    });

    // Filter valid-looking zipcodes (at least 3 chars)
    const userZipcodes = [
      ...new Set(users.map((u) => u.zipcode).filter((z) => z && z.length > 3)),
    ];

    console.log(
      `Found ${userZipcodes.length} distinct zipcodes from ${users.length} users`,
    );

    const stats = {
      totalUsersChecked: users.length,
      uniqueUserZipcodes: userZipcodes.length,
      missingInDb: 0,
      successfullySynced: 0,
      failedToSync: 0,
      failedZipcodes: [],
    };

    // 2. Check which ones are missing in ZipCode table
    for (const zipcode of userZipcodes) {
      const exists = await this.prisma.zipCode.findUnique({
        where: { zipcode },
      });

      if (!exists) {
        stats.missingInDb++;

        // 3. Try to fetch from Google
        try {
          const result = await this.fetchFromGoogleGeocoding(zipcode);
          if (result) {
            stats.successfullySynced++;
          } else {
            stats.failedToSync++;
            stats.failedZipcodes.push(zipcode);
          }
        } catch (error) {
          console.error(`Error syncing zipcode ${zipcode}:`, error);
          stats.failedToSync++;
          stats.failedZipcodes.push(zipcode);
        }
      }
    }

    return stats;
  }
}

function formattedAddressToPlaceName(formattedAddress: string): string {
  // Simple helper to shorten the formatted address if needed
  // Google returns "City, State Zip, Country" usually
  // We might want just "City, State"
  const parts = formattedAddress.split(",");
  if (parts.length > 1) {
    // Return first two parts (usually City, State/Province)
    return parts.slice(0, 2).join(",").trim();
  }
  return formattedAddress;
}
