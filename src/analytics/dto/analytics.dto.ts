import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class AnalyticsFilterDto {
    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiProperty({ example: '2024-01-31T23:59:59.000Z', required: false })
    @IsDateString()
    @IsOptional()
    endDate?: string;
}

export class PaginationDto {
    @ApiProperty({ example: 1, minimum: 1, default: 1, required: false })
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @ApiProperty({ example: 10, minimum: 1, maximum: 100, default: 10, required: false })
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit?: number = 10;
}

export class LogsWithPaginationDto extends PaginationDto {
    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiProperty({ example: '2024-01-31T23:59:59.000Z', required: false })
    @IsDateString()
    @IsOptional()
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
