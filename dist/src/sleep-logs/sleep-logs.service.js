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
exports.SleepLogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SleepLogsService = class SleepLogsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSleepLogDto) {
        const baby = await this.prisma.baby.findUnique({
            where: { id: createSleepLogDto.babyId },
        });
        if (!baby) {
            throw new common_1.NotFoundException(`Baby with ID ${createSleepLogDto.babyId} not found`);
        }
        const sleepLogData = {
            ...createSleepLogDto,
            date: new Date(createSleepLogDto.date),
            startTime: new Date(createSleepLogDto.startTime),
            endTime: new Date(createSleepLogDto.endTime),
        };
        return this.prisma.sleepLog.create({
            data: sleepLogData,
            include: {
                baby: {
                    select: {
                        id: true,
                        name: true,
                        gender: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findAll() {
        return this.prisma.sleepLog.findMany({
            include: {
                baby: {
                    select: {
                        id: true,
                        name: true,
                        gender: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: { date: 'desc' },
        });
    }
    async findOne(id) {
        const sleepLog = await this.prisma.sleepLog.findUnique({
            where: { id },
            include: {
                baby: {
                    select: {
                        id: true,
                        name: true,
                        gender: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        if (!sleepLog) {
            throw new common_1.NotFoundException(`Sleep log with ID ${id} not found`);
        }
        return sleepLog;
    }
    async findByBabyId(babyId) {
        const baby = await this.prisma.baby.findUnique({
            where: { id: babyId },
        });
        if (!baby) {
            throw new common_1.NotFoundException(`Baby with ID ${babyId} not found`);
        }
        return this.prisma.sleepLog.findMany({
            where: { babyId },
            orderBy: { date: 'desc' },
        });
    }
    async findByBabyIdAndDateRange(babyId, startDate, endDate) {
        const baby = await this.prisma.baby.findUnique({
            where: { id: babyId },
        });
        if (!baby) {
            throw new common_1.NotFoundException(`Baby with ID ${babyId} not found`);
        }
        return this.prisma.sleepLog.findMany({
            where: {
                babyId,
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            orderBy: { date: 'desc' },
        });
    }
    async findByLocation(location) {
        return this.prisma.sleepLog.findMany({
            where: { location },
            include: {
                baby: {
                    select: {
                        id: true,
                        name: true,
                        gender: true,
                    },
                },
            },
            orderBy: { date: 'desc' },
        });
    }
    async getSleepDurationAnalytics(babyId, startDate, endDate) {
        const baby = await this.prisma.baby.findUnique({
            where: { id: babyId },
        });
        if (!baby) {
            throw new common_1.NotFoundException(`Baby with ID ${babyId} not found`);
        }
        const sleepLogs = await this.prisma.sleepLog.findMany({
            where: {
                babyId,
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            orderBy: { date: 'desc' },
        });
        const sleepAnalytics = sleepLogs.map((log) => {
            const durationMs = log.endTime.getTime() - log.startTime.getTime();
            const durationHours = durationMs / (1000 * 60 * 60);
            return {
                ...log,
                durationHours: Math.round(durationHours * 100) / 100,
            };
        });
        const totalHours = sleepAnalytics.reduce((sum, log) => sum + log.durationHours, 0);
        const averageSleepHours = sleepAnalytics.length > 0
            ? Math.round((totalHours / sleepAnalytics.length) * 100) / 100
            : 0;
        return {
            sleepLogs: sleepAnalytics,
            analytics: {
                totalSleepSessions: sleepAnalytics.length,
                totalSleepHours: Math.round(totalHours * 100) / 100,
                averageSleepHours,
            },
        };
    }
    async update(id, updateSleepLogDto) {
        const existingSleepLog = await this.prisma.sleepLog.findUnique({
            where: { id },
        });
        if (!existingSleepLog) {
            throw new common_1.NotFoundException(`Sleep log with ID ${id} not found`);
        }
        const sleepLogData = { ...updateSleepLogDto };
        if (sleepLogData.date) {
            sleepLogData.date = new Date(sleepLogData.date);
        }
        if (sleepLogData.startTime) {
            sleepLogData.startTime = new Date(sleepLogData.startTime);
        }
        if (sleepLogData.endTime) {
            sleepLogData.endTime = new Date(sleepLogData.endTime);
        }
        return this.prisma.sleepLog.update({
            where: { id },
            data: sleepLogData,
            include: {
                baby: {
                    select: {
                        id: true,
                        name: true,
                        gender: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async remove(id) {
        const existingSleepLog = await this.prisma.sleepLog.findUnique({
            where: { id },
        });
        if (!existingSleepLog) {
            throw new common_1.NotFoundException(`Sleep log with ID ${id} not found`);
        }
        return this.prisma.sleepLog.delete({
            where: { id },
        });
    }
    async removeAllByBabyId(babyId) {
        const baby = await this.prisma.baby.findUnique({
            where: { id: babyId },
        });
        if (!baby) {
            throw new common_1.NotFoundException(`Baby with ID ${babyId} not found`);
        }
        return this.prisma.sleepLog.deleteMany({
            where: { babyId },
        });
    }
    async findAllPaginated(pagination, filters) {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;
        const whereClause = {};
        if (filters?.babyId) {
            whereClause.babyId = filters.babyId;
        }
        if (filters?.startDate || filters?.endDate) {
            whereClause.date = {};
            if (filters.startDate)
                whereClause.date.gte = new Date(filters.startDate);
            if (filters.endDate)
                whereClause.date.lte = new Date(filters.endDate);
        }
        const [sleepLogs, totalCount] = await Promise.all([
            this.prisma.sleepLog.findMany({
                where: whereClause,
                include: {
                    baby: {
                        select: {
                            id: true,
                            name: true,
                            gender: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { date: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.sleepLog.count({ where: whereClause }),
        ]);
        return this.createPaginatedResponse(sleepLogs, page, limit, totalCount);
    }
    async findByBabyIdPaginated(babyId, pagination, filters) {
        const baby = await this.prisma.baby.findUnique({
            where: { id: babyId },
        });
        if (!baby) {
            throw new common_1.NotFoundException(`Baby with ID ${babyId} not found`);
        }
        return this.findAllPaginated(pagination, { ...filters, babyId });
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
exports.SleepLogsService = SleepLogsService;
exports.SleepLogsService = SleepLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SleepLogsService);
//# sourceMappingURL=sleep-logs.service.js.map