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
exports.FeedLogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FeedLogsService = class FeedLogsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createFeedLogDto) {
        const baby = await this.prisma.baby.findUnique({
            where: { id: createFeedLogDto.babyId },
        });
        if (!baby) {
            throw new common_1.NotFoundException(`Baby with ID ${createFeedLogDto.babyId} not found`);
        }
        const feedLogData = {
            ...createFeedLogDto,
            feedingDate: new Date(createFeedLogDto.feedingDate),
            startTime: new Date(createFeedLogDto.startTime),
            endTime: new Date(createFeedLogDto.endTime),
        };
        return this.prisma.feedLog.create({
            data: feedLogData,
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
        return this.prisma.feedLog.findMany({
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
            orderBy: { feedingDate: 'desc' },
        });
    }
    async findOne(id) {
        const feedLog = await this.prisma.feedLog.findUnique({
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
        if (!feedLog) {
            throw new common_1.NotFoundException(`Feed log with ID ${id} not found`);
        }
        return feedLog;
    }
    async findByBabyId(babyId) {
        const baby = await this.prisma.baby.findUnique({
            where: { id: babyId },
        });
        if (!baby) {
            throw new common_1.NotFoundException(`Baby with ID ${babyId} not found`);
        }
        return this.prisma.feedLog.findMany({
            where: { babyId },
            orderBy: { feedingDate: 'desc' },
        });
    }
    async findByBabyIdAndDateRange(babyId, startDate, endDate) {
        const baby = await this.prisma.baby.findUnique({
            where: { id: babyId },
        });
        if (!baby) {
            throw new common_1.NotFoundException(`Baby with ID ${babyId} not found`);
        }
        return this.prisma.feedLog.findMany({
            where: {
                babyId,
                feedingDate: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            orderBy: { feedingDate: 'desc' },
        });
    }
    async findByFeedType(feedType) {
        return this.prisma.feedLog.findMany({
            where: { feedType },
            include: {
                baby: {
                    select: {
                        id: true,
                        name: true,
                        gender: true,
                    },
                },
            },
            orderBy: { feedingDate: 'desc' },
        });
    }
    async update(id, updateFeedLogDto) {
        const existingFeedLog = await this.prisma.feedLog.findUnique({
            where: { id },
        });
        if (!existingFeedLog) {
            throw new common_1.NotFoundException(`Feed log with ID ${id} not found`);
        }
        const feedLogData = { ...updateFeedLogDto };
        if (feedLogData.feedingDate) {
            feedLogData.feedingDate = new Date(feedLogData.feedingDate);
        }
        if (feedLogData.startTime) {
            feedLogData.startTime = new Date(feedLogData.startTime);
        }
        if (feedLogData.endTime) {
            feedLogData.endTime = new Date(feedLogData.endTime);
        }
        return this.prisma.feedLog.update({
            where: { id },
            data: feedLogData,
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
        const existingFeedLog = await this.prisma.feedLog.findUnique({
            where: { id },
        });
        if (!existingFeedLog) {
            throw new common_1.NotFoundException(`Feed log with ID ${id} not found`);
        }
        return this.prisma.feedLog.delete({
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
        return this.prisma.feedLog.deleteMany({
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
            whereClause.feedingDate = {};
            if (filters.startDate)
                whereClause.feedingDate.gte = new Date(filters.startDate);
            if (filters.endDate)
                whereClause.feedingDate.lte = new Date(filters.endDate);
        }
        const [feedLogs, totalCount] = await Promise.all([
            this.prisma.feedLog.findMany({
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
                orderBy: { feedingDate: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.feedLog.count({ where: whereClause }),
        ]);
        return this.createPaginatedResponse(feedLogs, page, limit, totalCount);
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
exports.FeedLogsService = FeedLogsService;
exports.FeedLogsService = FeedLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeedLogsService);
//# sourceMappingURL=feed-logs.service.js.map