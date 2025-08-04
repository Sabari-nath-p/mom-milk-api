"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeolocationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
let GeolocationService = class GeolocationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return Math.round(distance * 100) / 100;
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    async getZipCodeCoordinates(zipcode) {
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
    async findNearbyZipCodes(centerZipcode, radiusKm) {
        const centerCoords = await this.getZipCodeCoordinates(centerZipcode);
        if (!centerCoords) {
            return [];
        }
        const allZipCodes = await this.prisma.zipCode.findMany();
        const nearbyZipCodes = [];
        for (const zipCode of allZipCodes) {
            const distance = this.calculateDistance(centerCoords.latitude, centerCoords.longitude, zipCode.latitude, zipCode.longitude);
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
        nearbyZipCodes.sort((a, b) => {
            const distanceA = this.calculateDistance(centerCoords.latitude, centerCoords.longitude, a.latitude, a.longitude);
            const distanceB = this.calculateDistance(centerCoords.latitude, centerCoords.longitude, b.latitude, b.longitude);
            return distanceA - distanceB;
        });
        return nearbyZipCodes;
    }
    async importZipCodesFromFile(filePath) {
        let imported = 0;
        let skipped = 0;
        let errors = 0;
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        return new Promise((resolve, reject) => {
            const zipCodes = [];
            let isFirstRow = true;
            fs.createReadStream(filePath)
                .pipe(csv({ headers: false }))
                .on('data', (row) => {
                try {
                    if (isFirstRow) {
                        isFirstRow = false;
                        return;
                    }
                    let country, zipcode, placeName, latitude, longitude;
                    if (row.length >= 10) {
                        country = row[0]?.trim();
                        zipcode = row[1]?.trim();
                        placeName = row[2]?.trim();
                        latitude = parseFloat(row[9]);
                        longitude = parseFloat(row[10]);
                    }
                    else if (row.length === 5) {
                        country = row[0]?.trim();
                        zipcode = row[1]?.trim();
                        placeName = row[2]?.trim();
                        latitude = parseFloat(row[3]);
                        longitude = parseFloat(row[4]);
                    }
                    else {
                        country = row[0]?.trim();
                        zipcode = row[1]?.trim();
                        placeName = row[2]?.trim();
                        if (!isNaN(parseFloat(row[9])) && !isNaN(parseFloat(row[10]))) {
                            latitude = parseFloat(row[9]);
                            longitude = parseFloat(row[10]);
                        }
                        else if (!isNaN(parseFloat(row[3])) && !isNaN(parseFloat(row[4]))) {
                            latitude = parseFloat(row[3]);
                            longitude = parseFloat(row[4]);
                        }
                        else {
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
                    }
                    else {
                        errors++;
                        console.warn(`Invalid row data: Country="${country}", Zipcode="${zipcode}", Place="${placeName}", Lat=${latitude}, Lng=${longitude}`);
                    }
                }
                catch (error) {
                    errors++;
                    console.error('Error parsing row:', error);
                }
            })
                .on('end', async () => {
                try {
                    for (const zipCodeData of zipCodes) {
                        try {
                            await this.createZipCode(zipCodeData);
                            imported++;
                        }
                        catch (error) {
                            skipped++;
                        }
                    }
                    resolve({ imported, skipped, errors });
                }
                catch (error) {
                    reject(error);
                }
            })
                .on('error', (error) => {
                reject(error);
            });
        });
    }
    async autoImportZipCodes() {
        try {
            const zipCodeFilePath = path.join(process.cwd(), 'src', 'data', 'zipcodes.csv');
            if (!fs.existsSync(zipCodeFilePath)) {
                console.log('Zipcode CSV file not found at:', zipCodeFilePath);
                return;
            }
            const existingCount = await this.prisma.zipCode.count();
            if (existingCount > 0) {
                console.log(`Zipcode data already exists (${existingCount} records). Skipping auto-import.`);
                return;
            }
            console.log('Starting auto-import of zipcode data...');
            const result = await this.importZipCodesFromFile(zipCodeFilePath);
            console.log(`Auto-import completed: ${result.imported} imported, ${result.skipped} skipped, ${result.errors} errors`);
        }
        catch (error) {
            console.error('Auto-import zipcode data failed:', error);
        }
    }
    async createZipCode(createZipCodeDto) {
        return this.prisma.zipCode.create({
            data: createZipCodeDto,
        });
    }
    async findAllZipCodes(page = 1, limit = 50) {
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
    async findZipCodeByCode(zipcode) {
        return this.prisma.zipCode.findUnique({
            where: { zipcode },
        });
    }
    async updateZipCode(zipcode, updateZipCodeDto) {
        return this.prisma.zipCode.update({
            where: { zipcode },
            data: updateZipCodeDto,
        });
    }
    async deleteZipCode(zipcode) {
        return this.prisma.zipCode.delete({
            where: { zipcode },
        });
    }
    async searchZipCodes(query, page = 1, limit = 20) {
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
    async clearAllZipCodes() {
        const result = await this.prisma.zipCode.deleteMany({});
        return { deleted: result.count };
    }
    async getZipCodeStats() {
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
};
exports.GeolocationService = GeolocationService;
exports.GeolocationService = GeolocationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GeolocationService);
//# sourceMappingURL=geolocation.service.js.map