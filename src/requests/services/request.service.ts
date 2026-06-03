import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GeolocationService } from "./geolocation.service";
import { FirebaseService } from "../../firebase/firebase.service";
import { MailService } from "../../mail/mail.service";
import { ChatService } from "../../chat/chat.service";
import {
  CreateMilkRequestDto,
  UpdateMilkRequestDto,
  AcceptRequestDto,
  UpdateAvailabilityDto,
  DonorSearchFiltersDto,
  RequestFiltersDto,
  DonorSearchResultDto,
  MilkRequestResponseDto,
  NotificationDto,
  SendRequestToSpecificDonorDto,
  BuyerSearchFiltersDto,
  BuyerSearchResultDto,
} from "../dto/request.dto";
import { RequestStatus, RequestType, UserType } from "@prisma/client";
import { AdminRequestFiltersDto } from "../dto/admin-request-filters.dto";

@Injectable()
export class RequestService {
  constructor(
    private prisma: PrismaService,
    private geolocationService: GeolocationService,
    private firebaseService: FirebaseService,
    private mailService: MailService,
    private chatService: ChatService,
  ) {}

  // Milk Request Management
  async createRequest(
    userId: number,
    createRequestDto: CreateMilkRequestDto,
  ): Promise<MilkRequestResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const requestData = {
      ...createRequestDto,
      requesterId: userId,
      requesterZipcode: user.zipcode,
      neededBy: createRequestDto.neededBy
        ? new Date(createRequestDto.neededBy)
        : null,
    };

