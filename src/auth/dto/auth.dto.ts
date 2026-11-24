import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  Length,
  IsEnum,
  IsArray,
  MinLength,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserType } from "@prisma/client";

export class SendOtpDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  @IsEmail()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "123456", description: "6-digit OTP code" })
  @IsString()
  @Length(6, 6, { message: "OTP must be 6 digits" })
  otp: string;
}

export class CompleteProfileDto {
  @ApiProperty({ example: "John Doe", description: "User full name" })
  @IsString()
  name: string;

  @ApiProperty({ example: "+1234567890", description: "User phone number" })
  @IsString()
  phone: string;

  @ApiProperty({ example: "12345", description: "User zipcode" })
  @IsString()
  zipcode: string;

  @ApiProperty({
    enum: UserType,
    example: UserType.BUYER,
    description: "User type",
  })
  @IsEnum(UserType)
  userType: UserType;

  // Donor specific fields (optional)
  @ApiPropertyOptional({
    example: "Healthy lifestyle, organic food",
    description: "Description (for donors)",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: "O+",
    description: "Blood group (for donors)",
  })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiPropertyOptional({
    example: "2024-01-15T00:00:00.000Z",
    description: "Baby delivery date (for donors)",
  })
  @IsOptional()
  @IsString()
  babyDeliveryDate?: string;

  @ApiPropertyOptional({
    example: '["organic", "vegetarian"]',
    description: "Health style as JSON string (for donors)",
  })
  @IsOptional()
  @IsString()
  healthStyle?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Able to share medical record (for donors)",
  })
  @IsOptional()
  @IsBoolean()
  ableToShareMedicalRecord?: boolean;

  @ApiPropertyOptional({
    example: "English",
    description: "Preferred language (default: English)",
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    example: ["organic", "active"],
    description: "Tags for the user profile",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    example: "https://example.com/photo.jpg",
    description: "Profile photo URL",
  })
  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Available for donation (for donors)",
  })
  @IsOptional()
  @IsBoolean()
  availableForDonation?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: "Availability status",
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  // Social media links (optional for all users)
  @ApiPropertyOptional({
    example: "https://facebook.com/username",
    description: "Facebook profile link",
  })
  @IsOptional()
  @IsString()
  facebookLink?: string;

  @ApiPropertyOptional({
    example: "https://instagram.com/username",
    description: "Instagram profile link",
  })
  @IsOptional()
  @IsString()
  instagramLink?: string;
}

export class CompleteProfileRequestDto extends CompleteProfileDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  @IsEmail()
  email: string;
}

export class UpdateLanguageDto {
  @ApiProperty({ example: "Spanish", description: "Preferred language" })
  @IsString()
  language: string;
}

export class UpdateFcmTokenDto {
  @ApiProperty({
    example: "fcm_token_here",
    description: "Firebase FCM token for notifications",
  })
  @IsString()
  fcmToken: string;
}

export class DisableUserDto {
  @ApiProperty({ example: false, description: "Set user active status" })
  @IsBoolean()
  isActive: boolean;
}

export class AuthResponseDto {
  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "JWT access token",
  })
  accessToken: string;

  @ApiProperty({ description: "User data" })
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
    description?: string;
    bloodGroup?: string;
    babyDeliveryDate?: Date;
    healthStyle?: string;
    tags?: string[];
    ableToShareMedicalRecord?: boolean;
    isAvailable?: boolean;
    availableForDonation?: boolean;
    profilePhoto?: string;
    language?: string;
    facebookLink?: string;
    instagramLink?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export class OtpResponseDto {
  @ApiProperty({
    example: true,
    description: "Whether OTP was sent successfully",
  })
  success: boolean;

  @ApiProperty({
    example: "OTP sent successfully",
    description: "Response message",
  })
  message: string;

  @ApiPropertyOptional({
    example: "2024-01-15T10:05:00.000Z",
    description: "OTP expiration time",
  })
  expiresAt?: Date;
}

export class VerifyOtpResponseDto {
  @ApiProperty({
    example: true,
    description: "Whether OTP verification was successful",
  })
  success: boolean;

  @ApiProperty({
    example: "OTP verified successfully",
    description: "Response message",
  })
  message: string;

  @ApiPropertyOptional({
    example: true,
    description: "Whether user is new (needs to complete profile)",
  })
  isNew?: boolean;

  @ApiPropertyOptional({ description: "Auth data (if existing user)" })
  authData?: AuthResponseDto;
}

export class VendorSendOtpDto {
  @ApiProperty({
    example: "vendor@example.com",
    description: "Registered vendor email address",
  })
  @IsEmail()
  email: string;
}

export class VendorLoginDto {
  @ApiProperty({
    example: "vendor@example.com",
    description: "Registered vendor email address",
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    example: "SecurePass123!",
    description: "Vendor password (required if logging in with password)",
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    example: "759409",
    description: "6-digit OTP code (required if logging in with OTP)",
  })
  @IsOptional()
  @IsString()
  @Length(6, 6, { message: "OTP must be 6 digits" })
  otp?: string;
}

export class VendorPasswordLoginDto {
  @ApiProperty({
    example: "vendor@example.com",
    description: "Registered vendor email address",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "SecurePass123!",
    description: "Vendor account password",
  })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password: string;
}

export class RegisterVendorDto {
  @ApiProperty({
    example: "John Doe",
    description: "Owner / contact person full name",
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: "vendor@example.com",
    description: "Vendor email address",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: "+919876543210",
    description: "Vendor contact phone number",
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: "SecurePass123!",
    description: "Vendor account password (min 6 characters)",
  })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  password: string;

  @ApiProperty({
    example: "Baby Haven Store",
    description: "Vendor store / business name",
  })
  @IsString()
  @MaxLength(100)
  storeName: string;

  @ApiPropertyOptional({
    example: "Quality organic products for babies and mothers",
    description: "Store description or bio",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: "https://example.com/logo.png",
    description: "Store logo image URL",
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({
    example: "600001",
    description: "Store location zipcode",
  })
  @IsString()
  zipcode: string;

  @ApiPropertyOptional({
    example: "123 Market Road, Chennai",
    description: "Store physical address",
  })
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateVendorPasswordDto {
  @ApiPropertyOptional({
    example: "OldPass123!",
    description: "Current password (required if an existing password was set)",
  })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiProperty({
    example: "NewSecurePass123!",
    description: "New password (min 6 characters)",
  })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  newPassword: string;
}

export class VendorProfileResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: "Baby Haven Store" })
  storeName: string;

  @ApiPropertyOptional({ example: "Quality organic products for babies" })
  description?: string;

  @ApiPropertyOptional({ example: "https://example.com/logo.png" })
  logoUrl?: string;

  @ApiProperty({ example: "600001" })
  zipcode: string;

  @ApiPropertyOptional({ example: "123 Market Road" })
  address?: string;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class VendorAuthResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: "Vendor logged in successfully" })
  message: string;

  @ApiProperty({
    description: "Auth token and vendor profile details",
  })
  authData: {
    accessToken: string;
    user: any;
    vendor: VendorProfileResponseDto;
  };
}

export class VendorRegisterResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    example:
      "Vendor registered successfully. OTP sent to your email for verification.",
  })
  message: string;

  @ApiProperty({ example: "vendor@example.com" })
  email: string;

  @ApiPropertyOptional({ example: "2026-11-24T12:10:00.000Z" })
  expiresAt?: Date;
}
