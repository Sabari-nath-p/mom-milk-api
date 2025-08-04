import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsFilterDto, FeedAnalytics, DiaperAnalytics, SleepAnalytics, PaginatedResponse } from './dto/analytics.dto';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getFeedAnalytics(babyId: number, filter: AnalyticsFilterDto): Promise<FeedAnalytics>;
    getDiaperAnalytics(babyId: number, filter: AnalyticsFilterDto): Promise<DiaperAnalytics>;
    getSleepAnalytics(babyId: number, filter: AnalyticsFilterDto): Promise<SleepAnalytics>;
    getCombinedAnalytics(babyId: number, filter: AnalyticsFilterDto): Promise<{
        babyId: number;
        dateRange: {
            startDate: string;
            endDate: string;
        };
        feeding: FeedAnalytics;
        diaper: DiaperAnalytics;
        sleep: SleepAnalytics;
        generatedAt: string;
    }>;
    createPaginatedResponse<T>(data: T[], page: number, limit: number, totalItems: number): PaginatedResponse<T>;
}
