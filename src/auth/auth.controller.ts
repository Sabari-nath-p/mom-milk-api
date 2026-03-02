import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
    Get,
    Patch,
    Param,
    ParseIntPipe
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('send-otp')
    @ApiOperation({ summary: 'Send OTP to email for authentication' })
    @ApiResponse({ status: 200, description: 'OTP sent successfully', type: OtpResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async sendOtp(@Body() sendOtpDto: SendOtpDto): Promise<OtpResponseDto> {
        return this.authService.sendOtp(sendOtpDto);
    }

    @Post('verify-otp')
    @ApiOperation({ summary: 'Verify OTP and authenticate user' })
    @ApiResponse({ status: 200, description: 'OTP verified successfully', type: VerifyOtpResponseDto })
    @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
        return this.authService.verifyOtp(verifyOtpDto);
    }

    @Post('complete-profile')
    @ApiOperation({ summary: 'Complete user profile for new users' })
    @ApiResponse({ status: 201, description: 'Profile completed successfully', type: AuthResponseDto })
    @ApiResponse({ status: 409, description: 'User already exists' })
    async completeProfile(
        @Body() completeProfileDto: CompleteProfileDto & { email: string }
    ): Promise<AuthResponseDto> {
        const { email, ...profileData } = completeProfileDto;
        return this.authService.completeProfile(email, profileData);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('profile')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getProfile(@Request() req) {
        return this.authService.getUserProfile(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch('profile')
    @ApiOperation({ summary: 'Update user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully', type: AuthResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async updateProfile(
        @Request() req,
        @Body() updateData: Partial<CompleteProfileDto>
    ): Promise<AuthResponseDto> {
        return this.authService.updateProfile(req.user.id, updateData);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch('fcm-token')
    @ApiOperation({ summary: 'Update FCM token for push notifications' })
    @ApiResponse({ status: 200, description: 'FCM token updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async updateFcmToken(
        @Request() req,
        @Body() updateFcmTokenDto: UpdateFcmTokenDto
    ): Promise<{ success: boolean; message: string }> {
        return this.authService.updateFcmToken(req.user.id, updateFcmTokenDto);
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @Patch('admin/user/:userId/status')
    @ApiOperation({ summary: 'Enable/disable user (Admin only)' })
    @ApiParam({ name: 'userId', description: 'User ID to modify' })
    @ApiResponse({ status: 200, description: 'User status updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async toggleUserStatus(
        @Request() req,
        @Param('userId', ParseIntPipe) userId: number,
        @Body() disableUserDto: DisableUserDto
    ): Promise<{ success: boolean; message: string }> {
        return this.authService.disableUser(req.user.id, userId, disableUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('refresh')
    @ApiOperation({ summary: 'Refresh authentication token' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: AuthResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async refreshToken(@Request() req): Promise<AuthResponseDto> {
        const user = await this.authService.validateUser(req.user.id);
        return this.authService.generateAuthResponse(user);
    }
}
