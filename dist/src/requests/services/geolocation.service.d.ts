import { PrismaService } from '../../prisma/prisma.service';
import { CreateZipCodeDto, UpdateZipCodeDto } from '../dto/request.dto';
export interface ZipCodeData {
    country: string;
    zipcode: string;
    placeName: string;
    latitude: number;
    longitude: number;
}
export declare class GeolocationService {
    private prisma;
    constructor(prisma: PrismaService);
    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
    private toRadians;
    getZipCodeCoordinates(zipcode: string): Promise<{
        latitude: number;
        longitude: number;
        placeName: string;
        country: string;
    } | null>;
    findNearbyZipCodes(centerZipcode: string, radiusKm: number): Promise<ZipCodeData[]>;
    importZipCodesFromFile(filePath: string): Promise<{
        imported: number;
        skipped: number;
        errors: number;
    }>;
    autoImportZipCodes(): Promise<void>;
    createZipCode(createZipCodeDto: CreateZipCodeDto): Promise<{
        zipcode: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        country: string;
        placeName: string;
        latitude: number;
        longitude: number;
    }>;
    findAllZipCodes(page?: number, limit?: number): Promise<{
        data: {
            zipcode: string;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            country: string;
            placeName: string;
            latitude: number;
            longitude: number;
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    findZipCodeByCode(zipcode: string): Promise<{
        zipcode: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        country: string;
        placeName: string;
        latitude: number;
        longitude: number;
    }>;
    updateZipCode(zipcode: string, updateZipCodeDto: UpdateZipCodeDto): Promise<{
        zipcode: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        country: string;
        placeName: string;
        latitude: number;
        longitude: number;
    }>;
    deleteZipCode(zipcode: string): Promise<{
        zipcode: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        country: string;
        placeName: string;
        latitude: number;
        longitude: number;
    }>;
    searchZipCodes(query: string, page?: number, limit?: number): Promise<{
        data: {
            zipcode: string;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            country: string;
            placeName: string;
            latitude: number;
            longitude: number;
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    clearAllZipCodes(): Promise<{
        deleted: number;
    }>;
    getZipCodeStats(): Promise<{
        total: number;
        countries: number;
        lastImported?: Date;
    }>;
}
