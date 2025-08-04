import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateZipCodeDto, UpdateZipCodeDto } from '../dto/request.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';

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
     * Import zipcode data from CSV file
     */
    async importZipCodesFromFile(filePath: string): Promise<{ imported: number; skipped: number; errors: number }> {
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

                        resolve({ imported, skipped, errors });
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
            const zipCodeFilePath = path.join(process.cwd(), 'src', 'data', 'zipcodes.csv');

            // Check if file exists
            if (!fs.existsSync(zipCodeFilePath)) {
                console.log('Zipcode CSV file not found at:', zipCodeFilePath);
                return;
            }

            // Check if we already have zipcode data
            const existingCount = await this.prisma.zipCode.count();
            if (existingCount > 0) {
                console.log(`Zipcode data already exists (${existingCount} records). Skipping auto-import.`);
                return;
            }

            console.log('Starting auto-import of zipcode data...');
            const result = await this.importZipCodesFromFile(zipCodeFilePath);
            console.log(`Auto-import completed: ${result.imported} imported, ${result.skipped} skipped, ${result.errors} errors`);
        } catch (error) {
            console.error('Auto-import zipcode data failed:', error);
        }
    }

    // CRUD operations for zipcode management
    async createZipCode(createZipCodeDto: CreateZipCodeDto) {
        return this.prisma.zipCode.create({
            data: createZipCodeDto,
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
