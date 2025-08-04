import { UserType } from '@prisma/client';
export declare class SendOtpDto {
    email: string;
}
export declare class VerifyOtpDto {
    email: string;
    otp: string;
}
export declare class CompleteProfileDto {
    name: string;
    phone: string;
    zipcode: string;
    userType: UserType;
    description?: string;
    bloodGroup?: string;
    babyDeliveryDate?: string;
    healthStyle?: string;
    ableToShareMedicalRecord?: boolean;
}
export declare class UpdateFcmTokenDto {
    fcmToken: string;
}
export declare class DisableUserDto {
    isActive: boolean;
}
export declare class AuthResponseDto {
    accessToken: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string;
        zipcode: string;
        userType: UserType;
        isNew: boolean;
        isActive: boolean;
        fcmToken?: string;
        lastLoginAt?: Date;
        createdAt: Date;
        updatedAt: Date;
    };
}
export declare class OtpResponseDto {
    success: boolean;
    message: string;
    expiresAt?: Date;
}
export declare class VerifyOtpResponseDto {
    success: boolean;
    message: string;
    isNew?: boolean;
    authData?: AuthResponseDto;
}
