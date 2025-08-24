export declare enum UserType {
    DONOR = "DONOR",
    BUYER = "BUYER",
    ADMIN = "ADMIN"
}
export declare enum RequestStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    DECLINED = "DECLINED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum RequestType {
    MILK_REQUEST = "MILK_REQUEST",
    MILK_OFFER = "MILK_OFFER"
}
export declare class CreateZipCodeDto {
    country: string;
    zipcode: string;
    placeName: string;
    latitude: number;
    longitude: number;
}
declare const UpdateZipCodeDto_base: import("@nestjs/common").Type<Partial<CreateZipCodeDto>>;
export declare class UpdateZipCodeDto extends UpdateZipCodeDto_base {
}
export declare class CreateMilkRequestDto {
    requestType: RequestType;
    title: string;
    description?: string;
    quantity?: number;
    urgency?: string;
    neededBy?: string;
    notes?: string;
}
declare const UpdateMilkRequestDto_base: import("@nestjs/common").Type<Partial<CreateMilkRequestDto>>;
export declare class UpdateMilkRequestDto extends UpdateMilkRequestDto_base {
    status?: RequestStatus;
    title?: string;
    description?: string;
    quantity?: number;
    urgency?: string;
    neededBy?: string;
    notes?: string;
}
export declare class AcceptRequestDto {
    message?: string;
}
export declare class UpdateAvailabilityDto {
    isAvailable: boolean;
}
export declare class DonorSearchFiltersDto {
    maxDistance?: number;
    ableToShareMedicalRecord?: boolean;
    isAvailable?: boolean;
    bloodGroup?: string;
    zipcode?: string;
    donorName?: string;
    page?: number;
    limit?: number;
}
export declare class RequestFiltersDto {
    status?: RequestStatus;
    requestType?: RequestType;
    urgency?: string;
    page?: number;
    limit?: number;
}
export declare class DonorSearchResultDto {
    donor: {
        id: number;
        name: string;
        email: string;
        zipcode: string;
        userType: UserType;
        description?: string;
        bloodGroup?: string;
        babyDeliveryDate?: Date;
        ableToShareMedicalRecord?: boolean;
        isAvailable?: boolean;
        createdAt: Date;
    };
    distance: number;
    distanceText: string;
    hasAcceptedRequest: boolean;
    location: {
        zipcode: string;
        placeName: string;
        country: string;
        latitude: number;
        longitude: number;
        fullAddress: string;
    };
}
export declare class MilkRequestResponseDto {
    id: number;
    requestType: RequestType;
    status: RequestStatus;
    title: string;
    description?: string;
    quantity?: number;
    urgency?: string;
    requesterZipcode: string;
    donorZipcode?: string;
    distance?: number;
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
        userType: UserType;
    };
    donor?: {
        id: number;
        name: string;
        email: string;
        userType: UserType;
    };
}
export declare class NotificationDto {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    sentAt: Date;
    createdAt: Date;
    request?: {
        id: number;
        title: string;
        status: RequestStatus;
    };
}
export declare class SendRequestToSpecificDonorDto {
    donorId: number;
    title: string;
    description?: string;
    quantity: number;
    urgency: string;
    neededBy?: string;
    notes?: string;
}
export {};
