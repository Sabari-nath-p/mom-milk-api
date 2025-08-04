import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserType } from './dto/user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        // Validate donor-specific fields if user type is DONOR
        if (createUserDto.userType === UserType.DONOR) {
            if (!createUserDto.description) {
                throw new BadRequestException('Description is required for donor accounts');
            }
            if (!createUserDto.babyDeliveryDate) {
                throw new BadRequestException('Baby delivery date is required for donor accounts');
            }
        }

        // Convert babyDeliveryDate string to Date if provided
        const userData: any = { ...createUserDto };
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

    async findOne(id: number) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                babies: true,
            },
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findByUserType(userType: UserType) {
        return this.prisma.user.findMany({
            where: { userType },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findDonors() {
        return this.prisma.user.findMany({
            where: { userType: UserType.DONOR },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findBuyers() {
        return this.prisma.user.findMany({
            where: { userType: UserType.BUYER },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findAdmins() {
        return this.prisma.user.findMany({
            where: { userType: UserType.ADMIN },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findDonorsByZipcode(zipcode: string) {
        return this.prisma.user.findMany({
            where: {
                userType: UserType.DONOR,
                zipcode: zipcode,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findDonorsWillingToShareMedicalRecord() {
        return this.prisma.user.findMany({
            where: {
                userType: UserType.DONOR,
                ableToShareMedicalRecord: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        // Convert babyDeliveryDate string to Date if provided
        const userData: any = { ...updateUserDto };
        if (userData.babyDeliveryDate) {
            userData.babyDeliveryDate = new Date(userData.babyDeliveryDate);
        }

        return this.prisma.user.update({
            where: { id },
            data: userData,
        });
    }

    async remove(id: number) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
}
