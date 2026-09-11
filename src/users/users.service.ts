import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto, UpdateUserDto, UserType } from "./dto/user.dto";
import { RequestStatus, MarketplaceListingStatus } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Validate donor-specific fields if user type is DONOR
    if (createUserDto.userType === UserType.DONOR) {
      if (!createUserDto.description) {
        throw new BadRequestException(
          "Description is required for donor accounts",
        );
      }
      if (!createUserDto.babyDeliveryDate) {
        throw new BadRequestException(
          "Baby delivery date is required for donor accounts",
        );
      }
    }

    // Convert babyDeliveryDate string to Date if provided
    const userData: any = { ...createUserDto };
    if (userData.babyDeliveryDate) {
      userData.babyDeliveryDate = new Date(userData.babyDeliveryDate);
    }

    return this.prisma.user.create({
      data: userData,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        babies: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        babies: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async getProfileWithListings(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        zipcode: true,
        description: true,
        profilePhoto: true,
        availableForDonation: true,
        isAvailable: true,
        userType: true,
        bloodGroup: true,
        babyDeliveryDate: true,
        healthStyle: true,
        tags: true,
        ableToShareMedicalRecord: true,
        language: true,
        facebookLink: true,
        instagramLink: true,
        marketplaceListings: {
          where: { status: "ACTIVE" },
          include: {
            images: { orderBy: { sortOrder: "asc" } },
            _count: { select: { savedBy: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async findByUserType(userType: UserType) {
    return this.prisma.user.findMany({
      where: { userType },
      orderBy: { createdAt: "desc" },
    });
  }

  async findDonors() {
    return this.prisma.user.findMany({
      where: { userType: UserType.DONOR },
      orderBy: { createdAt: "desc" },
    });
  }

  async findBuyers() {
    return this.prisma.user.findMany({
      where: { userType: UserType.BUYER },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAdmins() {
    return this.prisma.user.findMany({
      where: { userType: UserType.ADMIN },
      orderBy: { createdAt: "desc" },
    });
  }

  async findDonorsByZipcode(zipcode: string) {
    return this.prisma.user.findMany({
      where: {
        userType: UserType.DONOR,
        zipcode: zipcode,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findDonorsWillingToShareMedicalRecord() {
    return this.prisma.user.findMany({
      where: {
        userType: UserType.DONOR,
        ableToShareMedicalRecord: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ─── Dashboard & Activity Summaries ───────────────────────────────────────

  async getDonorSummary(donorId: number) {
    const [activeListings, pendingRequests, acceptedRequests, totalDonations] = await Promise.all([
      this.prisma.marketplaceListing.count({
        where: { userId: donorId, status: MarketplaceListingStatus.ACTIVE },
      }),
      this.prisma.milkRequest.count({
        where: { donorId: donorId, status: RequestStatus.PENDING },
      }),
      this.prisma.milkRequest.count({
        where: { donorId: donorId, status: RequestStatus.ACCEPTED },
      }),
      this.prisma.milkRequest.count({
        where: { donorId: donorId, status: RequestStatus.COMPLETED },
      }),
    ]);

    return {
      activeListings,
      pendingRequests,
      acceptedRequests,
      totalDonations,
    };
  }

  async getDonorRecentActivity(donorId: number, limit: number = 5) {
    const [recentRequestsCame, recentAcceptancesDone] = await Promise.all([
      this.prisma.milkRequest.findMany({
        where: { donorId: donorId, status: RequestStatus.PENDING },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: { requester: { select: { id: true, name: true, profilePhoto: true } } },
      }),
      this.prisma.milkRequest.findMany({
        where: { donorId: donorId, status: RequestStatus.ACCEPTED },
        orderBy: { acceptedAt: "desc" },
        take: limit,
        include: { requester: { select: { id: true, name: true, profilePhoto: true } } },
      }),
    ]);

    return {
      recentRequestsCame,
      recentAcceptancesDone,
    };
  }

  async getBuyerSummary(buyerId: number) {
    const [activeRequests, pendingAcceptance, acceptedDonors, completedDeliveries] = await Promise.all([
      this.prisma.milkRequest.count({
        where: {
          requesterId: buyerId,
          status: { in: [RequestStatus.PENDING, RequestStatus.ACCEPTED] },
        },
      }),
      this.prisma.milkRequest.count({
        where: { requesterId: buyerId, status: RequestStatus.PENDING },
      }),
      this.prisma.milkRequest.count({
        where: { requesterId: buyerId, status: RequestStatus.ACCEPTED },
      }),
      this.prisma.milkRequest.count({
        where: { requesterId: buyerId, status: RequestStatus.COMPLETED },
      }),
    ]);

    return {
      activeRequests,
      pendingAcceptance,
      acceptedDonors,
      completedDeliveries,
    };
  }

  async getBuyerRecentActivity(buyerId: number, limit: number = 5) {
    const recentRequests = await this.prisma.milkRequest.findMany({
      where: { requesterId: buyerId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { donor: { select: { id: true, name: true, profilePhoto: true } } },
    });

    return {
      recentRequests,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Convert babyDeliveryDate string to Date if provided
    const userData: any = { ...updateUserDto };
    if (userData.babyDeliveryDate) {
      userData.babyDeliveryDate = new Date(userData.babyDeliveryDate);
    }

    return this.prisma.user.update({
      where: { id },
      data: userData,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
