import { IsEmail, IsString, IsOptional, IsBoolean, Length, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '@prisma/client';

export class SendOtpDto {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    @IsEmail()
    email: string;
}

export class VerifyOtpDto {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '123456', description: '6-digit OTP code' })
    @IsString()
    @Length(6, 6, { message: 'OTP must be 6 digits' })
    otp: string;
}

export class CompleteProfileDto {
    @ApiProperty({ example: 'John Doe', description: 'User full name' })
    @IsString()
    name: string;

    @ApiProperty({ example: '+1234567890', description: 'User phone number' })
    @IsString()
    phone: string;

    @ApiProperty({ example: '12345', description: 'User zipcode' })
    @IsString()
    zipcode: string;

    @ApiProperty({ enum: UserType, example: UserType.BUYER, description: 'User type' })
    @IsEnum(UserType)
    userType: UserType;

    // Donor specific fields (optional)
    @ApiPropertyOptional({ example: 'Healthy lifestyle, organic food', description: 'Description (for donors)' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'O+', description: 'Blood group (for donors)' })
    @IsOptional()
    @IsString()
    bloodGroup?: string;

    @ApiPropertyOptional({ example: '2024-01-15T00:00:00.000Z', description: 'Baby delivery date (for donors)' })
    @IsOptional()
    @IsString()
    babyDeliveryDate?: string;

    @ApiPropertyOptional({ example: '["organic", "vegetarian"]', description: 'Health style as JSON string (for donors)' })
    @IsOptional()
    @IsString()
    healthStyle?: string;

    @ApiPropertyOptional({ example: true, description: 'Able to share medical record (for donors)' })
    @IsOptional()
    @IsBoolean()
    ableToShareMedicalRecord?: boolean;
}

export class UpdateFcmTokenDto {
    @ApiProperty({ example: 'fcm_token_here', description: 'Firebase FCM token for notifications' })
    @IsString()
    fcmToken: string;
}

export class DisableUserDto {
    @ApiProperty({ example: false, description: 'Set user active status' })
    @IsBoolean()
    isActive: boolean;
}

export class AuthResponseDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT access token' })
    accessToken: string;

    @ApiProperty({ description: 'User data' })
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

export class OtpResponseDto {
    @ApiProperty({ example: true, description: 'Whether OTP was sent successfully' })
    success: boolean;

    @ApiProperty({ example: 'OTP sent successfully', description: 'Response message' })
    message: string;

    @ApiPropertyOptional({ example: '2024-01-15T10:05:00.000Z', description: 'OTP expiration time' })
    expiresAt?: Date;
}

export class VerifyOtpResponseDto {
    @ApiProperty({ example: true, description: 'Whether OTP verification was successful' })
    success: boolean;

    @ApiProperty({ example: 'OTP verified successfully', description: 'Response message' })
    message: string;

    @ApiPropertyOptional({ example: true, description: 'Whether user is new (needs to complete profile)' })
    isNew?: boolean;

    @ApiPropertyOptional({ description: 'Auth data (if existing user)' })
    authData?: AuthResponseDto;
}
