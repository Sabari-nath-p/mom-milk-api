import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSleepLogDto, UpdateSleepLogDto, SleepLocation } from './dto/sleep-log.dto';
import { PaginationDto, PaginatedResponse } from '../analytics/dto/analytics.dto';

@Injectable()
export class SleepLogsService {
    constructor(private prisma: PrismaService) { }

    async create(createSleepLogDto: CreateSleepLogDto) {
        // Check if baby exists
        const baby = await this.prisma.baby.findUnique({
            where: { id: createSleepLogDto.babyId },
        });

        if (!baby) {
            throw new NotFoundException(`Baby with ID ${createSleepLogDto.babyId} not found`);
        }

        // Convert date strings to Date objects
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

    async findOne(id: number) {
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
            throw new NotFoundException(`Sleep log with ID ${id} not found`);
        }

        return sleepLog;
    }

    async findByBabyId(babyId: number) {
        // Check if baby exists
        const baby = await this.prisma.baby.findUnique({
            where: { id: babyId },
        });

        if (!baby) {
            throw new NotFoundException(`Baby with ID ${babyId} not found`);
        }

        return this.prisma.sleepLog.findMany({
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

    async findByLocation(location: SleepLocation) {
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

    async getSleepDurationAnalytics(babyId: number, startDate: string, endDate: string) {
        const baby = await this.prisma.baby.findUnique({
            where: { id: babyId },
        });

        if (!baby) {
            throw new NotFoundException(`Baby with ID ${babyId} not found`);
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

        // Calculate sleep duration for each log
        const sleepAnalytics = sleepLogs.map((log) => {
            const durationMs = log.endTime.getTime() - log.startTime.getTime();
            const durationHours = durationMs / (1000 * 60 * 60);

            return {
                ...log,
                durationHours: Math.round(durationHours * 100) / 100, // Round to 2 decimal places
            };
        });

        // Calculate average sleep duration
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

    async update(id: number, updateSleepLogDto: UpdateSleepLogDto) {
        // Check if sleep log exists
        const existingSleepLog = await this.prisma.sleepLog.findUnique({
            where: { id },
        });

        if (!existingSleepLog) {
            throw new NotFoundException(`Sleep log with ID ${id} not found`);
        }

        // Convert date strings to Date objects if provided
        const sleepLogData: any = { ...updateSleepLogDto };
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

    async remove(id: number) {
        // Check if sleep log exists
        const existingSleepLog = await this.prisma.sleepLog.findUnique({
            where: { id },
        });

        if (!existingSleepLog) {
            throw new NotFoundException(`Sleep log with ID ${id} not found`);
        }

        return this.prisma.sleepLog.delete({
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

        return this.prisma.sleepLog.deleteMany({
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
