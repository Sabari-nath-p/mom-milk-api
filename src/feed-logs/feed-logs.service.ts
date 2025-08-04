import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedLogDto, UpdateFeedLogDto, FeedType } from './dto/feed-log.dto';
import { PaginationDto, PaginatedResponse } from '../analytics/dto/analytics.dto';

@Injectable()
export class FeedLogsService {
    constructor(private prisma: PrismaService) { }

    async create(createFeedLogDto: CreateFeedLogDto) {
        // Check if baby exists
        const baby = await this.prisma.baby.findUnique({
            where: { id: createFeedLogDto.babyId },
        });

        if (!baby) {
            throw new NotFoundException(`Baby with ID ${createFeedLogDto.babyId} not found`);
        }

        // Convert date strings to Date objects
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

    async findOne(id: number) {
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
            throw new NotFoundException(`Feed log with ID ${id} not found`);
        }

        return feedLog;
    }

    async findByBabyId(babyId: number) {
        // Check if baby exists
        const baby = await this.prisma.baby.findUnique({
            where: { id: babyId },
        });

        if (!baby) {
            throw new NotFoundException(`Baby with ID ${babyId} not found`);
        }

        return this.prisma.feedLog.findMany({
            where: { babyId },
            orderBy: { feedingDate: 'desc' },
        });
    }

    async findByBabyIdAndDateRange(babyId: number, startDate: string, endDate: string) {
        const baby = await this.prisma.baby.findUnique({
            where: { id: babyId },
        });

        if (!baby) {
            throw new NotFoundException(`Baby with ID ${babyId} not found`);
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

    async findByFeedType(feedType: FeedType) {
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

    async update(id: number, updateFeedLogDto: UpdateFeedLogDto) {
        // Check if feed log exists
        const existingFeedLog = await this.prisma.feedLog.findUnique({
            where: { id },
        });

        if (!existingFeedLog) {
            throw new NotFoundException(`Feed log with ID ${id} not found`);
        }

        // Convert date strings to Date objects if provided
        const feedLogData: any = { ...updateFeedLogDto };
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

    async remove(id: number) {
        // Check if feed log exists
        const existingFeedLog = await this.prisma.feedLog.findUnique({
            where: { id },
        });

        if (!existingFeedLog) {
            throw new NotFoundException(`Feed log with ID ${id} not found`);
        }

        return this.prisma.feedLog.delete({
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

        return this.prisma.feedLog.deleteMany({
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
            whereClause.feedingDate = {};
            if (filters.startDate) whereClause.feedingDate.gte = new Date(filters.startDate);
            if (filters.endDate) whereClause.feedingDate.lte = new Date(filters.endDate);
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
