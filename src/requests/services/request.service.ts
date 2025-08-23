import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GeolocationService } from './geolocation.service';
import {
    CreateMilkRequestDto,
    UpdateMilkRequestDto,
    AcceptRequestDto,
    UpdateAvailabilityDto,
    DonorSearchFiltersDto,
    RequestFiltersDto,
    DonorSearchResultDto,
    MilkRequestResponseDto,
    NotificationDto
} from '../dto/request.dto';
import { RequestStatus, RequestType, UserType } from '@prisma/client';

@Injectable()
export class RequestService {
    constructor(
        private prisma: PrismaService,
        private geolocationService: GeolocationService,
    ) { }

    // Milk Request Management
    async createRequest(userId: number, createRequestDto: CreateMilkRequestDto): Promise<MilkRequestResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const requestData = {
            ...createRequestDto,
            requesterId: userId,
            requesterZipcode: user.zipcode,
            neededBy: createRequestDto.neededBy ? new Date(createRequestDto.neededBy) : null,
        };

        const request = await this.prisma.milkRequest.create({
            data: requestData,
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
        });

        return this.formatRequestResponse(request);
    }

    async getUserRequests(userId: number, filters: RequestFiltersDto) {
        const { page = 1, limit = 10, ...filterOptions } = filters;
        const skip = (page - 1) * limit;

        const whereClause: any = {
            requesterId: userId,
        };

        if (filterOptions.status) whereClause.status = filterOptions.status;
        if (filterOptions.requestType) whereClause.requestType = filterOptions.requestType;
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
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.milkRequest.count({ where: whereClause }),
        ]);

        return {
            data: requests.map(request => this.formatRequestResponse(request)),
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
            throw new NotFoundException('Donor not found');
        }

        if (donor.userType !== UserType.DONOR) {
            throw new ForbiddenException('Only donors can view incoming requests');
        }

        const whereClause: any = {
            requestType: RequestType.MILK_REQUEST,
            status: RequestStatus.PENDING,
        };

        if (filterOptions.urgency) whereClause.urgency = filterOptions.urgency;

        // Get requests within reasonable distance (e.g., 50km)
        const nearbyZipCodes = await this.geolocationService.findNearbyZipCodes(donor.zipcode, 50);
        const nearbyZipCodeStrings = nearbyZipCodes.map(z => z.zipcode);

        if (nearbyZipCodeStrings.length > 0) {
            whereClause.requesterZipcode = {
                in: nearbyZipCodeStrings,
            };
        }

        const [requests, total] = await Promise.all([
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
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.milkRequest.count({ where: whereClause }),
        ]);

        // Calculate distances for each request
        const requestsWithDistance = await Promise.all(
            requests.map(async (request) => {
                const distance = await this.calculateRequestDistance(donor.zipcode, request.requesterZipcode);
                return {
                    ...this.formatRequestResponse(request),
                    distance,
                };
            })
        );

        // Sort by distance
        requestsWithDistance.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

        return {
            data: requestsWithDistance,
            pagination: this.createPaginationResponse(page, limit, total),
        };
    }

    async acceptRequest(donorId: number, requestId: number, acceptDto: AcceptRequestDto): Promise<MilkRequestResponseDto> {
        const donor = await this.prisma.user.findUnique({
            where: { id: donorId },
            select: { id: true, userType: true, zipcode: true, name: true },
        });

        if (!donor) {
            throw new NotFoundException('Donor not found');
        }

        if (donor.userType !== UserType.DONOR) {
            throw new ForbiddenException('Only donors can accept requests');
        }

        const request = await this.prisma.milkRequest.findUnique({
            where: { id: requestId },
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
        });

        if (!request) {
            throw new NotFoundException('Request not found');
        }

        if (request.status !== RequestStatus.PENDING) {
            throw new BadRequestException('Request is no longer pending');
        }

        // Calculate distance
        const distance = await this.calculateRequestDistance(donor.zipcode, request.requesterZipcode);

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

        // Send notification to requester
        await this.createNotification({
            userId: request.requesterId,
            title: 'Request Accepted!',
            message: `${donor.name} has accepted your milk request: "${request.title}"`,
            type: 'REQUEST_ACCEPTED',
            requestId: requestId,
        });

        return this.formatRequestResponse(updatedRequest);
    }

    async updateRequestStatus(userId: number, requestId: number, updateDto: UpdateMilkRequestDto): Promise<MilkRequestResponseDto> {
        const request = await this.prisma.milkRequest.findUnique({
            where: { id: requestId },
            include: {
                requester: { select: { id: true } },
                donor: { select: { id: true } },
            },
        });

        if (!request) {
            throw new NotFoundException('Request not found');
        }

        // Check if user has permission to update
        if (request.requesterId !== userId && request.donorId !== userId) {
            throw new ForbiddenException('You do not have permission to update this request');
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
            if (updateDto.description !== undefined) updateData.description = updateDto.description;
            if (updateDto.quantity !== undefined) updateData.quantity = updateDto.quantity;
            if (updateDto.urgency !== undefined) updateData.urgency = updateDto.urgency;
            if (updateDto.neededBy !== undefined) updateData.neededBy = updateDto.neededBy ? new Date(updateDto.neededBy) : null;
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
    async searchDonors(requesterId: number, filters: DonorSearchFiltersDto): Promise<{ data: DonorSearchResultDto[]; pagination: any }> {
        const { page = 1, limit = 10, maxDistance = 50, ...filterOptions } = filters;
        const skip = (page - 1) * limit;

        const requester = await this.prisma.user.findUnique({
            where: { id: requesterId },
            select: { zipcode: true },
        });

        if (!requester) {
            throw new NotFoundException('Requester not found');
        }

        // Use provided zipcode parameter or fall back to requester's zipcode
        const referenceZipcode = filterOptions.zipcode || requester.zipcode;

        // Base where clause for all donors
        const baseWhereClause: any = {
            userType: UserType.DONOR,
            isActive: true,
        };

        // Apply filters
        if (filterOptions.ableToShareMedicalRecord !== undefined) {
            baseWhereClause.ableToShareMedicalRecord = filterOptions.ableToShareMedicalRecord;
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
                contains: filterOptions.donorName
            };
        }

        // Get ALL donors and calculate distances from the reference zipcode
        const allDonors = await this.prisma.user.findMany({
            where: baseWhereClause,
            select: {
                id: true,
                name: true,
                email: true,
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
                        status: RequestStatus.ACCEPTED,
                    },
                    select: { id: true },
                },
            },
        });

        // Calculate distances for all donors and filter by maxDistance (only if no specific zipcode filter)
        const donorsWithDistance: DonorSearchResultDto[] = [];

        for (const donor of allDonors) {
            const distance = await this.calculateRequestDistance(referenceZipcode, donor.zipcode);

            // Include donor if:
            // 1. Specific zipcode filter is provided (include all), OR
            // 2. Distance is calculated (including 0) and within maxDistance, OR  
            // 3. Distance cannot be calculated (zipcode not in database) - we include them but show "Distance unknown"
            if (filterOptions.zipcode || distance === null || distance <= maxDistance) {
                const zipCodeData = await this.geolocationService.getZipCodeCoordinates(donor.zipcode);

                // Format distance text for better UX
                const distanceText = distance !== null ?
                    (distance < 1 ?
                        `${Math.round(distance * 1000)}m away` :
                        `${distance.toFixed(1)} km away`
                    ) : 'Distance unknown';

                // Build full address string
                const fullAddress = zipCodeData ? [
                    zipCodeData.placeName,
                    zipCodeData.country
                ].filter(Boolean).join(', ') : 'Unknown location';

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
                    hasAcceptedRequest: donor.receivedRequests.length > 0,
                    location: {
                        zipcode: donor.zipcode,
                        placeName: zipCodeData?.placeName || 'Unknown',
                        country: zipCodeData?.country || 'Unknown',
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

    // Availability Management
    async updateAvailability(donorId: number, updateDto: UpdateAvailabilityDto): Promise<{ success: boolean; message: string }> {
        const donor = await this.prisma.user.findUnique({
            where: { id: donorId },
            select: { id: true, userType: true, name: true, isAvailable: true },
        });

        if (!donor) {
            throw new NotFoundException('Donor not found');
        }

        if (donor.userType !== UserType.DONOR) {
            throw new ForbiddenException('Only donors can update availability');
        }

        const wasUnavailable = !donor.isAvailable;
        const isBecomingAvailable = updateDto.isAvailable;

        await this.prisma.user.update({
            where: { id: donorId },
            data: { isAvailable: updateDto.isAvailable },
        });

        // If donor is becoming available, notify users who requested from them
        if (wasUnavailable && isBecomingAvailable) {
            await this.notifyUsersOfAvailability(donorId, donor.name);
        }

        return {
            success: true,
            message: `Availability updated to ${updateDto.isAvailable ? 'available' : 'unavailable'}`,
        };
    }

    // Notification Management
    async getUserNotifications(userId: number, page: number = 1, limit: number = 20) {
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
                orderBy: { createdAt: 'desc' },
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
            throw new NotFoundException('Notification not found');
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

    // Private helper methods
    private async calculateRequestDistance(zipcode1: string, zipcode2: string): Promise<number | null> {
        const coords1 = await this.geolocationService.getZipCodeCoordinates(zipcode1);
        const coords2 = await this.geolocationService.getZipCodeCoordinates(zipcode2);

        if (!coords1 || !coords2) {
            return null;
        }

        return this.geolocationService.calculateDistance(
            coords1.latitude,
            coords1.longitude,
            coords2.latitude,
            coords2.longitude
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
        return this.prisma.requestNotification.create({
            data,
        });
    }

    private async notifyUsersOfAvailability(donorId: number, donorName: string) {
        // Find users who have pending requests that could be fulfilled by this donor
        const pendingRequests = await this.prisma.milkRequest.findMany({
            where: {
                status: RequestStatus.PENDING,
                requestType: RequestType.MILK_REQUEST,
                donorId: null,
            },
            select: {
                requesterId: true,
                title: true,
            },
        });

        // Create notifications for these users
        const notifications = pendingRequests.map(request => ({
            userId: request.requesterId,
            title: 'Donor Available!',
            message: `${donorName} is now available and might be able to help with your request: "${request.title}"`,
            type: 'AVAILABILITY_UPDATE',
        }));

        if (notifications.length > 0) {
            await this.prisma.requestNotification.createMany({
                data: notifications,
            });
        }
    }
}
