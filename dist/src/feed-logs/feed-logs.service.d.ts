import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedLogDto, UpdateFeedLogDto, FeedType } from './dto/feed-log.dto';
import { PaginationDto, PaginatedResponse } from '../analytics/dto/analytics.dto';
export declare class FeedLogsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createFeedLogDto: CreateFeedLogDto): Promise<{
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
        feedingDate: Date;
        startTime: Date;
        endTime: Date;
        feedType: import(".prisma/client").$Enums.FeedType;
        position: import(".prisma/client").$Enums.Position | null;
        amount: number | null;
        note: string | null;
        babyId: number;
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
        feedingDate: Date;
        startTime: Date;
        endTime: Date;
        feedType: import(".prisma/client").$Enums.FeedType;
        position: import(".prisma/client").$Enums.Position | null;
        amount: number | null;
        note: string | null;
        babyId: number;
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
        feedingDate: Date;
        startTime: Date;
        endTime: Date;
        feedType: import(".prisma/client").$Enums.FeedType;
        position: import(".prisma/client").$Enums.Position | null;
        amount: number | null;
        note: string | null;
        babyId: number;
    }>;
    findByBabyId(babyId: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        feedingDate: Date;
        startTime: Date;
        endTime: Date;
        feedType: import(".prisma/client").$Enums.FeedType;
        position: import(".prisma/client").$Enums.Position | null;
        amount: number | null;
        note: string | null;
        babyId: number;
    }[]>;
    findByBabyIdAndDateRange(babyId: number, startDate: string, endDate: string): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        feedingDate: Date;
        startTime: Date;
        endTime: Date;
        feedType: import(".prisma/client").$Enums.FeedType;
        position: import(".prisma/client").$Enums.Position | null;
        amount: number | null;
        note: string | null;
        babyId: number;
    }[]>;
    findByFeedType(feedType: FeedType): Promise<({
        baby: {
            name: string;
            id: number;
            gender: import(".prisma/client").$Enums.Gender;
        };
    } & {
        createdAt: Date;
        updatedAt: Date;
        id: number;
        feedingDate: Date;
        startTime: Date;
        endTime: Date;
        feedType: import(".prisma/client").$Enums.FeedType;
        position: import(".prisma/client").$Enums.Position | null;
        amount: number | null;
        note: string | null;
        babyId: number;
    })[]>;
    update(id: number, updateFeedLogDto: UpdateFeedLogDto): Promise<{
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
        feedingDate: Date;
        startTime: Date;
        endTime: Date;
        feedType: import(".prisma/client").$Enums.FeedType;
        position: import(".prisma/client").$Enums.Position | null;
        amount: number | null;
        note: string | null;
        babyId: number;
    }>;
    remove(id: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        feedingDate: Date;
        startTime: Date;
        endTime: Date;
        feedType: import(".prisma/client").$Enums.FeedType;
        position: import(".prisma/client").$Enums.Position | null;
        amount: number | null;
        note: string | null;
        babyId: number;
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
