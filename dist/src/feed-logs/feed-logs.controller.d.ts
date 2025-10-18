import { FeedLogsService } from './feed-logs.service';
import { CreateFeedLogDto, UpdateFeedLogDto, FeedType } from './dto/feed-log.dto';
import { PaginationDto } from '../analytics/dto/analytics.dto';
export declare class FeedLogsController {
    private readonly feedLogsService;
    constructor(feedLogsService: FeedLogsService);
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
        babyId: number;
        feedingDate: Date;
        startTime: Date;
        endTime: Date;
        feedType: import(".prisma/client").$Enums.FeedType;
        position: import(".prisma/client").$Enums.Position | null;
        amount: number | null;
        note: string | null;
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
        babyId: number;
        feedingDate: Date;
        startTime: Date;
        endTime: Date;
        feedType: import(".prisma/client").$Enums.FeedType;
        position: import(".prisma/client").$Enums.Position | null;
        amount: number | null;
        note: string | null;
    })[]>;
    findByBabyId(babyId: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        babyId: number;
        feedingDate: Date;
        startTime: Date;
        endTime: Date;
        feedType: import(".prisma/client").$Enums.FeedType;
        position: import(".prisma/client").$Enums.Position | null;
        amount: number | null;
        note: string | null;
    }[]>;
    findByBabyIdAndDateRange(babyId: number, startDate: string, endDate: string): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        babyId: number;
        feedingDate: Date;
        startTime: Date;
        endTime: Date;
        feedType: import(".prisma/client").$Enums.FeedType;
        position: import(".prisma/client").$Enums.Position | null;
        amount: number | null;
        note: string | null;
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
        babyId: number;
        feedingDate: Date;
        startTime: Date;
        endTime: Date;
        feedType: import(".prisma/client").$Enums.FeedType;
        position: import(".prisma/client").$Enums.Position | null;
        amount: number | null;
        note: string | null;
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
        babyId: number;
        feedingDate: Date;
        startTime: Date;
        endTime: Date;
        feedType: import(".prisma/client").$Enums.FeedType;
        position: import(".prisma/client").$Enums.Position | null;
        amount: number | null;
        note: string | null;
    }>;
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
        babyId: number;
        feedingDate: Date;
        startTime: Date;
        endTime: Date;
        feedType: import(".prisma/client").$Enums.FeedType;
        position: import(".prisma/client").$Enums.Position | null;
        amount: number | null;
        note: string | null;
    }>;
    remove(id: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        babyId: number;
        feedingDate: Date;
        startTime: Date;
        endTime: Date;
        feedType: import(".prisma/client").$Enums.FeedType;
        position: import(".prisma/client").$Enums.Position | null;
        amount: number | null;
        note: string | null;
    }>;
    removeAllByBabyId(babyId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    findAllPaginated(pagination: PaginationDto, startDate?: string, endDate?: string, babyId?: number): Promise<import("../analytics/dto/analytics.dto").PaginatedResponse<any>>;
    findByBabyIdPaginated(babyId: number, pagination: PaginationDto, startDate?: string, endDate?: string): Promise<import("../analytics/dto/analytics.dto").PaginatedResponse<any>>;
}
