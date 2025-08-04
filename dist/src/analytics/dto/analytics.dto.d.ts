export declare class AnalyticsFilterDto {
    startDate?: string;
    endDate?: string;
}
export declare class PaginationDto {
    page?: number;
    limit?: number;
}
export declare class LogsWithPaginationDto extends PaginationDto {
    startDate?: string;
    endDate?: string;
}
export interface FeedAnalytics {
    totalFeeds: number;
    totalFeedTimeMinutes: number;
    averageFeedTimeMinutes: number;
    totalAmountMl: number;
    averageAmountMl: number;
    feedMethodCount: {
        BREAST: number;
        BOTTLE: number;
        OTHER: number;
    };
    positionBreakdown: {
        LEFT: number;
        RIGHT: number;
        BOTH: number;
        NOT_SPECIFIED: number;
    };
    feedingPatterns: {
        date: string;
        feedCount: number;
        totalTimeMinutes: number;
        totalAmountMl: number;
    }[];
}
export interface DiaperAnalytics {
    totalChanges: number;
    averageChangesPerDay: number;
    diaperTypeBreakdown: {
        SOLID: number;
        LIQUID: number;
        BOTH: number;
    };
    dailyPatterns: {
        date: string;
        changeCount: number;
        solidCount: number;
        liquidCount: number;
        bothCount: number;
    }[];
    hourlyDistribution: {
        hour: number;
        changeCount: number;
    }[];
}
export interface SleepAnalytics {
    totalSleepSessions: number;
    totalSleepHours: number;
    averageSleepHours: number;
    averageSessionDurationMinutes: number;
    longestSleepSessionMinutes: number;
    shortestSleepSessionMinutes: number;
    locationBreakdown: {
        CRIB: number;
        BED: number;
        STROLLER: number;
        OTHER: number;
    };
    sleepQualityTrends: {
        date: string;
        sessionCount: number;
        totalHours: number;
        averageQuality: string;
    }[];
    dailyPatterns: {
        date: string;
        sessionCount: number;
        totalHours: number;
        averageSessionMinutes: number;
    }[];
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
