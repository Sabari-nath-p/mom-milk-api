import { AnalyticsService } from './analytics.service';
import { AnalyticsFilterDto } from './dto/analytics.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getFeedAnalytics(babyId: number, filter: AnalyticsFilterDto): Promise<import("./dto/analytics.dto").FeedAnalytics>;
    getDiaperAnalytics(babyId: number, filter: AnalyticsFilterDto): Promise<import("./dto/analytics.dto").DiaperAnalytics>;
    getSleepAnalytics(babyId: number, filter: AnalyticsFilterDto): Promise<import("./dto/analytics.dto").SleepAnalytics>;
    getCombinedAnalytics(babyId: number, filter: AnalyticsFilterDto): Promise<{
        babyId: number;
        dateRange: {
            startDate: string;
            endDate: string;
        };
        feeding: import("./dto/analytics.dto").FeedAnalytics;
        diaper: import("./dto/analytics.dto").DiaperAnalytics;
        sleep: import("./dto/analytics.dto").SleepAnalytics;
        generatedAt: string;
    }>;
}