    const request = await this.prisma.milkRequest.create({
      data: requestData,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            userType: true,
          },
        },
      },
    });

    return this.formatRequestResponse(request);
  }

  async getUserRequests(userId: number, filters: RequestFiltersDto) {
    const { page = 1, limit = 10, ...filterOptions } = filters;
    const skip = (page - 1) * limit;

    // Get user info to determine user type
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    let whereClause: any = {};

    // Handle different request types based on user type and filters
    if (filterOptions.requestType === RequestType.MILK_OFFER) {
      if (user.userType === UserType.DONOR) {
        // Donors see their own MILK_OFFER posts
        whereClause.requesterId = userId;
        whereClause.requestType = RequestType.MILK_OFFER;
      } else {
        // Buyers see available MILK_OFFER posts from donors (not their own)
        whereClause.requestType = RequestType.MILK_OFFER;
        whereClause.status = RequestStatus.PENDING;
        // Don't filter by requesterId to show all available offers
      }
    } else if (filterOptions.requestType === RequestType.MILK_REQUEST) {
      // For MILK_REQUEST, show user's own requests
      whereClause.requesterId = userId;
      whereClause.requestType = RequestType.MILK_REQUEST;
    } else {
      // No specific request type filter - show user's own requests
      whereClause.requesterId = userId;
    }

    // Apply other filters
    if (filterOptions.status) whereClause.status = filterOptions.status;
    if (filterOptions.urgency) whereClause.urgency = filterOptions.urgency;

    const [requests, total] = await Promise.all([
      this.prisma.milkRequest.findMany({
        where: whereClause,
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              userType: true,
            },
          },
          donor: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              userType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.milkRequest.count({ where: whereClause }),
    ]);

    return {
      data: requests.map((request) => this.formatRequestResponse(request)),
      pagination: this.createPaginationResponse(page, limit, total),
    };
  }

  async getIncomingRequests(donorId: number, filters: RequestFiltersDto) {
    const { page = 1, limit = 10, ...filterOptions } = filters;
    const skip = (page - 1) * limit;

    // Get donor's zipcode for location-based filtering
    const donor = await this.prisma.user.findUnique({
      where: { id: donorId },
      select: { zipcode: true, userType: true },
    });

    if (!donor) {
      throw new NotFoundException("Donor not found");
    }

    if (donor.userType !== UserType.DONOR) {
      throw new ForbiddenException("Only donors can view incoming requests");
    }

    const whereClause: any = {
      donorId: donorId, // Only show requests specifically sent to this donor
    };

    // Handle status filtering - allow user to filter by specific status or show all relevant statuses
    if (filterOptions.status) {
      whereClause.status = filterOptions.status;
    } else {
      // Default: show PENDING, ACCEPTED, and COMPLETED requests
      whereClause.status = {
        in: [
          RequestStatus.PENDING,
          RequestStatus.ACCEPTED,
          RequestStatus.COMPLETED,
        ],
      };
    }

    // Handle different request types for incoming requests
    if (filterOptions.requestType === RequestType.MILK_OFFER) {
      whereClause.requestType = RequestType.MILK_OFFER;
    } else {
      // Default: show MILK_REQUEST (buyers requesting milk from donors)
      whereClause.requestType = RequestType.MILK_REQUEST;
    }

    if (filterOptions.urgency) whereClause.urgency = filterOptions.urgency;

    const [requests, total] = await Promise.all([
      this.prisma.milkRequest.findMany({
        where: whereClause,
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              userType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.milkRequest.count({ where: whereClause }),
    ]);

    // Calculate distances for each request
    const requestsWithDistance = await Promise.all(
      requests.map(async (request) => {
        const distance = await this.calculateRequestDistance(
          donor.zipcode,
          request.requesterZipcode,
        );
        return {
          ...this.formatRequestResponse(request),
          distance,
        };
      }),
    );

    // Sort by distance
    requestsWithDistance.sort(
      (a, b) => (a.distance || Infinity) - (b.distance || Infinity),
    );

    return {
      data: requestsWithDistance,
      pagination: this.createPaginationResponse(page, limit, total),
    };
  }

  async acceptRequest(
    donorId: number,
    requestId: number,
    acceptDto: AcceptRequestDto,
  ): Promise<MilkRequestResponseDto> {
    const donor = await this.prisma.user.findUnique({
      where: { id: donorId },
      select: {
        id: true,
        userType: true,
        zipcode: true,
        name: true,
        phone: true,
        email: true,
        facebookLink: true,
        instagramLink: true,
      },
    });

    if (!donor) {
      throw new NotFoundException("Donor not found");
    }

    if (donor.userType !== UserType.DONOR) {
      throw new ForbiddenException("Only donors can accept requests");
    }

    const request = await this.prisma.milkRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            userType: true,
            fcmToken: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException("Request not found");
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException("Request is no longer pending");
    }

    // Calculate distance
    const distance = await this.calculateRequestDistance(
      donor.zipcode,
      request.requesterZipcode,
    );

    const updatedRequest = await this.prisma.milkRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.ACCEPTED,
        donorId: donorId,
        donorZipcode: donor.zipcode,
        distance,
        acceptedAt: new Date(),
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            userType: true,
          },
        },
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            userType: true,
          },
        },
      },
    });

    // Send notification to requester
    await this.createNotification({
      userId: request.requesterId,
      title: "Request Accepted!",
      message: `${donor.name} has accepted your milk request: "${request.title}"`,
      type: "REQUEST_ACCEPTED",
      requestId: requestId,
    });

    // Send email notification to requester
    try {
      await this.mailService.sendRequestAcceptedEmail(
        request.requester.email,
        request.requester.name,
        donor.name,
        donor.phone || "Not available",
        request.title,
        donor.facebookLink,
        donor.instagramLink,
      );
    } catch (error) {
      console.error("Failed to send email notification:", error);
    }

    // Send FCM push notification to requester
    if (request.requester.fcmToken) {
      try {
        await this.firebaseService.sendRequestAcceptedNotification(
          request.requester.fcmToken,
          donor.name,
          request.title,
          requestId,
        );
      } catch (error) {
        console.error("Failed to send FCM notification:", error);
      }
    }

    // Automatically create chat session between donor and requester
    try {
      await this.chatService.getOrCreateSession(donorId, request.requesterId);
      console.log(
        `Chat session created between donor ${donorId} and requester ${request.requesterId}`,
      );
    } catch (error) {
      console.error("Failed to create chat session:", error);
      // Don't fail the request if chat session creation fails
    }

    return this.formatRequestResponse(updatedRequest);
  }

  async rejectRequest(
    donorId: number,
    requestId: number,
    rejectDto: AcceptRequestDto,
  ): Promise<MilkRequestResponseDto> {
    const donor = await this.prisma.user.findUnique({
      where: { id: donorId },
      select: { id: true, userType: true, zipcode: true, name: true },
    });

    if (!donor) {
      throw new NotFoundException("Donor not found");
    }

    if (donor.userType !== UserType.DONOR) {
      throw new ForbiddenException("Only donors can reject requests");
    }

    const request = await this.prisma.milkRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            userType: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException("Request not found");
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException("Request is no longer pending");
    }

    const updatedRequest = await this.prisma.milkRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.DECLINED,
        donorId: donorId,
        donorZipcode: donor.zipcode,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            userType: true,
          },
        },
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            userType: true,
          },
        },
      },
    });

    // Send notification to requester
    await this.createNotification({
      userId: request.requesterId,
      title: "Request Declined",
      message: `${donor.name} has declined your milk request: "${request.title}". ${rejectDto.message || "No reason provided."}`,
      type: "REQUEST_DECLINED",
      requestId: requestId,
    });

    // Send Firebase notification to requester
    try {
      await this.firebaseService.sendRequestDeclinedNotification(
        request.requester.id,
        request.requester.name,
        donor.name,
        request.title,
        rejectDto.message || "No reason provided",
      );
    } catch (error) {
      console.error("Failed to send Firebase notification:", error);
    }

    return this.formatRequestResponse(updatedRequest);
  }

  async updateRequestStatus(
    userId: number,
    requestId: number,
    updateDto: UpdateMilkRequestDto,
  ): Promise<MilkRequestResponseDto> {
    const request = await this.prisma.milkRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: { select: { id: true } },
        donor: { select: { id: true } },
      },
    });

    if (!request) {
      throw new NotFoundException("Request not found");
    }

    // Check if user has permission to update
    if (request.requesterId !== userId && request.donorId !== userId) {
      throw new ForbiddenException(
        "You do not have permission to update this request",
      );
    }

    const updateData: any = {};
    if (updateDto.status) {
      updateData.status = updateDto.status;
      if (updateDto.status === RequestStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }
    }

    // Allow other fields to be updated only by requester
    if (request.requesterId === userId) {
      if (updateDto.title) updateData.title = updateDto.title;
      if (updateDto.description !== undefined)
        updateData.description = updateDto.description;
      if (updateDto.quantity !== undefined)
        updateData.quantity = updateDto.quantity;
      if (updateDto.urgency !== undefined)
        updateData.urgency = updateDto.urgency;
      if (updateDto.neededBy !== undefined)
        updateData.neededBy = updateDto.neededBy
          ? new Date(updateDto.neededBy)
          : null;
      if (updateDto.notes !== undefined) updateData.notes = updateDto.notes;
    }

    const updatedRequest = await this.prisma.milkRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
          },
        },
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
          },
        },
      },
    });

    return this.formatRequestResponse(updatedRequest);
  }

  // Donor Search and Discovery
  async searchDonors(
    requesterId: number,
    filters: DonorSearchFiltersDto,
  ): Promise<{ data: DonorSearchResultDto[]; pagination: any }> {
    const {
      page = 1,
      limit = 10,
      maxDistance = 50,
      ...filterOptions
    } = filters;
    const skip = (page - 1) * limit;

    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: { zipcode: true, phone: true },
    });

    if (!requester) {
      throw new NotFoundException("Requester not found");
    }

    // Use provided zipcode parameter or fall back to requester's zipcode
    const referenceZipcode = filterOptions.zipcode || requester.zipcode;

    // Determine if US-based by checking if phone number starts with +1
    const isUSBased = requester.phone?.startsWith("+1") || false;

    // Get reference zipcode coordinates once.
    // Important: DB-only lookup (no Google Geocoding API fallback) per buyers-search requirements.
    const referenceCoords = await this.geolocationService.getZipCodeCoordinates(
      referenceZipcode,
      { allowExternalLookup: false },
    );

    // Base where clause for all donors
    const baseWhereClause: any = {
      userType: UserType.DONOR,
      isActive: true,
    };

    // Apply filters
    if (filterOptions.ableToShareMedicalRecord !== undefined) {
      baseWhereClause.ableToShareMedicalRecord =
        filterOptions.ableToShareMedicalRecord;
    }

    if (filterOptions.isAvailable !== undefined) {
      baseWhereClause.isAvailable = filterOptions.isAvailable;
    }

    if (filterOptions.bloodGroup) {
      baseWhereClause.bloodGroup = filterOptions.bloodGroup;
    }

    // Remove zipcode filter from base where clause since we'll handle distance-based search differently
    // Don't filter by zipcode in the database query - we'll sort all donors by distance instead

    // Add donor name search if provided
    if (filterOptions.donorName) {
      // For MySQL, use contains without mode for case-insensitive search
      baseWhereClause.name = {
        contains: filterOptions.donorName,
      };
    }

    // Get ALL donors and calculate distances from the reference zipcode
    const allDonors = await this.prisma.user.findMany({
      where: baseWhereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        zipcode: true,
        userType: true,
        description: true,
        bloodGroup: true,
        babyDeliveryDate: true,
        ableToShareMedicalRecord: true,
        isAvailable: true,
        createdAt: true,
        receivedRequests: {
          where: {
            requesterId: requesterId,
          },
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // OPTIMIZATION: Batch fetch all unique zipcodes to avoid N+1 queries
    const uniqueZipcodes = [...new Set(allDonors.map((d) => d.zipcode))];
    const zipCodesData = await this.prisma.zipCode.findMany({
      where: {
        zipcode: { in: uniqueZipcodes },
      },
      select: {
        zipcode: true,
        latitude: true,
        longitude: true,
        placeName: true,
        country: true,
      },
    });

    // Create a map for O(1) zipcode lookup
    const zipCodeMap = new Map(zipCodesData.map((z) => [z.zipcode, z]));

    // Calculate distances for all donors and filter by maxDistance (only if no specific zipcode filter)
    const donorsWithDistance: DonorSearchResultDto[] = [];

    for (const donor of allDonors) {
      // Use cached zipcode data instead of querying database
      const zipCodeData = zipCodeMap.get(donor.zipcode);

      let distance: number | null = null;
      if (zipCodeData && referenceCoords) {
        // Calculate distance directly without additional database call
        distance = this.geolocationService.calculateDistance(
          referenceCoords.latitude,
          referenceCoords.longitude,
          zipCodeData.latitude,
          zipCodeData.longitude,
        );
      }

      // Include donor if:
      // 1. Specific zipcode filter is provided (include all), OR
      // 2. Distance is calculated (including 0) and within maxDistance, OR
      // 3. Distance cannot be calculated (zipcode not in database) - we include them but show "Distance unknown"
      if (
        filterOptions.zipcode ||
        distance === null ||
        distance <= maxDistance
      ) {
        // Convert distance based on country
        let displayDistance = distance;
        let unit = "km";

        if (isUSBased && distance !== null) {
          // Convert km to miles (1 km = 0.621371 miles)
          displayDistance = distance * 0.621371;
          unit = "mi";
        }

        // Format distance text for better UX
        let distanceText: string;
        if (distance === null) {
          distanceText = "N/A";
        } else if (distance >= 9999) {
          distanceText = "N/A";
        } else if (displayDistance < 1) {
          // Show in meters/feet for very short distances
          if (isUSBased) {
            distanceText = `${Math.round(displayDistance * 5280)} ft`;
          } else {
            distanceText = `${Math.round(displayDistance * 1000)} m`;
          }
        } else {
          distanceText = `${displayDistance.toFixed(1)} ${unit}`;
        }

        // Build full address string
        const fullAddress = zipCodeData
          ? [zipCodeData.placeName, zipCodeData.country]
              .filter(Boolean)
              .join(", ")
          : "Unknown location";

        // Check if there's an accepted request to determine if phone should be shown
        const hasAcceptedRequest = donor.receivedRequests.some(
          (r) => r.status === RequestStatus.ACCEPTED,
        );

        donorsWithDistance.push({
          donor: {
            id: donor.id,
            name: donor.name,
            email: donor.email,
            zipcode: donor.zipcode,
            userType: donor.userType as any,
            description: donor.description,
            bloodGroup: donor.bloodGroup,
            babyDeliveryDate: donor.babyDeliveryDate,
            ableToShareMedicalRecord: donor.ableToShareMedicalRecord,
            isAvailable: donor.isAvailable,
            createdAt: donor.createdAt,
          },
          distance: distance !== null ? distance : 999999, // Put unknown distances at the end
          distanceText,
          hasAcceptedRequest: hasAcceptedRequest,
          hasPendingRequest: donor.receivedRequests.length > 0,
          donorPhoneNumber: hasAcceptedRequest ? donor.phone : null,
          location: {
            zipcode: donor.zipcode,
            placeName: zipCodeData?.placeName || "Unknown",
            country: zipCodeData?.country || "Unknown",
            latitude: zipCodeData?.latitude || 0,
            longitude: zipCodeData?.longitude || 0,
            fullAddress,
          },
        });
      }
    }

    // Sort by distance in this order:
    // 1. Same zipcode (distance = 0) first
    // 2. Known distances (sorted by distance)
    // 3. Unknown distances last
    donorsWithDistance.sort((a, b) => {
      // Both have unknown distance
      if (a.distance === 999999 && b.distance === 999999) return 0;

      // One has unknown distance - put it last
      if (a.distance === 999999) return 1;
      if (b.distance === 999999) return -1;

      // Both have same zipcode (distance = 0) - maintain order
      if (a.distance === 0 && b.distance === 0) return 0;

      // One has same zipcode - put it first
      if (a.distance === 0) return -1;
      if (b.distance === 0) return 1;

      // Both have known distances - sort by distance
      return a.distance - b.distance;
    });

    // Apply pagination
    const total = donorsWithDistance.length;
    const paginatedDonors = donorsWithDistance.slice(skip, skip + limit);

    return {
      data: paginatedDonors,
      pagination: this.createPaginationResponse(page, limit, total),
    };
  }

  // Buyer Search and Discovery
  async searchBuyers(
    searcherId: number,
    filters: BuyerSearchFiltersDto,
  ): Promise<{ data: BuyerSearchResultDto[]; pagination: any }> {
    const {
      page = 1,
      limit = 10,
      maxDistance = 50,
      ...filterOptions
    } = filters;
    const skip = (page - 1) * limit;

    const searcher = await this.prisma.user.findUnique({
      where: { id: searcherId },
      select: { zipcode: true, phone: true },
    });

    if (!searcher) {
      throw new NotFoundException("Searcher not found");
    }

    // Use provided zipcode parameter or fall back to searcher's zipcode
    const referenceZipcode = filterOptions.zipcode || searcher.zipcode;

    // Determine if US-based by checking if phone number starts with +1
    const isUSBased = searcher.phone?.startsWith("+1") || false;

    // Get reference zipcode coordinates once (optimization: single query)
    const referenceCoords =
      await this.geolocationService.getZipCodeCoordinates(referenceZipcode);

    if (!referenceCoords) {
      return {
        data: [],
        pagination: this.createPaginationResponse(page, limit, 0),
      };
    }

    // Base where clause for all buyers
    const baseWhereClause: any = {
      userType: UserType.BUYER,
      isActive: true,
    };

    if (filterOptions.bloodGroup) {
      baseWhereClause.bloodGroup = filterOptions.bloodGroup;
    }

    // Add buyer name search if provided
    if (filterOptions.buyerName) {
      baseWhereClause.name = {
        contains: filterOptions.buyerName,
      };
    }

    // Get ALL buyers and calculate distances from the reference zipcode
    const allBuyers = await this.prisma.user.findMany({
      where: baseWhereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        zipcode: true,
        userType: true,
        description: true,
        bloodGroup: true,
        createdAt: true,
        sentRequests: {
          where: {
            donorId: searcherId,
          },
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    // OPTIMIZATION: Batch fetch all unique zipcodes to avoid N+1 queries
    const uniqueZipcodes = [...new Set(allBuyers.map((b) => b.zipcode))];
    const zipCodesData = await this.prisma.zipCode.findMany({
      where: {
        zipcode: { in: uniqueZipcodes },
      },
      select: {
        zipcode: true,
        latitude: true,
        longitude: true,
        placeName: true,
        country: true,
      },
    });

    // Create a map for O(1) zipcode lookup
    const zipCodeMap = new Map(zipCodesData.map((z) => [z.zipcode, z]));

    // Calculate distances for all buyers and filter by maxDistance (only if no specific zipcode filter)
    const buyersWithDistance: BuyerSearchResultDto[] = [];

    for (const buyer of allBuyers) {
      // Use cached zipcode data instead of querying database
      const zipCodeData = zipCodeMap.get(buyer.zipcode);

      let distance: number | null = null;
      if (zipCodeData) {
        // Calculate distance directly without additional database call
        distance = this.geolocationService.calculateDistance(
          referenceCoords.latitude,
          referenceCoords.longitude,
          zipCodeData.latitude,
          zipCodeData.longitude,
        );
      }

      // Include buyer if:
      // 1. Specific zipcode filter is provided (include all), OR
      // 2. Distance is calculated (including 0) and within maxDistance, OR
      // 3. Distance cannot be calculated (zipcode not in database) - we include them but show "Distance unknown"
      if (
        filterOptions.zipcode ||
        distance === null ||
        distance <= maxDistance
      ) {
        // Convert distance based on country
        let displayDistance = distance;
        let unit = "km";

        if (isUSBased && distance !== null) {
          // Convert km to miles (1 km = 0.621371 miles)
          displayDistance = distance * 0.621371;
          unit = "mi";
        }

        // Format distance text for better UX
        let distanceText: string;
        if (distance === null) {
          distanceText = "N/A";
        } else if (distance >= 9999) {
          distanceText = "N/A";
        } else if (displayDistance < 1) {
          // Show in meters/feet for very short distances
          if (isUSBased) {
            distanceText = `${Math.round(displayDistance * 5280)} ft`;
          } else {
            distanceText = `${Math.round(displayDistance * 1000)} m`;
          }
        } else {
          distanceText = `${displayDistance.toFixed(1)} ${unit}`;
        }

        // Build full address string
        const fullAddress = zipCodeData
          ? [zipCodeData.placeName, zipCodeData.country]
              .filter(Boolean)
              .join(", ")
          : "Unknown location";

        // Check if there's an accepted request to determine if phone should be shown
        const hasAcceptedRequest = buyer.sentRequests.some(
          (r) => r.status === RequestStatus.ACCEPTED,
        );

        buyersWithDistance.push({
          buyer: {
            id: buyer.id,
            name: buyer.name,
            email: buyer.email,
            zipcode: buyer.zipcode,
            userType: buyer.userType as any,
            description: buyer.description,
            bloodGroup: buyer.bloodGroup,
            createdAt: buyer.createdAt,
          },
          distance: distance !== null ? distance : 999999, // Put unknown distances at the end
          distanceText,
          hasAcceptedRequest: hasAcceptedRequest,
          hasPendingRequest: buyer.sentRequests.length > 0,
          buyerPhoneNumber: hasAcceptedRequest ? buyer.phone : null,
          location: {
            zipcode: buyer.zipcode,
            placeName: zipCodeData?.placeName || "Unknown",
            country: zipCodeData?.country || "Unknown",
            latitude: zipCodeData?.latitude || 0,
            longitude: zipCodeData?.longitude || 0,
            fullAddress,
          },
        });
      }
    }

    // Sort by distance in this order:
    // 1. Same zipcode (distance = 0) first
    // 2. Known distances (sorted by distance)
    // 3. Unknown distances last
    buyersWithDistance.sort((a, b) => {
      // Both have unknown distance
      if (a.distance === 999999 && b.distance === 999999) return 0;

      // One has unknown distance - put it last
      if (a.distance === 999999) return 1;
      if (b.distance === 999999) return -1;

      // Both have same zipcode (distance = 0) - maintain order
      if (a.distance === 0 && b.distance === 0) return 0;

      // One has same zipcode - put it first
      if (a.distance === 0) return -1;
      if (b.distance === 0) return 1;

      // Both have known distances - sort by distance
      return a.distance - b.distance;
    });

    // Apply pagination
    const total = buyersWithDistance.length;
    const paginatedBuyers = buyersWithDistance.slice(skip, skip + limit);

    return {
      data: paginatedBuyers,
      pagination: this.createPaginationResponse(page, limit, total),
    };
  }

  // Availability Management
  async updateAvailability(
    donorId: number,
    updateDto: UpdateAvailabilityDto,
  ): Promise<{ success: boolean; message: string }> {
    const donor = await this.prisma.user.findUnique({
      where: { id: donorId },
      select: {
        id: true,
        userType: true,
        name: true,
        isAvailable: true,
        lastAvailabilityNotificationAt: true,
      },
    });

    if (!donor) {
      throw new NotFoundException("Donor not found");
    }

    if (donor.userType !== UserType.DONOR) {
      throw new ForbiddenException("Only donors can update availability");
    }

    const wasUnavailable = !donor.isAvailable;
    const isBecomingAvailable = updateDto.isAvailable;

    await this.prisma.user.update({
      where: { id: donorId },
      data: { isAvailable: updateDto.isAvailable },
    });

    // If donor is becoming available, notify users who requested from them
    // Only send email notifications if 24 hours have passed since the last notification
    if (wasUnavailable && isBecomingAvailable) {
      const shouldSendEmail = this.shouldSendAvailabilityEmail(
        donor.lastAvailabilityNotificationAt,
      );
      await this.notifyUsersOfAvailability(
        donorId,
        donor.name,
        shouldSendEmail,
      );

      // Update the last notification timestamp if email was sent
      if (shouldSendEmail) {
        await this.prisma.user.update({
          where: { id: donorId },
          data: { lastAvailabilityNotificationAt: new Date() },
        });
      }
    }

    return {
      success: true,
      message: `Availability updated to ${updateDto.isAvailable ? "available" : "unavailable"}`,
    };
  }

  // Notification Management
  async getUserNotifications(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.requestNotification.findMany({
        where: { userId },
        include: {
          request: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.requestNotification.count({ where: { userId } }),
    ]);

    return {
      data: notifications.map(this.formatNotificationResponse),
      pagination: this.createPaginationResponse(page, limit, total),
    };
  }

  async markNotificationAsRead(userId: number, notificationId: number) {
    const notification = await this.prisma.requestNotification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    return this.prisma.requestNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllNotificationsAsRead(userId: number) {
    return this.prisma.requestNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  // Send Request to Specific Donor
  async sendRequestToSpecificDonor(
    requesterId: number,
    sendRequestDto: SendRequestToSpecificDonorDto,
  ): Promise<MilkRequestResponseDto> {
    // Validate requester exists
    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
      select: {
        id: true,
        name: true,
        zipcode: true,
        userType: true,
        facebookLink: true,
        instagramLink: true,
      },
    });

    if (!requester) {
      throw new NotFoundException("Requester not found");
    }

    // Validate donor exists and is active
    const donor = await this.prisma.user.findUnique({
      where: { id: sendRequestDto.donorId },
      select: {
        id: true,
        name: true,
        email: true,
        zipcode: true,
        userType: true,
        isActive: true,
        isAvailable: true,
        fcmToken: true,
      },
    });

    if (!donor) {
      throw new NotFoundException("Donor not found");
    }

    if (donor.userType !== UserType.DONOR) {
      throw new BadRequestException("Target user is not a donor");
    }

    if (!donor.isActive) {
      throw new BadRequestException("Donor account is not active");
    }

    // Check for existing pending requests to this donor
    const existingPendingRequest = await this.prisma.milkRequest.findFirst({
      where: {
        requesterId: requesterId,
        donorId: sendRequestDto.donorId,
        status: RequestStatus.PENDING,
      },
    });

    if (existingPendingRequest) {
      throw new BadRequestException(
        `You already have a pending request to this donor. Please wait for them to respond or cancel your existing request first.`,
      );
    }

    // Calculate distance between requester and donor
    const distance = await this.calculateRequestDistance(
      requester.zipcode,
      donor.zipcode,
    );

    // Create the request with donor pre-assigned
    const requestData = {
      title: sendRequestDto.title,
      description: sendRequestDto.description,
      quantity: sendRequestDto.quantity,
      urgency: sendRequestDto.urgency,
      neededBy: sendRequestDto.neededBy
        ? new Date(sendRequestDto.neededBy)
        : null,
      notes: sendRequestDto.notes,
      requesterId: requesterId,
      requesterZipcode: requester.zipcode,
      donorId: sendRequestDto.donorId,
      donorZipcode: donor.zipcode,
      distance: distance,
      requestType: RequestType.MILK_REQUEST,
      status: RequestStatus.PENDING, // Still pending until donor accepts
    };

    const request = await this.prisma.milkRequest.create({
      data: requestData,
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            userType: true,
          },
        },
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            userType: true,
          },
        },
      },
    });

    // Send notification to the specific donor
    await this.createNotification({
      userId: sendRequestDto.donorId,
      title: "New Direct Request!",
      message: `${requester.name} has sent you a direct milk request: "${sendRequestDto.title}"`,
      type: "DIRECT_REQUEST",
      requestId: request.id,
    });

    // Send email notification to donor
    try {
      await this.mailService.sendRequestNotificationEmail(
        donor.email,
        donor.name,
        requester.name,
        sendRequestDto.title,
        sendRequestDto.description || "",
        sendRequestDto.quantity,
        sendRequestDto.urgency,
        requester.facebookLink,
        requester.instagramLink,
      );
    } catch (error) {
      console.error("Failed to send email notification to donor:", error);
    }

    // Send FCM push notification to donor
    if (donor.fcmToken) {
      try {
        await this.firebaseService.sendMilkRequestNotification(
          donor.fcmToken,
          requester.name,
          sendRequestDto.title,
          request.id,
        );
      } catch (error) {
        console.error("Failed to send FCM notification to donor:", error);
      }
    }

    return this.formatRequestResponse(request);
  }

  async getAvailableMilkOffers(buyerId: number, filters: RequestFiltersDto) {
    const { page = 1, limit = 10, ...filterOptions } = filters;
    const skip = (page - 1) * limit;

    // Get buyer's zipcode for location-based filtering
    const buyer = await this.prisma.user.findUnique({
      where: { id: buyerId },
      select: { zipcode: true, userType: true },
    });

    if (!buyer) {
      throw new NotFoundException("Buyer not found");
    }

    const whereClause: any = {
      requestType: RequestType.MILK_OFFER,
      status: RequestStatus.PENDING,
    };

    if (filterOptions.urgency) whereClause.urgency = filterOptions.urgency;

    // Get offers within reasonable distance (e.g., 50km)
    const nearbyZipCodes = await this.geolocationService.findNearbyZipCodes(
      buyer.zipcode,
      50,
    );
    const nearbyZipCodeStrings = nearbyZipCodes.map((z) => z.zipcode);

    if (nearbyZipCodeStrings.length > 0) {
      whereClause.requesterZipcode = {
        in: nearbyZipCodeStrings,
      };
    }

    const [offers, total] = await Promise.all([
      this.prisma.milkRequest.findMany({
        where: whereClause,
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.milkRequest.count({ where: whereClause }),
    ]);

    // Calculate distances for each offer
    const offersWithDistance = await Promise.all(
      offers.map(async (offer) => {
        const distance = await this.calculateRequestDistance(
          buyer.zipcode,
          offer.requesterZipcode,
        );
        return {
          ...this.formatRequestResponse(offer),
          distance,
        };
      }),
    );

    // Sort by distance
    offersWithDistance.sort(
      (a, b) => (a.distance || Infinity) - (b.distance || Infinity),
    );

    return {
      data: offersWithDistance,
      pagination: this.createPaginationResponse(page, limit, total),
    };
  }

  // Private helper methods
  private async calculateRequestDistance(
    zipcode1: string,
    zipcode2: string,
  ): Promise<number | null> {
    const coords1 =
      await this.geolocationService.getZipCodeCoordinates(zipcode1);
    const coords2 =
      await this.geolocationService.getZipCodeCoordinates(zipcode2);

    if (!coords1 || !coords2) {
      return null;
    }

    return this.geolocationService.calculateDistance(
      coords1.latitude,
      coords1.longitude,
      coords2.latitude,
      coords2.longitude,
    );
  }

  private formatRequestResponse(request: any): MilkRequestResponseDto {
    return {
      id: request.id,
      requestType: request.requestType,
      status: request.status,
      title: request.title,
      description: request.description,
      quantity: request.quantity,
      urgency: request.urgency,
      requesterZipcode: request.requesterZipcode,
      donorZipcode: request.donorZipcode,
      distance: request.distance,
      neededBy: request.neededBy,
      acceptedAt: request.acceptedAt,
      completedAt: request.completedAt,
      notes: request.notes,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      requester: request.requester,
      donor: request.donor,
    };
  }

  private formatNotificationResponse(notification: any): NotificationDto {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      sentAt: notification.sentAt,
      createdAt: notification.createdAt,
      request: notification.request,
    };
  }

  private createPaginationResponse(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);
    return {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  private async createNotification(data: {
    userId: number;
    title: string;
    message: string;
    type: string;
    requestId?: number;
  }) {
    // Create notification in database
    const notification = await this.prisma.requestNotification.create({
      data,
    });

    // Send FCM notification if user has FCM token
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
        select: { fcmToken: true },
      });

      if (user?.fcmToken) {
        await this.firebaseService.sendNotification({
          token: user.fcmToken,
          notification: {
            title: data.title,
            body: data.message,
          },
          data: {
            type: data.type,
            requestId: data.requestId?.toString() || "",
            notificationId: notification.id.toString(),
          },
        });
      }
    } catch (error) {
      // Log FCM error but don't fail the entire operation
      console.error("FCM notification failed:", error);
    }

    return notification;
  }

  /**
   * Check if 24 hours have passed since the last availability notification
   */
  private shouldSendAvailabilityEmail(
    lastNotificationAt: Date | null,
  ): boolean {
    if (!lastNotificationAt) {
      // Never sent a notification before, allow it
      return true;
    }

    const now = new Date();
    const hoursSinceLastNotification =
      (now.getTime() - lastNotificationAt.getTime()) / (1000 * 60 * 60);

    // Only allow email if 24 hours have passed
    return hoursSinceLastNotification >= 24;
  }

  private async notifyUsersOfAvailability(
    donorId: number,
    donorName: string,
    sendEmail: boolean = true,
  ) {
    // Get donor's contact information
    const donor = await this.prisma.user.findUnique({
      where: { id: donorId },
      select: {
        email: true,
        facebookLink: true,
        instagramLink: true,
      },
    });

    // Find users who have accepted requests from this donor
    const acceptedRequests = await this.prisma.milkRequest.findMany({
      where: {
        donorId: donorId,
        status: RequestStatus.ACCEPTED,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            fcmToken: true,
          },
        },
      },
    });

    // Create notifications and conditionally send emails for these users
    for (const request of acceptedRequests) {
      // Always create in-app notification
      await this.prisma.requestNotification.create({
        data: {
          userId: request.requester.id,
          title: "Donor Available!",
          message: `${donorName} is now available and might be able to help with your request: "${request.title}"`,
          type: "AVAILABILITY_UPDATE",
          requestId: request.id,
        },
      });

      // Only send email notification if 24-hour cooldown has passed
      if (sendEmail) {
        try {
          await this.mailService.sendAvailabilityNotificationEmail(
            request.requester.email,
            request.requester.name,
            donorName,
            request.title,
            donor?.facebookLink,
            donor?.instagramLink,
          );
        } catch (error) {
          console.error(
            `Failed to send availability email to ${request.requester.email}:`,
            error,
          );
        }
      }

      // Always send FCM push notification if user has token
      if (request.requester.fcmToken) {
        try {
          await this.firebaseService.sendNotification({
            token: request.requester.fcmToken,
            notification: {
              title: "Donor Available! 💝",
              body: `${donorName} is now available and might be able to help with your request: "${request.title}"`,
            },
            data: {
              type: "AVAILABILITY_UPDATE",
              donorName: donorName,
              requestId: request.id.toString(),
            },
          });
        } catch (error) {
          console.error(
            `Failed to send FCM notification to user ${request.requester.id}:`,
            error,
          );
        }
      }
    }
  }

  async adminGetAllRequests(filters: AdminRequestFiltersDto) {
    const {
      page = 1,
      limit = 20,
      status,
      requestType,
      urgency,
      buyerName,
      donorName,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {
      AND: [
        status ? { status } : {},
        requestType ? { requestType } : {},
        urgency ? { urgency } : {},
        buyerName
          ? {
              requester: {
                name: {
                  contains: buyerName,
                },
              },
            }
          : {},
        donorName
          ? {
              donor: {
                name: {
                  contains: donorName,
                },
              },
            }
          : {},
      ].filter(Boolean),
    };

    const [requests, total] = await Promise.all([
      this.prisma.milkRequest.findMany({
        where,
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              userType: true,
            },
          },
          donor: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              userType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.milkRequest.count({ where }),
    ]);

    return {
      data: requests.map((r) => this.formatRequestResponse(r)),
      pagination: this.createPaginationResponse(page, limit, total),
    };
  }
}
