import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import {
    SendOtpDto,
    VerifyOtpDto,
    CompleteProfileDto,
    UpdateFcmTokenDto,
    DisableUserDto,
    AuthResponseDto,
    OtpResponseDto,
    VerifyOtpResponseDto
} from './dto/auth.dto';
import { UserType } from '@prisma/client';

@Injectable()
export class AuthService {
    private readonly DEFAULT_OTP = '759409';
    private readonly OTP_EXPIRY_MINUTES = 5;
    private readonly MAX_OTP_ATTEMPTS = 3;

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async sendOtp(sendOtpDto: SendOtpDto): Promise<OtpResponseDto> {
        const { email } = sendOtpDto;

        try {
            // Generate 6-digit OTP
            const otp = this.generateOtp();
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

            // Save OTP to database
            await this.prisma.otpVerification.create({
                data: {
                    email,
                    otp,
                    expiresAt,
                },
            });

            // Try to send email (don't fail if SMTP fails)
            try {
                await this.sendOtpEmail(email, otp);
                return {
                    success: true,
                    message: 'OTP sent successfully to your email',
                    expiresAt,
                };
            } catch (emailError) {
                // Email failed but don't fail the request - user can use default OTP
                console.error('Email sending failed:', emailError);
                return {
                    success: true,
                    message: 'OTP generated successfully. If email delivery fails, you can use the default OTP.',
                    expiresAt,
                };
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            throw new BadRequestException('Failed to send OTP');
        }
    }

    async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
        const { email, otp } = verifyOtpDto;

        // Check if it's the default bypass OTP
        const isDefaultOtp = otp === this.DEFAULT_OTP;

        if (!isDefaultOtp) {
            // Verify regular OTP
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
                // Increment attempts for the latest OTP
                await this.incrementOtpAttempts(email);
                throw new UnauthorizedException('Invalid or expired OTP');
            }

            // Mark OTP as used
            await this.prisma.otpVerification.update({
                where: { id: otpRecord.id },
                data: { isUsed: true },
            });
        }

        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // Update last login
            await this.prisma.user.update({
                where: { id: existingUser.id },
                data: { lastLoginAt: new Date() },
            });

            // Check if user is active
            if (!existingUser.isActive) {
                throw new UnauthorizedException('Your account has been disabled. Please contact support.');
            }

            // Generate token and return user data
            const authData = await this.generateAuthResponse(existingUser);

            return {
                success: true,
                message: 'OTP verified successfully',
                isNew: false,
                authData,
            };
        } else {
            // New user - needs to complete profile
            return {
                success: true,
                message: 'OTP verified successfully. Please complete your profile.',
                isNew: true,
            };
        }
    }

    async completeProfile(email: string, completeProfileDto: CompleteProfileDto): Promise<AuthResponseDto> {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('User already exists with this email');
        }

        // Create new user
        const userData: any = {
            name: completeProfileDto.name,
            email,
            phone: completeProfileDto.phone,
            zipcode: completeProfileDto.zipcode,
            userType: completeProfileDto.userType,
            isNew: false, // Set to false after profile completion
            lastLoginAt: new Date(),
        };

        // Add donor-specific fields if user type is DONOR
        if (completeProfileDto.userType === UserType.DONOR) {
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

    async updateProfile(userId: number, updateData: Partial<CompleteProfileDto>): Promise<AuthResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const updatePayload: any = {};

        // Basic fields
        if (updateData.name) updatePayload.name = updateData.name;
        if (updateData.phone) updatePayload.phone = updateData.phone;
        if (updateData.zipcode) updatePayload.zipcode = updateData.zipcode;
        if (updateData.userType) updatePayload.userType = updateData.userType;

        // Donor fields
        if (updateData.description !== undefined) updatePayload.description = updateData.description;
        if (updateData.bloodGroup !== undefined) updatePayload.bloodGroup = updateData.bloodGroup;
        if (updateData.babyDeliveryDate !== undefined) {
            updatePayload.babyDeliveryDate = updateData.babyDeliveryDate ? new Date(updateData.babyDeliveryDate) : null;
        }
        if (updateData.healthStyle !== undefined) updatePayload.healthStyle = updateData.healthStyle;
        if (updateData.ableToShareMedicalRecord !== undefined) {
            updatePayload.ableToShareMedicalRecord = updateData.ableToShareMedicalRecord;
        }

        // Set isNew to false when user updates profile
        updatePayload.isNew = false;

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updatePayload,
        });

        return this.generateAuthResponse(updatedUser);
    }

    async updateFcmToken(userId: number, updateFcmTokenDto: UpdateFcmTokenDto): Promise<{ success: boolean; message: string }> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { fcmToken: updateFcmTokenDto.fcmToken },
        });

        return {
            success: true,
            message: 'FCM token updated successfully',
        };
    }

    async disableUser(adminUserId: number, userId: number, disableUserDto: DisableUserDto): Promise<{ success: boolean; message: string }> {
        // Check if admin user exists and is admin
        const adminUser = await this.prisma.user.findUnique({
            where: { id: adminUserId },
        });

        if (!adminUser || adminUser.userType !== UserType.ADMIN) {
            throw new UnauthorizedException('Only admins can disable/enable users');
        }

        // Check if target user exists
        const targetUser = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!targetUser) {
            throw new NotFoundException('User not found');
        }

        // Update user status
        await this.prisma.user.update({
            where: { id: userId },
            data: { isActive: disableUserDto.isActive },
        });

        return {
            success: true,
            message: `User ${disableUserDto.isActive ? 'enabled' : 'disabled'} successfully`,
        };
    }

    async getUserProfile(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                babies: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const { ...userWithoutSensitiveData } = user;
        return userWithoutSensitiveData;
    }

    // Private helper methods
    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private async sendOtpEmail(email: string, otp: string): Promise<void> {
        // Implement email sending logic here
        // This is a placeholder - you would integrate with your email service (NodeMailer, SendGrid, etc.)
        console.log(`Sending OTP ${otp} to ${email}`);

        // Simulate email sending - remove this in production
        if (Math.random() > 0.7) {
            throw new Error('Simulated email failure');
        }
    }

    private async incrementOtpAttempts(email: string): Promise<void> {
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

    // Public method for generating auth response
    async generateAuthResponse(user: any): Promise<AuthResponseDto> {
        const payload = { email: user.email, sub: user.id, userType: user.userType };
        const accessToken = this.jwtService.sign(payload);

        const { ...userResponse } = user;

        return {
            accessToken,
            user: userResponse,
        };
    }

    async validateUser(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('User not found or inactive');
        }

        return user;
    }
}
