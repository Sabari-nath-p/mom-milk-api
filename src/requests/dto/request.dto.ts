import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { RequestStatus, RequestType, UserType } from '@prisma/client';

export class CreateZipCodeDto {
    @ApiProperty({ example: 'United States', description: 'Country name' })
    @IsString()
    country: string;

    @ApiProperty({ example: '10001', description: 'Zip code' })
    @IsString()
    zipcode: string;

    @ApiProperty({ example: 'New York', description: 'Place name' })
    @IsString()
    placeName: string;

    @ApiProperty({ example: 40.7128, description: 'Latitude coordinate' })
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @ApiProperty({ example: -74.0060, description: 'Longitude coordinate' })
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;
}

export class UpdateZipCodeDto extends PartialType(CreateZipCodeDto) { }

export class CreateMilkRequestDto {
    @ApiProperty({ enum: RequestType, example: RequestType.MILK_REQUEST, description: 'Type of request' })
    @IsEnum(RequestType)
    requestType: RequestType;

    @ApiProperty({ example: 'Need breast milk for newborn', description: 'Request title' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ example: 'Urgent need for my 2-week old baby', description: 'Detailed description' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 150.5, description: 'Quantity needed in ml' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    quantity?: number;

    @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH'], example: 'HIGH', description: 'Urgency level' })
    @IsOptional()
    @IsString()
    urgency?: string;

    @ApiPropertyOptional({ example: '2024-01-20T10:00:00.000Z', description: 'When milk is needed by' })
    @IsOptional()
    @IsDateString()
    neededBy?: string;

    @ApiPropertyOptional({ example: 'Willing to travel up to 10km', description: 'Additional notes' })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateMilkRequestDto extends PartialType(CreateMilkRequestDto) {
    @ApiPropertyOptional({ enum: RequestStatus, example: RequestStatus.ACCEPTED, description: 'Request status' })
    @IsOptional()
    @IsEnum(RequestStatus)
    status?: RequestStatus;

    @ApiPropertyOptional({ example: 'Updated title', description: 'Updated request title' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ example: 'Updated description', description: 'Updated detailed description' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 200.5, description: 'Updated quantity needed in ml' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    quantity?: number;

    @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH'], example: 'MEDIUM', description: 'Updated urgency level' })
    @IsOptional()
    @IsString()
    urgency?: string;

    @ApiPropertyOptional({ example: '2024-01-25T10:00:00.000Z', description: 'Updated when milk is needed by' })
    @IsOptional()
    @IsDateString()
    neededBy?: string;

    @ApiPropertyOptional({ example: 'Updated notes', description: 'Updated additional notes' })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class AcceptRequestDto {
    @ApiPropertyOptional({ example: 'I can help with this request', description: 'Message to requester' })
    @IsOptional()
    @IsString()
    message?: string;
}

export class UpdateAvailabilityDto {
    @ApiProperty({ example: true, description: 'Donor availability status' })
    @IsBoolean()
    isAvailable: boolean;
}

export class DonorSearchFiltersDto {
    @ApiPropertyOptional({ example: 10, description: 'Maximum distance in km' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(1000)
    maxDistance?: number;

    @ApiPropertyOptional({ example: true, description: 'Filter by medical record sharing willingness' })
    @IsOptional()
    @IsBoolean()
    ableToShareMedicalRecord?: boolean;

    @ApiPropertyOptional({ example: true, description: 'Filter by availability status' })
    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;

    @ApiPropertyOptional({ example: 'O+', description: 'Filter by blood group' })
    @IsOptional()
    @IsString()
    bloodGroup?: string;

    @ApiPropertyOptional({ example: 1, description: 'Page number' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ example: 10, description: 'Items per page' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;
}

export class RequestFiltersDto {
    @ApiPropertyOptional({ enum: RequestStatus, description: 'Filter by request status' })
    @IsOptional()
    @IsEnum(RequestStatus)
    status?: RequestStatus;

    @ApiPropertyOptional({ enum: RequestType, description: 'Filter by request type' })
    @IsOptional()
    @IsEnum(RequestType)
    requestType?: RequestType;

    @ApiPropertyOptional({ example: 'HIGH', description: 'Filter by urgency level' })
    @IsOptional()
    @IsString()
    urgency?: string;

    @ApiPropertyOptional({ example: 1, description: 'Page number' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ example: 10, description: 'Items per page' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;
}

// Response DTOs
export class DonorSearchResultDto {
    @ApiProperty({ description: 'Donor user information' })
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

    @ApiProperty({
        example: 5.2,
        description: 'Distance from buyer to donor in kilometers (sorted shortest to longest)'
    })
    distance: number;

    @ApiProperty({
        example: '5.2 km away',
        description: 'Human-readable distance information'
    })
    distanceText: string;

    @ApiProperty({ example: false, description: 'Whether donor has accepted any pending request from this user' })
    hasAcceptedRequest: boolean;

    @ApiProperty({ description: 'Complete location information with coordinates' })
    location: {
        zipcode: string;
        placeName: string;
        country: string;
        latitude: number;
        longitude: number;
        fullAddress: string;
    };
}

export class MilkRequestResponseDto {
    @ApiProperty({ description: 'Request details' })
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

    @ApiProperty({ description: 'Requester information' })
    requester: {
        id: number;
        name: string;
        email: string;
        userType: UserType;
    };

    @ApiPropertyOptional({ description: 'Donor information (when accepted)' })
    donor?: {
        id: number;
        name: string;
        email: string;
        userType: UserType;
    };
}

export class NotificationDto {
    @ApiProperty({ description: 'Notification details' })
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    sentAt: Date;
    createdAt: Date;

    @ApiPropertyOptional({ description: 'Related request (if any)' })
    request?: {
        id: number;
        title: string;
        status: RequestStatus;
    };
}
