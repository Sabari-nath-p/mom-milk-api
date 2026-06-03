import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { FirebaseService } from "./firebase.service";
import { SendCustomNotificationDto } from "./dto/notification.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("Firebase Notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post("send-custom")
  @ApiOperation({
    summary: "Send custom push notification to user by phone number",
    description:
      "Send a custom push notification with title and body to a specific user identified by their phone number. Admin only.",
  })
  @ApiResponse({
    status: 200,
    description: "Notification sent successfully",
    schema: {
      example: {
        success: true,
        message: "Notification sent successfully",
        userId: 123,
        phone: "+1234567890",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "User not found or no FCM token registered",
  })
  @ApiResponse({
    status: 500,
    description: "Failed to send notification",
  })
  async sendCustomNotification(@Body() dto: SendCustomNotificationDto) {
    const result = await this.firebaseService.sendCustomNotificationByPhone(
      dto.phone,
      dto.title,
      dto.body,
    );

    return {
      success: true,
      message: "Notification sent successfully",
      ...result,
    };
  }
}
