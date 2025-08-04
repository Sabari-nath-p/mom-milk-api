import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SendOtpDto, VerifyOtpDto, CompleteProfileDto, UpdateFcmTokenDto, DisableUserDto, AuthResponseDto, OtpResponseDto, VerifyOtpResponseDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private readonly DEFAULT_OTP;
    private readonly OTP_EXPIRY_MINUTES;
    private readonly MAX_OTP_ATTEMPTS;
    constructor(prisma: PrismaService, jwtService: JwtService);
    sendOtp(sendOtpDto: SendOtpDto): Promise<OtpResponseDto>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<VerifyOtpResponseDto>;
    completeProfile(email: string, completeProfileDto: CompleteProfileDto): Promise<AuthResponseDto>;
    updateProfile(userId: number, updateData: Partial<CompleteProfileDto>): Promise<AuthResponseDto>;
    updateFcmToken(userId: number, updateFcmTokenDto: UpdateFcmTokenDto): Promise<{
        success: boolean;
        message: string;
    }>;
    disableUser(adminUserId: number, userId: number, disableUserDto: DisableUserDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserProfile(userId: number): Promise<{
        babies: {
            name: string;
            bloodGroup: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            gender: import(".prisma/client").$Enums.Gender;
            deliveryDate: Date;
            weight: number | null;
            height: number | null;
            userId: number;
        }[];
        name: string;
        email: string;
        phone: string;
        zipcode: string;
        userType: import(".prisma/client").$Enums.UserType;
        isNew: boolean;
        isActive: boolean;
        fcmToken: string | null;
        lastLoginAt: Date | null;
        description: string | null;
        bloodGroup: string | null;
        babyDeliveryDate: Date | null;
        healthStyle: string | null;
        ableToShareMedicalRecord: boolean | null;
        isAvailable: boolean | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    private generateOtp;
    private sendOtpEmail;
    private incrementOtpAttempts;
    generateAuthResponse(user: any): Promise<AuthResponseDto>;
    validateUser(userId: number): Promise<{
        name: string;
        email: string;
        phone: string;
        zipcode: string;
        userType: import(".prisma/client").$Enums.UserType;
        isNew: boolean;
        isActive: boolean;
        fcmToken: string | null;
        lastLoginAt: Date | null;
        description: string | null;
        bloodGroup: string | null;
        babyDeliveryDate: Date | null;
        healthStyle: string | null;
        ableToShareMedicalRecord: boolean | null;
        isAvailable: boolean | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
}
