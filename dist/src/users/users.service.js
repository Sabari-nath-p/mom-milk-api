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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const user_dto_1 = require("./dto/user.dto");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        if (createUserDto.userType === user_dto_1.UserType.DONOR) {
            if (!createUserDto.description) {
                throw new common_1.BadRequestException('Description is required for donor accounts');
            }
            if (!createUserDto.babyDeliveryDate) {
                throw new common_1.BadRequestException('Baby delivery date is required for donor accounts');
            }
        }
        const userData = { ...createUserDto };
        if (userData.babyDeliveryDate) {
            userData.babyDeliveryDate = new Date(userData.babyDeliveryDate);
        }
        return this.prisma.user.create({
            data: userData,
        });
    }
    async findAll() {
        return this.prisma.user.findMany({
            include: {
                babies: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                babies: true,
            },
        });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async findByUserType(userType) {
        return this.prisma.user.findMany({
            where: { userType },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findDonors() {
        return this.prisma.user.findMany({
            where: { userType: user_dto_1.UserType.DONOR },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findBuyers() {
        return this.prisma.user.findMany({
            where: { userType: user_dto_1.UserType.BUYER },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAdmins() {
        return this.prisma.user.findMany({
            where: { userType: user_dto_1.UserType.ADMIN },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findDonorsByZipcode(zipcode) {
        return this.prisma.user.findMany({
            where: {
                userType: user_dto_1.UserType.DONOR,
                zipcode: zipcode,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findDonorsWillingToShareMedicalRecord() {
        return this.prisma.user.findMany({
            where: {
                userType: user_dto_1.UserType.DONOR,
                ableToShareMedicalRecord: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(id, updateUserDto) {
        const userData = { ...updateUserDto };
        if (userData.babyDeliveryDate) {
            userData.babyDeliveryDate = new Date(userData.babyDeliveryDate);
        }
        return this.prisma.user.update({
            where: { id },
            data: userData,
        });
    }
    async remove(id) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map