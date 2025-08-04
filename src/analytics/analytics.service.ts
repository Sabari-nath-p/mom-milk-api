import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    AnalyticsFilterDto,
    FeedAnalytics,
    DiaperAnalytics,
    SleepAnalytics,
    PaginatedResponse
} from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getFeedAnalytics(babyId: number, filter: AnalyticsFilterDto): Promise<FeedAnalytics> {
        const whereClause: any = { babyId };

        if (filter.startDate || filter.endDate) {
            whereClause.feedingDate = {};
            if (filter.startDate) whereClause.feedingDate.gte = new Date(filter.startDate);
            if (filter.endDate) whereClause.feedingDate.lte = new Date(filter.endDate);
        }

        const feedLogs = await this.prisma.feedLog.findMany({
            where: whereClause,
            orderBy: { feedingDate: 'asc' },
        });

        // Calculate total feed time and amounts
        let totalFeedTimeMinutes = 0;
        let totalAmountMl = 0;
        let amountCount = 0;

        const feedMethodCount = { BREAST: 0, BOTTLE: 0, OTHER: 0 };
        const positionBreakdown = { LEFT: 0, RIGHT: 0, BOTH: 0, NOT_SPECIFIED: 0 };
        const dailyPatterns = new Map<string, any>();

        feedLogs.forEach(log => {
            // Calculate feed duration
            const durationMs = log.endTime.getTime() - log.startTime.getTime();
            const durationMinutes = durationMs / (1000 * 60);
            totalFeedTimeMinutes += durationMinutes;

            // Count feed methods
            feedMethodCount[log.feedType]++;

            // Count positions
            if (log.position) {
                positionBreakdown[log.position]++;
            } else {
                positionBreakdown.NOT_SPECIFIED++;
            }

            // Calculate amounts
            if (log.amount) {
                totalAmountMl += log.amount;
                amountCount++;
            }

            // Daily patterns
            const dateKey = log.feedingDate.toISOString().split('T')[0];
            if (!dailyPatterns.has(dateKey)) {
                dailyPatterns.set(dateKey, {
                    date: dateKey,
                    feedCount: 0,
                    totalTimeMinutes: 0,
                    totalAmountMl: 0,
                });
            }
            const dayData = dailyPatterns.get(dateKey);
            dayData.feedCount++;
            dayData.totalTimeMinutes += durationMinutes;
            dayData.totalAmountMl += log.amount || 0;
        });

        return {
            totalFeeds: feedLogs.length,
            totalFeedTimeMinutes: Math.round(totalFeedTimeMinutes),
            averageFeedTimeMinutes: feedLogs.length > 0 ? Math.round(totalFeedTimeMinutes / feedLogs.length) : 0,
            totalAmountMl: Math.round(totalAmountMl * 100) / 100,
            averageAmountMl: amountCount > 0 ? Math.round((totalAmountMl / amountCount) * 100) / 100 : 0,
            feedMethodCount,
            positionBreakdown,
            feedingPatterns: Array.from(dailyPatterns.values()),
        };
    }

    async getDiaperAnalytics(babyId: number, filter: AnalyticsFilterDto): Promise<DiaperAnalytics> {
        const whereClause: any = { babyId };

        if (filter.startDate || filter.endDate) {
            whereClause.date = {};
            if (filter.startDate) whereClause.date.gte = new Date(filter.startDate);
            if (filter.endDate) whereClause.date.lte = new Date(filter.endDate);
        }

        const diaperLogs = await this.prisma.diaperLog.findMany({
            where: whereClause,
            orderBy: { date: 'asc' },
        });

        const diaperTypeBreakdown = { SOLID: 0, LIQUID: 0, BOTH: 0 };
        const dailyPatterns = new Map<string, any>();
        const hourlyDistribution = new Map<number, number>();

        diaperLogs.forEach(log => {
            // Count diaper types
            diaperTypeBreakdown[log.diaperType]++;

            // Daily patterns
            const dateKey = log.date.toISOString().split('T')[0];
            if (!dailyPatterns.has(dateKey)) {
                dailyPatterns.set(dateKey, {
                    date: dateKey,
                    changeCount: 0,
                    solidCount: 0,
                    liquidCount: 0,
                    bothCount: 0,
                });
            }
            const dayData = dailyPatterns.get(dateKey);
            dayData.changeCount++;
            dayData[`${log.diaperType.toLowerCase()}Count`]++;

            // Hourly distribution
            const hour = log.time.getHours();
            hourlyDistribution.set(hour, (hourlyDistribution.get(hour) || 0) + 1);
        });

        // Calculate days between start and end date
        const startDate = filter.startDate ? new Date(filter.startDate) : (diaperLogs.length > 0 ? diaperLogs[0].date : new Date());
        const endDate = filter.endDate ? new Date(filter.endDate) : (diaperLogs.length > 0 ? diaperLogs[diaperLogs.length - 1].date : new Date());
        const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

        return {
            totalChanges: diaperLogs.length,
            averageChangesPerDay: Math.round((diaperLogs.length / daysDiff) * 100) / 100,
            diaperTypeBreakdown,
            dailyPatterns: Array.from(dailyPatterns.values()),
            hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
                hour,
                changeCount: hourlyDistribution.get(hour) || 0,
            })),
        };
    }

    async getSleepAnalytics(babyId: number, filter: AnalyticsFilterDto): Promise<SleepAnalytics> {
        const whereClause: any = { babyId };

        if (filter.startDate || filter.endDate) {
            whereClause.date = {};
            if (filter.startDate) whereClause.date.gte = new Date(filter.startDate);
            if (filter.endDate) whereClause.date.lte = new Date(filter.endDate);
        }

        const sleepLogs = await this.prisma.sleepLog.findMany({
            where: whereClause,
            orderBy: { date: 'asc' },
        });

        let totalSleepMinutes = 0;
        let longestSessionMinutes = 0;
        let shortestSessionMinutes = Infinity;

        const locationBreakdown = { CRIB: 0, BED: 0, STROLLER: 0, OTHER: 0 };
        const dailyPatterns = new Map<string, any>();
        const qualityTrends = new Map<string, any>();

        sleepLogs.forEach(log => {
            // Calculate sleep duration
            const durationMs = log.endTime.getTime() - log.startTime.getTime();
            const durationMinutes = durationMs / (1000 * 60);
            totalSleepMinutes += durationMinutes;

            // Track longest/shortest sessions
            longestSessionMinutes = Math.max(longestSessionMinutes, durationMinutes);
            shortestSessionMinutes = Math.min(shortestSessionMinutes, durationMinutes);

            // Count locations
            locationBreakdown[log.location]++;

            // Daily patterns
            const dateKey = log.date.toISOString().split('T')[0];
            if (!dailyPatterns.has(dateKey)) {
                dailyPatterns.set(dateKey, {
                    date: dateKey,
                    sessionCount: 0,
                    totalHours: 0,
                    averageSessionMinutes: 0,
                });
            }
            const dayData = dailyPatterns.get(dateKey);
            dayData.sessionCount++;
            dayData.totalHours += durationMinutes / 60;

            // Quality trends
            if (!qualityTrends.has(dateKey)) {
                qualityTrends.set(dateKey, {
                    date: dateKey,
                    sessionCount: 0,
                    totalHours: 0,
                    averageQuality: '',
                });
            }
            const qualityData = qualityTrends.get(dateKey);
            qualityData.sessionCount++;
            qualityData.totalHours += durationMinutes / 60;
            if (log.sleepQuality) {
                qualityData.averageQuality = log.sleepQuality; // Simplified - could be more complex
            }
        });

        // Calculate averages for daily patterns
        dailyPatterns.forEach(dayData => {
            dayData.averageSessionMinutes = dayData.sessionCount > 0
                ? Math.round((dayData.totalHours * 60) / dayData.sessionCount)
                : 0;
            dayData.totalHours = Math.round(dayData.totalHours * 100) / 100;
        });

        return {
            totalSleepSessions: sleepLogs.length,
            totalSleepHours: Math.round((totalSleepMinutes / 60) * 100) / 100,
            averageSleepHours: sleepLogs.length > 0 ? Math.round((totalSleepMinutes / 60 / sleepLogs.length) * 100) / 100 : 0,
            averageSessionDurationMinutes: sleepLogs.length > 0 ? Math.round(totalSleepMinutes / sleepLogs.length) : 0,
            longestSleepSessionMinutes: longestSessionMinutes === 0 ? 0 : Math.round(longestSessionMinutes),
            shortestSleepSessionMinutes: shortestSessionMinutes === Infinity ? 0 : Math.round(shortestSessionMinutes),
            locationBreakdown,
            sleepQualityTrends: Array.from(qualityTrends.values()),
            dailyPatterns: Array.from(dailyPatterns.values()),
        };
    }

    async getCombinedAnalytics(babyId: number, filter: AnalyticsFilterDto) {
        const [feedAnalytics, diaperAnalytics, sleepAnalytics] = await Promise.all([
            this.getFeedAnalytics(babyId, filter),
            this.getDiaperAnalytics(babyId, filter),
            this.getSleepAnalytics(babyId, filter),
        ]);

        return {
            babyId,
            dateRange: {
                startDate: filter.startDate,
                endDate: filter.endDate,
            },
            feeding: feedAnalytics,
            diaper: diaperAnalytics,
            sleep: sleepAnalytics,
            generatedAt: new Date().toISOString(),
        };
    }

    // Helper method for pagination
    createPaginatedResponse<T>(
        data: T[],
        page: number,
        limit: number,
        totalItems: number,
    ): PaginatedResponse<T> {
        const totalPages = Math.ceil(totalItems / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return {
            data,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit,
                hasNextPage,
                hasPreviousPage,
            },
        };
    }
}
