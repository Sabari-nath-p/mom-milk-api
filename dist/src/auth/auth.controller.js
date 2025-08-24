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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const admin_guard_1 = require("./guards/admin.guard");
const auth_dto_1 = require("./dto/auth.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async sendOtp(sendOtpDto) {
        return this.authService.sendOtp(sendOtpDto);
    }
    async verifyOtp(verifyOtpDto) {
        return this.authService.verifyOtp(verifyOtpDto);
    }
    async completeProfile(completeProfileDto) {
        const { email, ...profileData } = completeProfileDto;
        return this.authService.completeProfile(email, profileData);
    }
    async getProfile(req) {
        return this.authService.getUserProfile(req.user.id);
    }
    async updateProfile(req, updateData) {
        return this.authService.updateProfile(req.user.id, updateData);
    }
    async updateFcmToken(req, updateFcmTokenDto) {
        return this.authService.updateFcmToken(req.user.id, updateFcmTokenDto);
    }
    async toggleUserStatus(req, userId, disableUserDto) {
        return this.authService.disableUser(req.user.id, userId, disableUserDto);
    }
    async refreshToken(req) {
        const user = await this.authService.validateUser(req.user.id);
        return this.authService.generateAuthResponse(user);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('send-otp'),
    (0, swagger_1.ApiOperation)({ summary: 'Send OTP to email for authentication' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP sent successfully', type: auth_dto_1.OtpResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SendOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendOtp", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify OTP and authenticate user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP verified successfully', type: auth_dto_1.VerifyOtpResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired OTP' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('complete-profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete user profile for new users' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Profile completed successfully', type: auth_dto_1.AuthResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "completeProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated successfully', type: auth_dto_1.AuthResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('fcm-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Update FCM token for push notifications' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'FCM token updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.UpdateFcmTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateFcmToken", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('admin/user/:userId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Enable/disable user (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID to modify' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Admin access required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, auth_dto_1.DisableUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "toggleUserStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh authentication token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token refreshed successfully', type: auth_dto_1.AuthResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map