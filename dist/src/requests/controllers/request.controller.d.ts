import { RequestService } from '../services/request.service';
import { CreateMilkRequestDto, UpdateMilkRequestDto, AcceptRequestDto, UpdateAvailabilityDto, DonorSearchFiltersDto, RequestFiltersDto, DonorSearchResultDto, MilkRequestResponseDto, NotificationDto, SendRequestToSpecificDonorDto } from '../dto/request.dto';
export declare class RequestController {
    private readonly requestService;
    constructor(requestService: RequestService);
    createRequest(req: any, createRequestDto: CreateMilkRequestDto): Promise<MilkRequestResponseDto>;
    getUserRequests(req: any, filters: RequestFiltersDto): Promise<{
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
    getIncomingRequests(req: any, filters: RequestFiltersDto): Promise<{
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
                phone: string;
                userType: import("../dto/request.dto").UserType;
            };
            donor?: {
                id: number;
                name: string;
                email: string;
                phone: string;
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
    updateAvailability(req: any, updateDto: UpdateAvailabilityDto): Promise<{
        success: boolean;
        message: string;
    }>;
    updateRequest(req: any, id: number, updateRequestDto: UpdateMilkRequestDto): Promise<MilkRequestResponseDto>;
    acceptRequest(req: any, id: number, acceptDto: AcceptRequestDto): Promise<MilkRequestResponseDto>;
    rejectRequest(req: any, id: number, rejectDto: AcceptRequestDto): Promise<MilkRequestResponseDto>;
    searchDonors(req: any, filters: DonorSearchFiltersDto): Promise<{
        data: DonorSearchResultDto[];
        pagination: any;
    }>;
    getNotifications(req: any, page?: string, limit?: string): Promise<{
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
    markNotificationAsRead(req: any, notificationId: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
        type: string;
        title: string;
        message: string;
        requestId: number | null;
        isRead: boolean;
        sentAt: Date;
    }>;
    markAllNotificationsAsRead(req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getRequestDetails(req: any, id: number): Promise<MilkRequestResponseDto>;
    sendRequestToSpecificDonor(req: any, sendRequestDto: SendRequestToSpecificDonorDto): Promise<MilkRequestResponseDto>;
    getAvailableMilkOffers(req: any, filters: RequestFiltersDto): Promise<{
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
                phone: string;
                userType: import("../dto/request.dto").UserType;
            };
            donor?: {
                id: number;
                name: string;
                email: string;
                phone: string;
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
}
