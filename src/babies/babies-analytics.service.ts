import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
    BabyAnalyticsRequestDto, 
    BabyAnalyticsResponseDto,
    SleepAnalyticsDto,
    FeedAnalyticsDto,
    DiaperAnalyticsDto
} from './dto/baby-analytics.dto';
import { FeedType, Position, DiaperType } from '@prisma/client';

@Injectable()
export class BabiesAnalyticsService {
    constructor(private prisma: PrismaService) {}

    async getBabyAnalytics(analyticsDto: BabyAnalyticsRequestDto): Promise<BabyAnalyticsResponseDto> {
        const { babyId, startDate, endDate } = analyticsDto;

        // Verify baby exists
        const baby = await this.prisma.baby.findUnique({
            where: { id: babyId }
        });

        if (!baby) {
            throw new NotFoundException('Baby not found');
        }

        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);
        const totalDays = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24));

        // Get analytics data in parallel for better performance
        const [sleepAnalytics, feedAnalytics, diaperAnalytics] = await Promise.all([
            this.getSleepAnalytics(babyId, startDateTime, endDateTime, totalDays),
            this.getFeedAnalytics(babyId, startDateTime, endDateTime, totalDays),
            this.getDiaperAnalytics(babyId, startDateTime, endDateTime, totalDays)
        ]);

        return {
            sleepAnalytics,
            feedAnalytics,
            diaperAnalytics,
            totalDays,
            startDate,
            endDate,
            babyId
        };
    }

    private async getSleepAnalytics(
        babyId: number, 
        startDate: Date, 
        endDate: Date, 
        totalDays: number
    ): Promise<SleepAnalyticsDto> {
        const sleepLogs = await this.prisma.sleepLog.findMany({
            where: {
                babyId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        const totalSleeps = sleepLogs.length;
        let totalSleepDuration = 0;

        sleepLogs.forEach(log => {
            const start = new Date(log.startTime);
            // If endTime is null, default to 3 hours later
            const end = log.endTime ? new Date(log.endTime) : new Date(start.getTime() + 3 * 60 * 60 * 1000);
            const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            totalSleepDuration += durationHours;
        });

        const averageSleepDurationPerDay = totalDays > 0 ? totalSleepDuration / totalDays : 0;

        return {
            totalSleeps,
            totalSleepDuration: Math.round(totalSleepDuration * 100) / 100,
            averageSleepDurationPerDay: Math.round(averageSleepDurationPerDay * 100) / 100
        };
    }

    private async getFeedAnalytics(
        babyId: number, 
        startDate: Date, 
        endDate: Date, 
        totalDays: number
    ): Promise<FeedAnalyticsDto> {
        const feedLogs = await this.prisma.feedLog.findMany({
            where: {
                babyId,
                feedingDate: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        const totalFeeds = feedLogs.length;
        
        // Calculate total feeding time in hours
        let totalFeedingMinutes = 0;
        feedLogs.forEach(log => {
            const start = new Date(log.startTime);
            const end = new Date(log.endTime);
            const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
            totalFeedingMinutes += durationMinutes;
        });

        const totalFeedingHours = totalFeedingMinutes / 60;
        const averageFeedingTimePerDay = totalDays > 0 ? totalFeedingHours / totalDays : 0;

        // Feed type breakdown
        const feedTypeBreakdown: Record<string, number> = {};
        Object.values(FeedType).forEach(type => {
            feedTypeBreakdown[type] = feedLogs.filter(log => log.feedType === type).length;
        });

        // Feed position breakdown
        const feedPositionBreakdown: Record<string, number> = {};
        Object.values(Position).forEach(position => {
            feedPositionBreakdown[position] = feedLogs.filter(log => log.position === position).length;
        });

        return {
            totalFeeds,
            averageFeedingTimePerDay: Math.round(averageFeedingTimePerDay * 100) / 100,
            feedTypeBreakdown,
            feedPositionBreakdown
        };
    }

    private async getDiaperAnalytics(
        babyId: number, 
        startDate: Date, 
        endDate: Date, 
        totalDays: number
    ): Promise<DiaperAnalyticsDto> {
        const diaperLogs = await this.prisma.diaperLog.findMany({
            where: {
                babyId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        const totalDiaperChanges = diaperLogs.length;
        const averageDiaperChangesPerDay = totalDays > 0 ? totalDiaperChanges / totalDays : 0;

        // Diaper type breakdown
        const diaperTypeBreakdown: Record<string, number> = {};
        Object.values(DiaperType).forEach(type => {
            diaperTypeBreakdown[type] = diaperLogs.filter(log => log.diaperType === type).length;
        });

        return {
            totalDiaperChanges,
            averageDiaperChangesPerDay: Math.round(averageDiaperChangesPerDay * 100) / 100,
            diaperTypeBreakdown
        };
    }
}