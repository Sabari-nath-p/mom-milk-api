import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { FeedType, Position, DiaperType } from '@prisma/client';

export class BabyAnalyticsRequestDto {
    @ApiProperty({ example: 1, description: 'Baby ID' })
    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    babyId: number;

    @ApiProperty({ 
        example: '2023-10-01T00:00:00Z', 
        description: 'Start date for analytics period' 
    })
    @IsDateString()
    startDate: string;

    @ApiProperty({ 
        example: '2023-10-31T23:59:59Z', 
        description: 'End date for analytics period' 
    })
    @IsDateString()
    endDate: string;
}

export class SleepAnalyticsDto {
    @ApiProperty({ example: 15, description: 'Total number of sleep sessions' })
    totalSleeps: number;

    @ApiProperty({ example: 180.5, description: 'Total sleep duration in hours' })
    totalSleepDuration: number;

    @ApiProperty({ example: 12.5, description: 'Average sleep duration per day in hours' })
    averageSleepDurationPerDay: number;
}

export class FeedAnalyticsDto {
    @ApiProperty({ example: 45, description: 'Total number of feeding sessions' })
    totalFeeds: number;

    @ApiProperty({ example: 2.5, description: 'Average feeding time per day in hours' })
    averageFeedingTimePerDay: number;

    @ApiProperty({ 
        example: { BREAST: 30, BOTTLE: 15, OTHER: 0 }, 
        description: 'Feed type breakdown' 
    })
    feedTypeBreakdown: Record<string, number>;

    @ApiProperty({ 
        example: { LEFT: 20, RIGHT: 15, BOTH: 10 }, 
        description: 'Feed position breakdown' 
    })
    feedPositionBreakdown: Record<string, number>;
}

export class DiaperAnalyticsDto {
    @ApiProperty({ example: 60, description: 'Total number of diaper changes' })
    totalDiaperChanges: number;

    @ApiProperty({ example: 4.2, description: 'Average diaper changes per day' })
    averageDiaperChangesPerDay: number;

    @ApiProperty({ 
        example: { SOLID: 25, LIQUID: 30, BOTH: 5, EMPTY: 10 }, 
        description: 'Diaper type breakdown' 
    })
    diaperTypeBreakdown: Record<string, number>;
}

export class BabyAnalyticsResponseDto {
    @ApiProperty({ description: 'Sleep analytics data' })
    sleepAnalytics: SleepAnalyticsDto;

    @ApiProperty({ description: 'Feed analytics data' })
    feedAnalytics: FeedAnalyticsDto;

    @ApiProperty({ description: 'Diaper analytics data' })
    diaperAnalytics: DiaperAnalyticsDto;

    @ApiProperty({ example: 31, description: 'Number of days in the analytics period' })
    totalDays: number;

    @ApiProperty({ example: '2023-10-01T00:00:00Z', description: 'Start date of analytics' })
    startDate: string;

    @ApiProperty({ example: '2023-10-31T23:59:59Z', description: 'End date of analytics' })
    endDate: string;

    @ApiProperty({ example: 1, description: 'Baby ID' })
    babyId: number;
}