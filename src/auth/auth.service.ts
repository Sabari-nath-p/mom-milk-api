import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { FirebaseService } from "../firebase/firebase.service";
import { GeolocationService } from "../requests/services/geolocation.service";
import {
  SendOtpDto,
  VerifyOtpDto,
  CompleteProfileDto,
  UpdateFcmTokenDto,
  UpdateLanguageDto,
  DisableUserDto,
  AuthResponseDto,
  OtpResponseDto,
  VerifyOtpResponseDto,
} from "./dto/auth.dto";
import { UserType } from "@prisma/client";

@Injectable()
export class AuthService {
  private readonly DEFAULT_OTP = "759409";
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_OTP_ATTEMPTS = 3;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private firebaseService: FirebaseService,
    private geolocationService: GeolocationService,
  ) {}

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
        await this.mailService.sendOtpEmail(email, otp);
        return {
          success: true,
          message: "OTP sent successfully to your email",
          expiresAt,
        };
      } catch (emailError) {
        // Email failed but don't fail the request - user can use default OTP
        console.error("Email sending failed:", emailError);
        return {
          success: true,
          message:
            "OTP generated successfully. If email delivery fails, you can use the default OTP.",
          expiresAt,
        };
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      throw new BadRequestException("Failed to send OTP");
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
          createdAt: "desc",
        },
      });

      if (!otpRecord) {
        // Increment attempts for the latest OTP
        await this.incrementOtpAttempts(email);
        throw new UnauthorizedException("Invalid or expired OTP");
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
        throw new UnauthorizedException(
          "Your account has been disabled. Please contact support.",
        );
      }

      // Generate token and return user data
      const authData = await this.generateAuthResponse(existingUser);

      return {
        success: true,
        message: "OTP verified successfully",
        isNew: false,
        authData,
      };
    } else {
      // New user - needs to complete profile
      return {
        success: true,
        message: "OTP verified successfully. Please complete your profile.",
        isNew: true,
      };
    }
  }

  async completeProfile(
    email: string,
    completeProfileDto: CompleteProfileDto,
  ): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException("User already exists with this email");
    }

    // Fetch coordinates for the zipcode (this will auto-save to DB if needed)
    // If it fails or returns null, we can proceed but location features might be limited
    let coordinates = null;
    try {
      coordinates = await this.geolocationService.getZipCodeCoordinates(
        completeProfileDto.zipcode,
      );
    } catch (geoError) {
      console.warn(
        `Failed to fetch coordinates for zipcode ${completeProfileDto.zipcode}:`,
        geoError,
      );
      // Continue with profile creation even if geolocation fails
    }

    // If coordinates not found (neither in DB nor Google API), report it
    if (!coordinates) {
      console.log(
        `Zipcode ${completeProfileDto.zipcode} not found. Sending report to admin.`,
      );
      // Don't await this to avoid blocking the user response
      this.mailService
        .sendZipcodeNotFoundEmail(completeProfileDto.zipcode, email)
        .catch((err) =>
          console.error("Failed to send missing zipcode report:", err),
        );
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

    // Add language preference (default: English)
    userData.language = completeProfileDto.language || "English";

    // Add social media links if provided (for all user types)
    if (completeProfileDto.facebookLink) {
      userData.facebookLink = completeProfileDto.facebookLink;
    }
    if (completeProfileDto.instagramLink) {
      userData.instagramLink = completeProfileDto.instagramLink;
    }

    // Add donor-specific fields if user type is DONOR
    if (completeProfileDto.userType === UserType.DONOR) {
      userData.description = completeProfileDto.description;
      userData.bloodGroup = completeProfileDto.bloodGroup;
      userData.babyDeliveryDate = completeProfileDto.babyDeliveryDate
        ? new Date(completeProfileDto.babyDeliveryDate)
        : null;
      if (completeProfileDto.healthStyle) {
        userData.healthStyle = completeProfileDto.healthStyle;
      }
      userData.ableToShareMedicalRecord =
        completeProfileDto.ableToShareMedicalRecord || false;
    }

    const newUser = await this.prisma.user.create({
      data: userData,
    });

    // Notify nearby buyers if new user is a donor
    if (completeProfileDto.userType === UserType.DONOR) {
      await this.notifyNearbyBuyersOfNewDonor(
        newUser.id,
        newUser.name,
        newUser.zipcode,
      );
    }

    return this.generateAuthResponse(newUser);
  }

  async updateProfile(
    userId: number,
    updateData: Partial<CompleteProfileDto>,
  ): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const updatePayload: any = {};

    // Basic fields
    if (updateData.name) updatePayload.name = updateData.name;
    if (updateData.phone) updatePayload.phone = updateData.phone;
    if (updateData.zipcode) updatePayload.zipcode = updateData.zipcode;
    if (updateData.userType) updatePayload.userType = updateData.userType;

    // Language preference
    if (updateData.language !== undefined)
      updatePayload.language = updateData.language;

    // Social media links (for all user types)
    if (updateData.facebookLink !== undefined)
      updatePayload.facebookLink = updateData.facebookLink;
    if (updateData.instagramLink !== undefined)
      updatePayload.instagramLink = updateData.instagramLink;

    // Donor fields
    if (updateData.description !== undefined)
      updatePayload.description = updateData.description;
    if (updateData.bloodGroup !== undefined)
      updatePayload.bloodGroup = updateData.bloodGroup;
    if (updateData.babyDeliveryDate !== undefined) {
      updatePayload.babyDeliveryDate = updateData.babyDeliveryDate
        ? new Date(updateData.babyDeliveryDate)
        : null;
    }
    if (updateData.healthStyle !== undefined)
      updatePayload.healthStyle = updateData.healthStyle;
    if (updateData.ableToShareMedicalRecord !== undefined) {
      updatePayload.ableToShareMedicalRecord =
        updateData.ableToShareMedicalRecord;
    }

    // Set isNew to false when user updates profile
    updatePayload.isNew = false;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updatePayload,
    });

    return this.generateAuthResponse(updatedUser);
  }

  async updateLanguage(
    userId: number,
    language: string,
  ): Promise<{ success: boolean; message: string; language: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { language },
    });

    return {
      success: true,
      message: "Language updated successfully",
      language,
    };
  }

  async updateFcmToken(
    userId: number,
    updateFcmTokenDto: UpdateFcmTokenDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken: updateFcmTokenDto.fcmToken },
    });

    return {
      success: true,
      message: "FCM token updated successfully",
    };
  }

  async disableUser(
    adminUserId: number,
    userId: number,
    disableUserDto: DisableUserDto,
  ): Promise<{ success: boolean; message: string }> {
    // Check if admin user exists and is admin
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminUserId },
    });

    if (!adminUser || adminUser.userType !== UserType.ADMIN) {
      throw new UnauthorizedException("Only admins can disable/enable users");
    }

    // Check if target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      throw new NotFoundException("User not found");
    }

    // Update user status
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: disableUserDto.isActive },
    });

    return {
      success: true,
      message: `User ${disableUserDto.isActive ? "enabled" : "disabled"} successfully`,
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
      throw new NotFoundException("User not found");
    }

    const { ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
  }

  // Private helper methods
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async incrementOtpAttempts(email: string): Promise<void> {
    const latestOtp = await this.prisma.otpVerification.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
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
    const payload = {
      email: user.email,
      sub: user.id,
      userType: user.userType,
    };
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
      throw new UnauthorizedException("User not found or inactive");
    }

    return user;
  }

  /**
   * Notify nearby buyers when a new donor registers
   */
  private async notifyNearbyBuyersOfNewDonor(
    donorId: number,
    donorName: string,
    donorZipcode: string,
  ): Promise<void> {
    try {
      // Get donor's location coordinates
      const donorLocation = await this.prisma.zipCode.findUnique({
        where: { zipcode: donorZipcode },
        select: { latitude: true, longitude: true, country: true },
      });

      if (!donorLocation) {
        console.log(`Zipcode ${donorZipcode} not found in database`);
        return;
      }

      const maxDistanceKm = 50;

      // Get all active buyers
      const buyers = await this.prisma.user.findMany({
        where: {
          userType: UserType.BUYER,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          zipcode: true,
          fcmToken: true,
        },
      });

      // Check distance for each buyer and notify if within 50km
      for (const buyer of buyers) {
        const buyerLocation = await this.prisma.zipCode.findUnique({
          where: { zipcode: buyer.zipcode },
          select: { latitude: true, longitude: true },
        });

        if (!buyerLocation) continue;

        // Calculate distance using Haversine formula
        const distance = this.calculateDistance(
          donorLocation.latitude,
          donorLocation.longitude,
          buyerLocation.latitude,
          buyerLocation.longitude,
        );

        if (distance <= maxDistanceKm) {
          // Send email notification
          try {
            await this.mailService.sendEmail({
              to: buyer.email,
              subject: "New Donor Available in Your Area",
              html: `
                                <h2>Good News, ${buyer.name}!</h2>
                                <p>A new donor, <strong>${donorName}</strong>, is now available in your region.</p>
                            
                                <p>Log in to your account to view their profile and connect with them.</p>
                                <p>Best regards,<br>Mom's Milk Team</p>
                            `,
            });
          } catch (error) {
            console.error(`Failed to send email to buyer ${buyer.id}:`, error);
          }

          // Send push notification if FCM token exists
          if (buyer.fcmToken) {
            try {
              await this.firebaseService.sendNotification({
                token: buyer.fcmToken,
                notification: {
                  title: "New Donor in Your Area",
                  body: `${donorName} is now available in your region`,
                },
                data: {
                  type: "NEW_DONOR",
                  donorId: donorId.toString(),
                  distance: distance.toFixed(1),
                },
              });
            } catch (error) {
              console.error(
                `Failed to send push notification to buyer ${buyer.id}:`,
                error,
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error notifying buyers of new donor:", error);
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
