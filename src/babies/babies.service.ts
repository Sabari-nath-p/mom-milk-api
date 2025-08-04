import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBabyDto, UpdateBabyDto, Gender } from './dto/baby.dto';

@Injectable()
export class BabiesService {
    constructor(private prisma: PrismaService) { }

    async create(createBabyDto: CreateBabyDto) {
        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { id: createBabyDto.userId },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${createBabyDto.userId} not found`);
        }

        // Convert deliveryDate string to Date
        const babyData = {
            ...createBabyDto,
            deliveryDate: new Date(createBabyDto.deliveryDate),
        };

        return this.prisma.baby.create({
            data: babyData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        userType: true,
                    },
                },
            },
        });
    }

    async findAll() {
        return this.prisma.baby.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        userType: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const baby = await this.prisma.baby.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        userType: true,
                    },
                },
                feedLogs: {
                    orderBy: { feedingDate: 'desc' },
                    take: 10, // Latest 10 feed logs
                },
                diaperLogs: {
                    orderBy: { date: 'desc' },
                    take: 10, // Latest 10 diaper logs
                },
                sleepLogs: {
                    orderBy: { date: 'desc' },
                    take: 10, // Latest 10 sleep logs
                },
            },
        });

        if (!baby) {
            throw new NotFoundException(`Baby with ID ${id} not found`);
        }

        return baby;
    }

    async findByUserId(userId: number) {
        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        return this.prisma.baby.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByGender(gender: Gender) {
        return this.prisma.baby.findMany({
            where: { gender },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        userType: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByBloodGroup(bloodGroup: string) {
        return this.prisma.baby.findMany({
            where: { bloodGroup },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        userType: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByAgeRange(minMonths: number, maxMonths: number) {
        const now = new Date();
        const maxDate = new Date(now.getFullYear(), now.getMonth() - minMonths, now.getDate());
        const minDate = new Date(now.getFullYear(), now.getMonth() - maxMonths, now.getDate());

        return this.prisma.baby.findMany({
            where: {
                deliveryDate: {
                    gte: minDate,
                    lte: maxDate,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        userType: true,
                    },
                },
            },
            orderBy: { deliveryDate: 'desc' },
        });
    }

    async update(id: number, updateBabyDto: UpdateBabyDto) {
        // Check if baby exists
        const existingBaby = await this.prisma.baby.findUnique({
            where: { id },
        });

        if (!existingBaby) {
            throw new NotFoundException(`Baby with ID ${id} not found`);
        }

        // Convert deliveryDate string to Date if provided
        const babyData: any = { ...updateBabyDto };
        if (babyData.deliveryDate) {
            babyData.deliveryDate = new Date(babyData.deliveryDate);
        }

        return this.prisma.baby.update({
            where: { id },
            data: babyData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        userType: true,
                    },
                },
            },
        });
    }

    async remove(id: number) {
        // Check if baby exists
        const existingBaby = await this.prisma.baby.findUnique({
            where: { id },
        });

        if (!existingBaby) {
            throw new NotFoundException(`Baby with ID ${id} not found`);
        }

        return this.prisma.baby.delete({
            where: { id },
        });
    }

    async removeAllByUserId(userId: number) {
        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        return this.prisma.baby.deleteMany({
            where: { userId },
        });
    }
}
