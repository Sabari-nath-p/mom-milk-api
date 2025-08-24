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
exports.DiaperLogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DiaperLogsService = class DiaperLogsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDiaperLogDto) {
        const baby = await this.prisma.baby.findUnique({
            where: { id: createDiaperLogDto.babyId },
        });
        if (!baby) {
            throw new common_1.NotFoundException(`Baby with ID ${createDiaperLogDto.babyId} not found`);
        }
        const diaperLogData = {
            ...createDiaperLogDto,
            date: new Date(createDiaperLogDto.date),
            time: new Date(createDiaperLogDto.time),
        };
        return this.prisma.diaperLog.create({
            data: diaperLogData,
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
        return this.prisma.diaperLog.findMany({
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
        const diaperLog = await this.prisma.diaperLog.findUnique({
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
        if (!diaperLog) {
            throw new common_1.NotFoundException(`Diaper log with ID ${id} not found`);
        }
        return diaperLog;
    }
    async findByBabyId(babyId) {
        const baby = await this.prisma.baby.findUnique({
            where: { id: babyId },
        });
        if (!baby) {
            throw new common_1.NotFoundException(`Baby with ID ${babyId} not found`);
        }
        return this.prisma.diaperLog.findMany({
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
        return this.prisma.diaperLog.findMany({
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
    async findByDiaperType(diaperType) {
        return this.prisma.diaperLog.findMany({
            where: { diaperType },
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
    async update(id, updateDiaperLogDto) {
        const existingDiaperLog = await this.prisma.diaperLog.findUnique({
            where: { id },
        });
        if (!existingDiaperLog) {
            throw new common_1.NotFoundException(`Diaper log with ID ${id} not found`);
        }
        const diaperLogData = { ...updateDiaperLogDto };
        if (diaperLogData.date) {
            diaperLogData.date = new Date(diaperLogData.date);
        }
        if (diaperLogData.time) {
            diaperLogData.time = new Date(diaperLogData.time);
        }
        return this.prisma.diaperLog.update({
            where: { id },
            data: diaperLogData,
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
        const existingDiaperLog = await this.prisma.diaperLog.findUnique({
            where: { id },
        });
        if (!existingDiaperLog) {
            throw new common_1.NotFoundException(`Diaper log with ID ${id} not found`);
        }
        return this.prisma.diaperLog.delete({
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
        return this.prisma.diaperLog.deleteMany({
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
        const [diaperLogs, totalCount] = await Promise.all([
            this.prisma.diaperLog.findMany({
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
            this.prisma.diaperLog.count({ where: whereClause }),
        ]);
        return this.createPaginatedResponse(diaperLogs, page, limit, totalCount);
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
exports.DiaperLogsService = DiaperLogsService;
exports.DiaperLogsService = DiaperLogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DiaperLogsService);
//# sourceMappingURL=diaper-logs.service.js.map