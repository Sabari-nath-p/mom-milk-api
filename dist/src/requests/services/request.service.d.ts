import { PrismaService } from '../../prisma/prisma.service';
import { GeolocationService } from './geolocation.service';
import { CreateMilkRequestDto, UpdateMilkRequestDto, AcceptRequestDto, UpdateAvailabilityDto, DonorSearchFiltersDto, RequestFiltersDto, DonorSearchResultDto, MilkRequestResponseDto, NotificationDto, SendRequestToSpecificDonorDto } from '../dto/request.dto';
export declare class RequestService {
    private prisma;
    private geolocationService;
    constructor(prisma: PrismaService, geolocationService: GeolocationService);
    createRequest(userId: number, createRequestDto: CreateMilkRequestDto): Promise<MilkRequestResponseDto>;
    getUserRequests(userId: number, filters: RequestFiltersDto): Promise<{
        data: MilkRequestResponseDto[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    getIncomingRequests(donorId: number, filters: RequestFiltersDto): Promise<{
        data: {
            distance: number;
            id: number;
            requestType: import("../dto/request.dto").RequestType;
            status: import("../dto/request.dto").RequestStatus;
            title: string;
            description?: string;
            quantity?: number;
            urgency?: string;
            requesterZipcode: string;
            donorZipcode?: string;
            neededBy?: Date;
            acceptedAt?: Date;
            completedAt?: Date;
            notes?: string;
            createdAt: Date;
            updatedAt: Date;
            requester: {
                id: number;
                name: string;
                email: string;
                userType: import("../dto/request.dto").UserType;
            };
            donor?: {
                id: number;
                name: string;
                email: string;
                userType: import("../dto/request.dto").UserType;
            };
        }[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    acceptRequest(donorId: number, requestId: number, acceptDto: AcceptRequestDto): Promise<MilkRequestResponseDto>;
    updateRequestStatus(userId: number, requestId: number, updateDto: UpdateMilkRequestDto): Promise<MilkRequestResponseDto>;
    searchDonors(requesterId: number, filters: DonorSearchFiltersDto): Promise<{
        data: DonorSearchResultDto[];
        pagination: any;
    }>;
    updateAvailability(donorId: number, updateDto: UpdateAvailabilityDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserNotifications(userId: number, page?: number, limit?: number): Promise<{
        data: NotificationDto[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    markNotificationAsRead(userId: number, notificationId: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        type: string;
        title: string;
        message: string;
        isRead: boolean;
        sentAt: Date;
        requestId: number | null;
    }>;
    markAllNotificationsAsRead(userId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    sendRequestToSpecificDonor(requesterId: number, sendRequestDto: SendRequestToSpecificDonorDto): Promise<MilkRequestResponseDto>;
    private calculateRequestDistance;
    private formatRequestResponse;
    private formatNotificationResponse;
    private createPaginationResponse;
    private createNotification;
    private notifyUsersOfAvailability;
}
