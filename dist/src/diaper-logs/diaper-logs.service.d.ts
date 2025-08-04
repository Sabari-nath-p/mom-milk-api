import { PrismaService } from '../prisma/prisma.service';
import { CreateDiaperLogDto, UpdateDiaperLogDto, DiaperType } from './dto/diaper-log.dto';
import { PaginationDto, PaginatedResponse } from '../analytics/dto/analytics.dto';
export declare class DiaperLogsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createDiaperLogDto: CreateDiaperLogDto): Promise<{
        baby: {
            name: string;
            id: number;
            user: {
                name: string;
                email: string;
                id: number;
            };
            gender: import(".prisma/client").$Enums.Gender;
        };
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        note: string | null;
        babyId: number;
        date: Date;
        time: Date;
        diaperType: import(".prisma/client").$Enums.DiaperType;
    }>;
    findAll(): Promise<({
        baby: {
            name: string;
            id: number;
            user: {
                name: string;
                email: string;
                id: number;
            };
            gender: import(".prisma/client").$Enums.Gender;
        };
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        note: string | null;
        babyId: number;
        date: Date;
        time: Date;
        diaperType: import(".prisma/client").$Enums.DiaperType;
    })[]>;
    findOne(id: number): Promise<{
        baby: {
            name: string;
            id: number;
            user: {
                name: string;
                email: string;
                id: number;
            };
            gender: import(".prisma/client").$Enums.Gender;
        };
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        note: string | null;
        babyId: number;
        date: Date;
        time: Date;
        diaperType: import(".prisma/client").$Enums.DiaperType;
    }>;
    findByBabyId(babyId: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        note: string | null;
        babyId: number;
        date: Date;
        time: Date;
        diaperType: import(".prisma/client").$Enums.DiaperType;
    }[]>;
    findByBabyIdAndDateRange(babyId: number, startDate: string, endDate: string): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        note: string | null;
        babyId: number;
        date: Date;
        time: Date;
        diaperType: import(".prisma/client").$Enums.DiaperType;
    }[]>;
    findByDiaperType(diaperType: DiaperType): Promise<({
        baby: {
            name: string;
            id: number;
            gender: import(".prisma/client").$Enums.Gender;
        };
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        note: string | null;
        babyId: number;
        date: Date;
        time: Date;
        diaperType: import(".prisma/client").$Enums.DiaperType;
    })[]>;
    update(id: number, updateDiaperLogDto: UpdateDiaperLogDto): Promise<{
        baby: {
            name: string;
            id: number;
            user: {
                name: string;
                email: string;
                id: number;
            };
            gender: import(".prisma/client").$Enums.Gender;
        };
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        note: string | null;
        babyId: number;
        date: Date;
        time: Date;
        diaperType: import(".prisma/client").$Enums.DiaperType;
    }>;
    remove(id: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        note: string | null;
        babyId: number;
        date: Date;
        time: Date;
        diaperType: import(".prisma/client").$Enums.DiaperType;
    }>;
    removeAllByBabyId(babyId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    findAllPaginated(pagination: PaginationDto, filters?: {
        startDate?: string;
        endDate?: string;
        babyId?: number;
    }): Promise<PaginatedResponse<any>>;
    findByBabyIdPaginated(babyId: number, pagination: PaginationDto, filters?: {
        startDate?: string;
        endDate?: string;
    }): Promise<PaginatedResponse<any>>;
    private createPaginatedResponse;
}
