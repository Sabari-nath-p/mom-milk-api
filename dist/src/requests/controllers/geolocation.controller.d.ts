import { GeolocationService } from '../services/geolocation.service';
import { CreateZipCodeDto, UpdateZipCodeDto } from '../dto/request.dto';
export declare class GeolocationController {
    private readonly geolocationService;
    constructor(geolocationService: GeolocationService);
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
    getAllZipCodes(page?: string, limit?: string): Promise<{
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
    searchZipCodes(query: string, page?: string, limit?: string): Promise<{
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
    getZipCode(zipcode: string): Promise<{
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
    findNearbyZipCodes(zipcode: string, radius?: string): Promise<import("../services/geolocation.service").ZipCodeData[]>;
    importZipCodes(): Promise<{
        imported: number;
        skipped: number;
        errors: number;
        deleted?: number;
    }>;
    calculateDistance(zipcode1: string, zipcode2: string): Promise<{
        error: string;
        zipcode1?: undefined;
        zipcode2?: undefined;
        distance?: undefined;
        unit?: undefined;
        locations?: undefined;
    } | {
        zipcode1: string;
        zipcode2: string;
        distance: number;
        unit: string;
        locations: {
            [zipcode1]: {
                latitude: number;
                longitude: number;
                placeName: string;
                country: string;
            };
            [zipcode2]: {
                latitude: number;
                longitude: number;
                placeName: string;
                country: string;
            };
        };
        error?: undefined;
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
