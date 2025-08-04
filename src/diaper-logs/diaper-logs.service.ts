import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiaperLogDto, UpdateDiaperLogDto, DiaperType } from './dto/diaper-log.dto';
import { PaginationDto, PaginatedResponse } from '../analytics/dto/analytics.dto';

@Injectable()
export class DiaperLogsService {
    constructor(private prisma: PrismaService) { }

    async create(createDiaperLogDto: CreateDiaperLogDto) {
        // Check if baby exists
        const baby = await this.prisma.baby.findUnique({
            where: { id: createDiaperLogDto.babyId },
        });

        if (!baby) {
            throw new NotFoundException(`Baby with ID ${createDiaperLogDto.babyId} not found`);
        }

        // Convert date strings to Date objects
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

    async findOne(id: number) {
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
            throw new NotFoundException(`Diaper log with ID ${id} not found`);
        }

        return diaperLog;
    }

    async findByBabyId(babyId: number) {
        // Check if baby exists
        const baby = await this.prisma.baby.findUnique({
            where: { id: babyId },
        });

        if (!baby) {
            throw new NotFoundException(`Baby with ID ${babyId} not found`);
        }

        return this.prisma.diaperLog.findMany({
            where: { babyId },
            orderBy: { date: 'desc' },
        });
    }

    async findByBabyIdAndDateRange(babyId: number, startDate: string, endDate: string) {
        const baby = await this.prisma.baby.findUnique({
            where: { id: babyId },
        });

        if (!baby) {
            throw new NotFoundException(`Baby with ID ${babyId} not found`);
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

    async findByDiaperType(diaperType: DiaperType) {
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

    async update(id: number, updateDiaperLogDto: UpdateDiaperLogDto) {
        // Check if diaper log exists
        const existingDiaperLog = await this.prisma.diaperLog.findUnique({
            where: { id },
        });

        if (!existingDiaperLog) {
            throw new NotFoundException(`Diaper log with ID ${id} not found`);
        }

        // Convert date strings to Date objects if provided
        const diaperLogData: any = { ...updateDiaperLogDto };
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

    async remove(id: number) {
        // Check if diaper log exists
        const existingDiaperLog = await this.prisma.diaperLog.findUnique({
            where: { id },
        });

        if (!existingDiaperLog) {
            throw new NotFoundException(`Diaper log with ID ${id} not found`);
        }

        return this.prisma.diaperLog.delete({
            where: { id },
        });
    }

    async removeAllByBabyId(babyId: number) {
        // Check if baby exists
        const baby = await this.prisma.baby.findUnique({
            where: { id: babyId },
        });

        if (!baby) {
            throw new NotFoundException(`Baby with ID ${babyId} not found`);
        }

        return this.prisma.diaperLog.deleteMany({
            where: { babyId },
        });
    }

    // Paginated methods
    async findAllPaginated(pagination: PaginationDto, filters?: {
        startDate?: string;
        endDate?: string;
        babyId?: number
    }): Promise<PaginatedResponse<any>> {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const whereClause: any = {};

        if (filters?.babyId) {
            whereClause.babyId = filters.babyId;
        }

        if (filters?.startDate || filters?.endDate) {
            whereClause.date = {};
            if (filters.startDate) whereClause.date.gte = new Date(filters.startDate);
            if (filters.endDate) whereClause.date.lte = new Date(filters.endDate);
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

    async findByBabyIdPaginated(
        babyId: number,
        pagination: PaginationDto,
        filters?: { startDate?: string; endDate?: string }
    ): Promise<PaginatedResponse<any>> {
        // Check if baby exists
        const baby = await this.prisma.baby.findUnique({
            where: { id: babyId },
        });

        if (!baby) {
            throw new NotFoundException(`Baby with ID ${babyId} not found`);
        }

        return this.findAllPaginated(pagination, { ...filters, babyId });
    }

    // Helper method for pagination
    private createPaginatedResponse<T>(
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
