import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto, CompleteProfileDto, UpdateFcmTokenDto, DisableUserDto, AuthResponseDto, OtpResponseDto, VerifyOtpResponseDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    sendOtp(sendOtpDto: SendOtpDto): Promise<OtpResponseDto>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<VerifyOtpResponseDto>;
    completeProfile(completeProfileDto: CompleteProfileDto & {
        email: string;
    }): Promise<AuthResponseDto>;
    getProfile(req: any): Promise<{
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
    updateProfile(req: any, updateData: Partial<CompleteProfileDto>): Promise<AuthResponseDto>;
    updateFcmToken(req: any, updateFcmTokenDto: UpdateFcmTokenDto): Promise<{
        success: boolean;
        message: string;
    }>;
    toggleUserStatus(req: any, userId: number, disableUserDto: DisableUserDto): Promise<{
        success: boolean;
        message: string;
    }>;
    refreshToken(req: any): Promise<AuthResponseDto>;
}
