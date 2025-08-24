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
exports.VerifyOtpResponseDto = exports.OtpResponseDto = exports.AuthResponseDto = exports.DisableUserDto = exports.UpdateFcmTokenDto = exports.CompleteProfileDto = exports.VerifyOtpDto = exports.SendOtpDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class SendOtpDto {
}
exports.SendOtpDto = SendOtpDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com', description: 'User email address' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SendOtpDto.prototype, "email", void 0);
class VerifyOtpDto {
}
exports.VerifyOtpDto = VerifyOtpDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com', description: 'User email address' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456', description: '6-digit OTP code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(6, 6, { message: 'OTP must be 6 digits' }),
    __metadata("design:type", String)
], VerifyOtpDto.prototype, "otp", void 0);
class CompleteProfileDto {
}
exports.CompleteProfileDto = CompleteProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe', description: 'User full name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+1234567890', description: 'User phone number' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12345', description: 'User zipcode' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "zipcode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.UserType, example: client_1.UserType.BUYER, description: 'User type' }),
    (0, class_validator_1.IsEnum)(client_1.UserType),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "userType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Healthy lifestyle, organic food', description: 'Description (for donors)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'O+', description: 'Blood group (for donors)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "bloodGroup", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-01-15T00:00:00.000Z', description: 'Baby delivery date (for donors)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "babyDeliveryDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '["organic", "vegetarian"]', description: 'Health style as JSON string (for donors)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "healthStyle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Able to share medical record (for donors)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CompleteProfileDto.prototype, "ableToShareMedicalRecord", void 0);
class UpdateFcmTokenDto {
}
exports.UpdateFcmTokenDto = UpdateFcmTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'fcm_token_here', description: 'Firebase FCM token for notifications' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFcmTokenDto.prototype, "fcmToken", void 0);
class DisableUserDto {
}
exports.DisableUserDto = DisableUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Set user active status' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DisableUserDto.prototype, "isActive", void 0);
class AuthResponseDto {
}
exports.AuthResponseDto = AuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT access token' }),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User data' }),
    __metadata("design:type", Object)
], AuthResponseDto.prototype, "user", void 0);
class OtpResponseDto {
}
exports.OtpResponseDto = OtpResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Whether OTP was sent successfully' }),
    __metadata("design:type", Boolean)
], OtpResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'OTP sent successfully', description: 'Response message' }),
    __metadata("design:type", String)
], OtpResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-01-15T10:05:00.000Z', description: 'OTP expiration time' }),
    __metadata("design:type", Date)
], OtpResponseDto.prototype, "expiresAt", void 0);
class VerifyOtpResponseDto {
}
exports.VerifyOtpResponseDto = VerifyOtpResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Whether OTP verification was successful' }),
    __metadata("design:type", Boolean)
], VerifyOtpResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'OTP verified successfully', description: 'Response message' }),
    __metadata("design:type", String)
], VerifyOtpResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Whether user is new (needs to complete profile)' }),
    __metadata("design:type", Boolean)
], VerifyOtpResponseDto.prototype, "isNew", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Auth data (if existing user)' }),
    __metadata("design:type", AuthResponseDto)
], VerifyOtpResponseDto.prototype, "authData", void 0);
//# sourceMappingURL=auth.dto.js.map