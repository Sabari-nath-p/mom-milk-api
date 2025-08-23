import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateZipCodeDto, UpdateZipCodeDto } from '../dto/request.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import * as XLSX from 'xlsx';

export interface ZipCodeData {
    country: string;
    zipcode: string;
    placeName: string;
    latitude: number;
    longitude: number;
}

@Injectable()
export class GeolocationService {
    constructor(private prisma: PrismaService) { }

    /**
     * Calculate distance between two coordinates using Haversine formula
     * @param lat1 Latitude of first point
     * @param lon1 Longitude of first point
     * @param lat2 Latitude of second point
     * @param lon2 Longitude of second point
     * @returns Distance in kilometers
     */
    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return Math.round(distance * 100) / 100; // Round to 2 decimal places
    }

    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Get coordinates for a zipcode
     */
    async getZipCodeCoordinates(zipcode: string): Promise<{
        latitude: number;
        longitude: number;
        placeName: string;
        country: string;
    } | null> {
        const zipCodeData = await this.prisma.zipCode.findUnique({
            where: { zipcode },
            select: {
                latitude: true,
                longitude: true,
                placeName: true,
                country: true
            },
        });

        return zipCodeData;
    }

    /**
     * Find nearby zipcodes within a certain radius
     */
    async findNearbyZipCodes(centerZipcode: string, radiusKm: number): Promise<ZipCodeData[]> {
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
                zipCode.longitude
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
                a.longitude
            );
            const distanceB = this.calculateDistance(
                centerCoords.latitude,
                centerCoords.longitude,
                b.latitude,
                b.longitude
            );
            return distanceA - distanceB;
        });

        return nearbyZipCodes;
    }

    /**
     * Import zipcode data from Excel (.xlsx) or CSV file
     * Clears existing data before importing new data
     */
    async importZipCodesFromFile(filePath: string, clearExisting: boolean = true): Promise<{ imported: number; skipped: number; errors: number; deleted?: number }> {
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

        if (fileExtension === '.xlsx' || fileExtension === '.xls') {
            // Handle Excel files
            console.log('Processing Excel file:', filePath);

            try {
                const workbook = XLSX.readFile(filePath);
                const sheetName = workbook.SheetNames[0]; // Use first sheet
                const worksheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                // Skip header row and process data
                for (let i = 1; i < data.length; i++) {
                    const row = data[i];

                    try {
                        if (!row || row.length === 0) continue;

                        let country, zipcode, placeName, latitude, longitude;

                        if (row.length >= 11) {
                            // Excel format: A=country(0), B=zipcode(1), C=placename(2), J=latitude(9), K=longitude(10)
                            country = row[0]?.toString().trim();
                            zipcode = row[1]?.toString().trim();
                            placeName = row[2]?.toString().trim();
                            latitude = parseFloat(row[9]); // Column J (0-indexed = 9)
                            longitude = parseFloat(row[10]); // Column K (0-indexed = 10)
                        } else if (row.length >= 5) {
                            // Simple format: country,zipcode,placename,latitude,longitude
                            country = row[0]?.toString().trim();
                            zipcode = row[1]?.toString().trim();
                            placeName = row[2]?.toString().trim();
                            latitude = parseFloat(row[3]);
                            longitude = parseFloat(row[4]);
                        }

                        if (country && zipcode && placeName && !isNaN(latitude) && !isNaN(longitude)) {
                            zipCodes.push({
                                country,
                                zipcode,
                                placeName,
                                latitude,
                                longitude,
                            });
                        } else {
                            errors++;
                            console.warn(`Invalid Excel row data at row ${i + 1}: Country="${country}", Zipcode="${zipcode}", Place="${placeName}", Lat=${latitude}, Lng=${longitude}`);
                        }
                    } catch (error) {
                        errors++;
                        console.error(`Error parsing Excel row ${i + 1}:`, error);
                    }
                }

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

                return { imported, skipped, errors, deleted };

            } catch (error) {
                throw new Error(`Failed to process Excel file: ${error.message}`);
            }
        } else if (fileExtension === '.csv') {
            // Handle CSV files (existing logic)
            return this.importZipCodesFromCSV(filePath, clearExisting ? deleted : undefined);
        } else {
            throw new Error(`Unsupported file format: ${fileExtension}. Please use .xlsx or .csv files.`);
        }
    }

    /**
     * Import zipcode data from CSV file (legacy method)
     */
    private async importZipCodesFromCSV(filePath: string, deletedCount?: number): Promise<{ imported: number; skipped: number; errors: number; deleted?: number }> {
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
                .on('data', (row) => {
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
                            } else if (!isNaN(parseFloat(row[3])) && !isNaN(parseFloat(row[4]))) {
                                // CSV format
                                latitude = parseFloat(row[3]);
                                longitude = parseFloat(row[4]);
                            } else {
                                errors++;
                                console.warn(`Could not detect format for row: ${JSON.stringify(row.slice(0, 5))}...`);
                                return;
                            }
                        }

                        if (country && zipcode && placeName && !isNaN(latitude) && !isNaN(longitude)) {
                            zipCodes.push({
                                country,
                                zipcode,
                                placeName,
                                latitude,
                                longitude,
                            });
                        } else {
                            errors++;
                            console.warn(`Invalid row data: Country="${country}", Zipcode="${zipcode}", Place="${placeName}", Lat=${latitude}, Lng=${longitude}`);
                        }
                    } catch (error) {
                        errors++;
                        console.error('Error parsing row:', error);
                    }
                })
                .on('end', async () => {
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
                .on('error', (error) => {
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
            const excelFilePath = path.join(process.cwd(), 'src', 'data', 'zipcodes.xlsx');
            const csvFilePath = path.join(process.cwd(), 'src', 'data', 'zipcodes.csv');

            let filePath = '';
            if (fs.existsSync(excelFilePath)) {
                filePath = excelFilePath;
                console.log('Found Excel zipcode file:', filePath);
            } else if (fs.existsSync(csvFilePath)) {
                filePath = csvFilePath;
                console.log('Found CSV zipcode file:', filePath);
            } else {
                console.log('No zipcode file found (looking for zipcodes.xlsx or zipcodes.csv)');
                return;
            }

            // Check if we already have zipcode data
            const existingCount = await this.prisma.zipCode.count();
            if (existingCount > 0) {
                console.log(`Zipcode data already exists (${existingCount} records). Skipping auto-import.`);
                return;
            }

            console.log('Starting auto-import of zipcode data...');
            const result = await this.importZipCodesFromFile(filePath);
            console.log(`Auto-import completed: ${result.imported} imported, ${result.skipped} skipped, ${result.errors} errors`);
        } catch (error) {
            console.error('Auto-import zipcode data failed:', error);
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
                orderBy: [
                    { country: 'asc' },
                    { zipcode: 'asc' },
                ],
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
                orderBy: [
                    { country: 'asc' },
                    { placeName: 'asc' },
                ],
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
            this.prisma.zipCode.groupBy({
                by: ['country'],
            }).then(groups => groups.length),
            this.prisma.zipCode.findFirst({
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true },
            }),
        ]);

        return {
            total,
            countries,
            lastImported: lastRecord?.createdAt,
        };
    }
}
