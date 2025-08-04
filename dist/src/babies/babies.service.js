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
exports.BabiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BabiesService = class BabiesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createBabyDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: createBabyDto.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${createBabyDto.userId} not found`);
        }
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
    async findOne(id) {
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
                    take: 10,
                },
                diaperLogs: {
                    orderBy: { date: 'desc' },
                    take: 10,
                },
                sleepLogs: {
                    orderBy: { date: 'desc' },
                    take: 10,
                },
            },
        });
        if (!baby) {
            throw new common_1.NotFoundException(`Baby with ID ${id} not found`);
        }
        return baby;
    }
    async findByUserId(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        return this.prisma.baby.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByGender(gender) {
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
    async findByBloodGroup(bloodGroup) {
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
    async findByAgeRange(minMonths, maxMonths) {
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
    async update(id, updateBabyDto) {
        const existingBaby = await this.prisma.baby.findUnique({
            where: { id },
        });
        if (!existingBaby) {
            throw new common_1.NotFoundException(`Baby with ID ${id} not found`);
        }
        const babyData = { ...updateBabyDto };
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
    async remove(id) {
        const existingBaby = await this.prisma.baby.findUnique({
            where: { id },
        });
        if (!existingBaby) {
            throw new common_1.NotFoundException(`Baby with ID ${id} not found`);
        }
        return this.prisma.baby.delete({
            where: { id },
        });
    }
    async removeAllByUserId(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        return this.prisma.baby.deleteMany({
            where: { userId },
        });
    }
};
exports.BabiesService = BabiesService;
exports.BabiesService = BabiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BabiesService);
//# sourceMappingURL=babies.service.js.map