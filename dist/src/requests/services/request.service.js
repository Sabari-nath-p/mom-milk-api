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
exports.RequestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const geolocation_service_1 = require("./geolocation.service");
const client_1 = require("@prisma/client");
let RequestService = class RequestService {
    constructor(prisma, geolocationService) {
        this.prisma = prisma;
        this.geolocationService = geolocationService;
    }
    async createRequest(userId, createRequestDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
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
    async getUserRequests(userId, filters) {
        const { page = 1, limit = 10, ...filterOptions } = filters;
        const skip = (page - 1) * limit;
        const whereClause = {
            requesterId: userId,
        };
        if (filterOptions.status)
            whereClause.status = filterOptions.status;
        if (filterOptions.requestType)
            whereClause.requestType = filterOptions.requestType;
        if (filterOptions.urgency)
            whereClause.urgency = filterOptions.urgency;
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
    async getIncomingRequests(donorId, filters) {
        const { page = 1, limit = 10, ...filterOptions } = filters;
        const skip = (page - 1) * limit;
        const donor = await this.prisma.user.findUnique({
            where: { id: donorId },
            select: { zipcode: true, userType: true },
        });
        if (!donor) {
            throw new common_1.NotFoundException('Donor not found');
        }
        if (donor.userType !== client_1.UserType.DONOR) {
            throw new common_1.ForbiddenException('Only donors can view incoming requests');
        }
        const whereClause = {
            requestType: client_1.RequestType.MILK_REQUEST,
            status: client_1.RequestStatus.PENDING,
        };
        if (filterOptions.urgency)
            whereClause.urgency = filterOptions.urgency;
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
        const requestsWithDistance = await Promise.all(requests.map(async (request) => {
            const distance = await this.calculateRequestDistance(donor.zipcode, request.requesterZipcode);
            return {
                ...this.formatRequestResponse(request),
                distance,
            };
        }));
        requestsWithDistance.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        return {
            data: requestsWithDistance,
            pagination: this.createPaginationResponse(page, limit, total),
        };
    }
    async acceptRequest(donorId, requestId, acceptDto) {
        const donor = await this.prisma.user.findUnique({
            where: { id: donorId },
            select: { id: true, userType: true, zipcode: true, name: true },
        });
        if (!donor) {
            throw new common_1.NotFoundException('Donor not found');
        }
        if (donor.userType !== client_1.UserType.DONOR) {
            throw new common_1.ForbiddenException('Only donors can accept requests');
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
            throw new common_1.NotFoundException('Request not found');
        }
        if (request.status !== client_1.RequestStatus.PENDING) {
            throw new common_1.BadRequestException('Request is no longer pending');
        }
        const distance = await this.calculateRequestDistance(donor.zipcode, request.requesterZipcode);
        const updatedRequest = await this.prisma.milkRequest.update({
            where: { id: requestId },
            data: {
                status: client_1.RequestStatus.ACCEPTED,
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
        await this.createNotification({
            userId: request.requesterId,
            title: 'Request Accepted!',
            message: `${donor.name} has accepted your milk request: "${request.title}"`,
            type: 'REQUEST_ACCEPTED',
            requestId: requestId,
        });
        return this.formatRequestResponse(updatedRequest);
    }
    async updateRequestStatus(userId, requestId, updateDto) {
        const request = await this.prisma.milkRequest.findUnique({
            where: { id: requestId },
            include: {
                requester: { select: { id: true } },
                donor: { select: { id: true } },
            },
        });
        if (!request) {
            throw new common_1.NotFoundException('Request not found');
        }
        if (request.requesterId !== userId && request.donorId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this request');
        }
        const updateData = {};
        if (updateDto.status) {
            updateData.status = updateDto.status;
            if (updateDto.status === client_1.RequestStatus.COMPLETED) {
                updateData.completedAt = new Date();
            }
        }
        if (request.requesterId === userId) {
            if (updateDto.title)
                updateData.title = updateDto.title;
            if (updateDto.description !== undefined)
                updateData.description = updateDto.description;
            if (updateDto.quantity !== undefined)
                updateData.quantity = updateDto.quantity;
            if (updateDto.urgency !== undefined)
                updateData.urgency = updateDto.urgency;
            if (updateDto.neededBy !== undefined)
                updateData.neededBy = updateDto.neededBy ? new Date(updateDto.neededBy) : null;
            if (updateDto.notes !== undefined)
                updateData.notes = updateDto.notes;
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
    async searchDonors(requesterId, filters) {
        const { page = 1, limit = 10, maxDistance = 50, ...filterOptions } = filters;
        const skip = (page - 1) * limit;
        const requester = await this.prisma.user.findUnique({
            where: { id: requesterId },
            select: { zipcode: true },
        });
        if (!requester) {
            throw new common_1.NotFoundException('Requester not found');
        }
        const referenceZipcode = filterOptions.zipcode || requester.zipcode;
        const baseWhereClause = {
            userType: client_1.UserType.DONOR,
            isActive: true,
        };
        if (filterOptions.ableToShareMedicalRecord !== undefined) {
            baseWhereClause.ableToShareMedicalRecord = filterOptions.ableToShareMedicalRecord;
        }
        if (filterOptions.isAvailable !== undefined) {
            baseWhereClause.isAvailable = filterOptions.isAvailable;
        }
        if (filterOptions.bloodGroup) {
            baseWhereClause.bloodGroup = filterOptions.bloodGroup;
        }
        if (filterOptions.donorName) {
            baseWhereClause.name = {
                contains: filterOptions.donorName
            };
        }
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
                        status: client_1.RequestStatus.ACCEPTED,
                    },
                    select: { id: true },
                },
            },
        });
        const donorsWithDistance = [];
        for (const donor of allDonors) {
            const distance = await this.calculateRequestDistance(referenceZipcode, donor.zipcode);
            if (filterOptions.zipcode || distance === null || distance <= maxDistance) {
                const zipCodeData = await this.geolocationService.getZipCodeCoordinates(donor.zipcode);
                const distanceText = distance !== null ?
                    (distance < 1 ?
                        `${Math.round(distance * 1000)}m away` :
                        `${distance.toFixed(1)} km away`) : 'Distance unknown';
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
                        userType: donor.userType,
                        description: donor.description,
                        bloodGroup: donor.bloodGroup,
                        babyDeliveryDate: donor.babyDeliveryDate,
                        ableToShareMedicalRecord: donor.ableToShareMedicalRecord,
                        isAvailable: donor.isAvailable,
                        createdAt: donor.createdAt,
                    },
                    distance: distance !== null ? distance : 999999,
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
        donorsWithDistance.sort((a, b) => {
            if (a.distance === 999999 && b.distance === 999999)
                return 0;
            if (a.distance === 999999)
                return 1;
            if (b.distance === 999999)
                return -1;
            if (a.distance === 0 && b.distance === 0)
                return 0;
            if (a.distance === 0)
                return -1;
            if (b.distance === 0)
                return 1;
            return a.distance - b.distance;
        });
        const total = donorsWithDistance.length;
        const paginatedDonors = donorsWithDistance.slice(skip, skip + limit);
        return {
            data: paginatedDonors,
            pagination: this.createPaginationResponse(page, limit, total),
        };
    }
    async updateAvailability(donorId, updateDto) {
        const donor = await this.prisma.user.findUnique({
            where: { id: donorId },
            select: { id: true, userType: true, name: true, isAvailable: true },
        });
        if (!donor) {
            throw new common_1.NotFoundException('Donor not found');
        }
        if (donor.userType !== client_1.UserType.DONOR) {
            throw new common_1.ForbiddenException('Only donors can update availability');
        }
        const wasUnavailable = !donor.isAvailable;
        const isBecomingAvailable = updateDto.isAvailable;
        await this.prisma.user.update({
            where: { id: donorId },
            data: { isAvailable: updateDto.isAvailable },
        });
        if (wasUnavailable && isBecomingAvailable) {
            await this.notifyUsersOfAvailability(donorId, donor.name);
        }
        return {
            success: true,
            message: `Availability updated to ${updateDto.isAvailable ? 'available' : 'unavailable'}`,
        };
    }
    async getUserNotifications(userId, page = 1, limit = 20) {
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
    async markNotificationAsRead(userId, notificationId) {
        const notification = await this.prisma.requestNotification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return this.prisma.requestNotification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }
    async markAllNotificationsAsRead(userId) {
        return this.prisma.requestNotification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
    async calculateRequestDistance(zipcode1, zipcode2) {
        const coords1 = await this.geolocationService.getZipCodeCoordinates(zipcode1);
        const coords2 = await this.geolocationService.getZipCodeCoordinates(zipcode2);
        if (!coords1 || !coords2) {
            return null;
        }
        return this.geolocationService.calculateDistance(coords1.latitude, coords1.longitude, coords2.latitude, coords2.longitude);
    }
    formatRequestResponse(request) {
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
    formatNotificationResponse(notification) {
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
    createPaginationResponse(page, limit, total) {
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
    async createNotification(data) {
        return this.prisma.requestNotification.create({
            data,
        });
    }
    async notifyUsersOfAvailability(donorId, donorName) {
        const pendingRequests = await this.prisma.milkRequest.findMany({
            where: {
                status: client_1.RequestStatus.PENDING,
                requestType: client_1.RequestType.MILK_REQUEST,
                donorId: null,
            },
            select: {
                requesterId: true,
                title: true,
            },
        });
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
};
exports.RequestService = RequestService;
exports.RequestService = RequestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        geolocation_service_1.GeolocationService])
], RequestService);
//# sourceMappingURL=request.service.js.map