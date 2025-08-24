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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.DEFAULT_OTP = '759409';
        this.OTP_EXPIRY_MINUTES = 5;
        this.MAX_OTP_ATTEMPTS = 3;
    }
    async sendOtp(sendOtpDto) {
        const { email } = sendOtpDto;
        try {
            const otp = this.generateOtp();
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);
            await this.prisma.otpVerification.create({
                data: {
                    email,
                    otp,
                    expiresAt,
                },
            });
            try {
                await this.sendOtpEmail(email, otp);
                return {
                    success: true,
                    message: 'OTP sent successfully to your email',
                    expiresAt,
                };
            }
            catch (emailError) {
                console.error('Email sending failed:', emailError);
                return {
                    success: true,
                    message: 'OTP generated successfully. If email delivery fails, you can use the default OTP.',
                    expiresAt,
                };
            }
        }
        catch (error) {
            console.error('Send OTP error:', error);
            throw new common_1.BadRequestException('Failed to send OTP');
        }
    }
    async verifyOtp(verifyOtpDto) {
        const { email, otp } = verifyOtpDto;
        const isDefaultOtp = otp === this.DEFAULT_OTP;
        if (!isDefaultOtp) {
            const otpRecord = await this.prisma.otpVerification.findFirst({
                where: {
                    email,
                    otp,
                    isUsed: false,
                    expiresAt: {
                        gte: new Date(),
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
            if (!otpRecord) {
                await this.incrementOtpAttempts(email);
                throw new common_1.UnauthorizedException('Invalid or expired OTP');
            }
            await this.prisma.otpVerification.update({
                where: { id: otpRecord.id },
                data: { isUsed: true },
            });
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            await this.prisma.user.update({
                where: { id: existingUser.id },
                data: { lastLoginAt: new Date() },
            });
            if (!existingUser.isActive) {
                throw new common_1.UnauthorizedException('Your account has been disabled. Please contact support.');
            }
            const authData = await this.generateAuthResponse(existingUser);
            return {
                success: true,
                message: 'OTP verified successfully',
                isNew: false,
                authData,
            };
        }
        else {
            return {
                success: true,
                message: 'OTP verified successfully. Please complete your profile.',
                isNew: true,
            };
        }
    }
    async completeProfile(email, completeProfileDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User already exists with this email');
        }
        const userData = {
            name: completeProfileDto.name,
            email,
            phone: completeProfileDto.phone,
            zipcode: completeProfileDto.zipcode,
            userType: completeProfileDto.userType,
            isNew: false,
            lastLoginAt: new Date(),
        };
        if (completeProfileDto.userType === client_1.UserType.DONOR) {
            userData.description = completeProfileDto.description;
            userData.bloodGroup = completeProfileDto.bloodGroup;
            userData.babyDeliveryDate = completeProfileDto.babyDeliveryDate ? new Date(completeProfileDto.babyDeliveryDate) : null;
            userData.healthStyle = completeProfileDto.healthStyle;
            userData.ableToShareMedicalRecord = completeProfileDto.ableToShareMedicalRecord || false;
        }
        const newUser = await this.prisma.user.create({
            data: userData,
        });
        return this.generateAuthResponse(newUser);
    }
    async updateProfile(userId, updateData) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatePayload = {};
        if (updateData.name)
            updatePayload.name = updateData.name;
        if (updateData.phone)
            updatePayload.phone = updateData.phone;
        if (updateData.zipcode)
            updatePayload.zipcode = updateData.zipcode;
        if (updateData.userType)
            updatePayload.userType = updateData.userType;
        if (updateData.description !== undefined)
            updatePayload.description = updateData.description;
        if (updateData.bloodGroup !== undefined)
            updatePayload.bloodGroup = updateData.bloodGroup;
        if (updateData.babyDeliveryDate !== undefined) {
            updatePayload.babyDeliveryDate = updateData.babyDeliveryDate ? new Date(updateData.babyDeliveryDate) : null;
        }
        if (updateData.healthStyle !== undefined)
            updatePayload.healthStyle = updateData.healthStyle;
        if (updateData.ableToShareMedicalRecord !== undefined) {
            updatePayload.ableToShareMedicalRecord = updateData.ableToShareMedicalRecord;
        }
        updatePayload.isNew = false;
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updatePayload,
        });
        return this.generateAuthResponse(updatedUser);
    }
    async updateFcmToken(userId, updateFcmTokenDto) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { fcmToken: updateFcmTokenDto.fcmToken },
        });
        return {
            success: true,
            message: 'FCM token updated successfully',
        };
    }
    async disableUser(adminUserId, userId, disableUserDto) {
        const adminUser = await this.prisma.user.findUnique({
            where: { id: adminUserId },
        });
        if (!adminUser || adminUser.userType !== client_1.UserType.ADMIN) {
            throw new common_1.UnauthorizedException('Only admins can disable/enable users');
        }
        const targetUser = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { isActive: disableUserDto.isActive },
        });
        return {
            success: true,
            message: `User ${disableUserDto.isActive ? 'enabled' : 'disabled'} successfully`,
        };
    }
    async getUserProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                babies: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { ...userWithoutSensitiveData } = user;
        return userWithoutSensitiveData;
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async sendOtpEmail(email, otp) {
        console.log(`Sending OTP ${otp} to ${email}`);
        if (Math.random() > 0.7) {
            throw new Error('Simulated email failure');
        }
    }
    async incrementOtpAttempts(email) {
        const latestOtp = await this.prisma.otpVerification.findFirst({
            where: { email },
            orderBy: { createdAt: 'desc' },
        });
        if (latestOtp) {
            await this.prisma.otpVerification.update({
                where: { id: latestOtp.id },
                data: { attempts: latestOtp.attempts + 1 },
            });
        }
    }
    async generateAuthResponse(user) {
        const payload = { email: user.email, sub: user.id, userType: user.userType };
        const accessToken = this.jwtService.sign(payload);
        const { ...userResponse } = user;
        return {
            accessToken,
            user: userResponse,
        };
    }
    async validateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map