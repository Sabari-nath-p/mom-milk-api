"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFeedAnalytics(babyId, filter) {
        const whereClause = { babyId };
        if (filter.startDate || filter.endDate) {
            whereClause.feedingDate = {};
            if (filter.startDate)
                whereClause.feedingDate.gte = new Date(filter.startDate);
            if (filter.endDate)
                whereClause.feedingDate.lte = new Date(filter.endDate);
        }
        const feedLogs = await this.prisma.feedLog.findMany({
            where: whereClause,
            orderBy: { feedingDate: 'asc' },
        });
        let totalFeedTimeMinutes = 0;
        let totalAmountMl = 0;
        let amountCount = 0;
        const feedMethodCount = { BREAST: 0, BOTTLE: 0, OTHER: 0 };
        const positionBreakdown = { LEFT: 0, RIGHT: 0, BOTH: 0, NOT_SPECIFIED: 0 };
        const dailyPatterns = new Map();
        feedLogs.forEach(log => {
            const durationMs = log.endTime.getTime() - log.startTime.getTime();
            const durationMinutes = durationMs / (1000 * 60);
            totalFeedTimeMinutes += durationMinutes;
            feedMethodCount[log.feedType]++;
            if (log.position) {
                positionBreakdown[log.position]++;
            }
            else {
                positionBreakdown.NOT_SPECIFIED++;
            }
            if (log.amount) {
                totalAmountMl += log.amount;
                amountCount++;
            }
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
    async getDiaperAnalytics(babyId, filter) {
        const whereClause = { babyId };
        if (filter.startDate || filter.endDate) {
            whereClause.date = {};
            if (filter.startDate)
                whereClause.date.gte = new Date(filter.startDate);
            if (filter.endDate)
                whereClause.date.lte = new Date(filter.endDate);
        }
        const diaperLogs = await this.prisma.diaperLog.findMany({
            where: whereClause,
            orderBy: { date: 'asc' },
        });
        const diaperTypeBreakdown = { SOLID: 0, LIQUID: 0, BOTH: 0 };
        const dailyPatterns = new Map();
        const hourlyDistribution = new Map();
        diaperLogs.forEach(log => {
            diaperTypeBreakdown[log.diaperType]++;
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
            const hour = log.time.getHours();
            hourlyDistribution.set(hour, (hourlyDistribution.get(hour) || 0) + 1);
        });
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
    async getSleepAnalytics(babyId, filter) {
        const whereClause = { babyId };
        if (filter.startDate || filter.endDate) {
            whereClause.date = {};
            if (filter.startDate)
                whereClause.date.gte = new Date(filter.startDate);
            if (filter.endDate)
                whereClause.date.lte = new Date(filter.endDate);
        }
        const sleepLogs = await this.prisma.sleepLog.findMany({
            where: whereClause,
            orderBy: { date: 'asc' },
        });
        let totalSleepMinutes = 0;
        let longestSessionMinutes = 0;
        let shortestSessionMinutes = Infinity;
        const locationBreakdown = { CRIB: 0, BED: 0, STROLLER: 0, OTHER: 0 };
        const dailyPatterns = new Map();
        const qualityTrends = new Map();
        sleepLogs.forEach(log => {
            const durationMs = log.endTime.getTime() - log.startTime.getTime();
            const durationMinutes = durationMs / (1000 * 60);
            totalSleepMinutes += durationMinutes;
            longestSessionMinutes = Math.max(longestSessionMinutes, durationMinutes);
            shortestSessionMinutes = Math.min(shortestSessionMinutes, durationMinutes);
            locationBreakdown[log.location]++;
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
                qualityData.averageQuality = log.sleepQuality;
            }
        });
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
    async getCombinedAnalytics(babyId, filter) {
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
    createPaginatedResponse(data, page, limit, totalItems) {
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
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map